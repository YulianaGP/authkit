"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { headers, cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { signIn, signOut } from "@/auth"
import { loginRatelimit, passwordResetRatelimit } from "@/lib/rate-limit"
import { createAuditLog } from "@/lib/audit"
import {
  generateVerificationToken,
  generatePasswordResetToken,
  getVerificationToken,
  getPasswordResetToken,
} from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail, isDemoMode } from "@/lib/mail"
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

  if (isDemoMode) {
    await db.user.create({
      data: { name, email, password: hashedPassword, emailVerified: new Date() },
    })
    return { success: "Account created! You can sign in now." }
  }

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

// Used by useActionState — receives FormData from a native form action
export async function loginFormAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult | null> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const parsed = LoginSchema.safeParse({ email, password })
  if (!parsed.success) return { error: "Invalid fields" }

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

  const user = await db.user.findUnique({ where: { email: parsed.data.email } })

  if (!user || !user.password) {
    return { error: "Invalid email or password" }
  }

  // Check account lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60)
    return { error: `Account locked. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` }
  }

  if (!user.emailVerified) {
    const verification = await generateVerificationToken(parsed.data.email)
    await sendVerificationEmail(parsed.data.email, verification.token)
    return { error: "Email not verified. A new verification link has been sent." }
  }

  const passwordMatch = await bcrypt.compare(parsed.data.password, user.password)
  if (!passwordMatch) {
    const attempts = user.failedLoginAttempts + 1
    const lockout = attempts >= 10
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: lockout ? new Date(Date.now() + 30 * 60 * 1000) : undefined,
      },
    })
    await createAuditLog({ userId: user.id, action: "LOGIN_FAILED", headers: headersList, success: false })
    if (lockout) return { error: "Too many failed attempts. Account locked for 30 minutes." }
    return { error: "Invalid email or password" }
  }

  // Reset lockout counters on successful login
  if (user.failedLoginAttempts > 0) {
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
  }

  if (user.twoFactorEnabled) {
    const cookieStore = await cookies()
    const opts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    }
    cookieStore.set("authkit_2fa_email", parsed.data.email, opts)
    cookieStore.set("authkit_2fa_password", parsed.data.password, opts)
    redirect(`/two-factor?userId=${user.id}`)
  }

  await createAuditLog({ userId: user.id, action: "LOGIN", headers: headersList })

  // signIn with redirectTo throws NEXT_REDIRECT — Next.js converts it to a
  // proper HTTP redirect response that includes the Set-Cookie header
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  })

  return null
}

export async function login(data: LoginInput): Promise<ActionResult | undefined> {
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

  // Check account lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60)
    return { error: `Account locked. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` }
  }

  if (!user.emailVerified) {
    const verification = await generateVerificationToken(email)
    await sendVerificationEmail(email, verification.token)
    return { error: "Email not verified. A new verification link has been sent." }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    const attempts = user.failedLoginAttempts + 1
    const lockout = attempts >= 10
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: lockout ? new Date(Date.now() + 30 * 60 * 1000) : undefined,
      },
    })
    await createAuditLog({ userId: user.id, action: "LOGIN_FAILED", headers: headersList, success: false })
    if (lockout) return { error: "Too many failed attempts. Account locked for 30 minutes." }
    return { error: "Invalid email or password" }
  }

  // Reset lockout counters on successful login
  if (user.failedLoginAttempts > 0) {
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
  }

  if (user.twoFactorEnabled) {
    redirect(`/two-factor?userId=${user.id}`)
  }

  await createAuditLog({ userId: user.id, action: "LOGIN", headers: headersList })

  await signIn("credentials", { email, password, redirectTo: "/dashboard" })
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
  if (isDemoMode) return { error: "Password reset emails are disabled in demo mode. Use OAuth to sign in." }

  const parsed = ForgotPasswordSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid email address" }

  const { email } = parsed.data

  // Rate limit by IP — 3 requests per hour
  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "anonymous"

  const { success } = await passwordResetRatelimit.limit(ip)
  if (!success) return { error: "Too many requests. Please wait before requesting another reset link." }

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
