"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { signIn, signOut } from "@/auth"
import { loginRatelimit } from "@/lib/rate-limit"
import {
  generateVerificationToken,
  generatePasswordResetToken,
  getVerificationToken,
  getPasswordResetToken,
} from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail"
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth"

type ActionResult = { error: string } | { success: string }

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export async function register(data: RegisterInput): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid fields" }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: "An account with this email already exists" }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, email, password: hashedPassword },
  })

  const verification = await generateVerificationToken(email)
  await sendVerificationEmail(email, verification.token)

  return { success: "Check your email to verify your account" }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(data: LoginInput): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid fields" }

  const { email, password } = parsed.data

  // Rate limit by IP — 5 attempts per 15 minutes
  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "anonymous"

  const { success, reset } = await loginRatelimit.limit(ip)

  if (!success) {
    const retryAfterMinutes = Math.ceil((reset - Date.now()) / 1000 / 60)
    return {
      error: `Too many login attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"}.`,
    }
  }

  const user = await db.user.findUnique({ where: { email } })

  if (!user || !user.password) {
    return { error: "Invalid email or password" }
  }

  if (!user.emailVerified) {
    const verification = await generateVerificationToken(email)
    await sendVerificationEmail(email, verification.token)
    return { error: "Email not verified. A new verification link has been sent." }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { error: "Invalid email or password" }
  }

  // If 2FA is enabled, redirect to the verification step before signing in
  if (user.twoFactorEnabled) {
    redirect(`/two-factor?userId=${user.id}`)
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    throw error
  }

  redirect("/dashboard")
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout() {
  await signOut({ redirectTo: "/login" })
}

// ---------------------------------------------------------------------------
// Verify email
// ---------------------------------------------------------------------------

export async function verifyEmail(token: string): Promise<ActionResult> {
  const existingToken = await getVerificationToken(token)

  if (!existingToken) return { error: "Invalid or expired verification link" }
  if (existingToken.expires < new Date()) return { error: "Verification link has expired" }

  const user = await db.user.findUnique({
    where: { email: existingToken.identifier },
  })

  if (!user) return { error: "Account not found" }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  })

  await db.verificationToken.delete({
    where: { identifier_token: { identifier: existingToken.identifier, token } },
  })

  return { success: "Email verified! You can now sign in." }
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

export async function forgotPassword(data: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = ForgotPasswordSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid email address" }

  const { email } = parsed.data

  const user = await db.user.findUnique({ where: { email } })

  // Always return success to avoid revealing if an email exists
  if (!user || !user.password) {
    return { success: "If that email exists, a reset link has been sent." }
  }

  const reset = await generatePasswordResetToken(user.id)
  await sendPasswordResetEmail(email, reset.token)

  return { success: "If that email exists, a reset link has been sent." }
}

// ---------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------

export async function resetPassword(
  token: string,
  data: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = ResetPasswordSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid fields" }

  const existingReset = await getPasswordResetToken(token)

  if (!existingReset) return { error: "Invalid or expired reset link" }
  if (existingReset.usedAt) return { error: "This reset link has already been used" }
  if (existingReset.expiresAt < new Date()) return { error: "Reset link has expired" }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  await db.user.update({
    where: { id: existingReset.userId },
    data: { password: hashedPassword },
  })

  await db.passwordReset.update({
    where: { token },
    data: { usedAt: new Date() },
  })

  return { success: "Password updated. You can now sign in." }
}
