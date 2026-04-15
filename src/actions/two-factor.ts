"use server"

import { auth, signIn } from "@/auth"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import {
  generateTOTPSecret,
  generateQRCodeDataURL,
  verifyTOTPCode,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyRecoveryCode,
} from "@/lib/two-factor"

type ActionResult = { error: string } | { success: string }

// ---------------------------------------------------------------------------
// Step 1 — Generate secret + QR code to show the user
// ---------------------------------------------------------------------------

export async function setup2FA(): Promise<
  { error: string } | { secret: string; qrCodeUrl: string }
> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: "User not found" }
  if (user.twoFactorEnabled) return { error: "2FA is already enabled" }

  const { secret, otpauthUrl } = generateTOTPSecret(user.email!)
  const qrCodeUrl = await generateQRCodeDataURL(otpauthUrl)

  // Store the secret temporarily — not enabled until user verifies
  await db.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret },
  })

  return { secret, qrCodeUrl }
}

// ---------------------------------------------------------------------------
// Step 2 — Verify first code and activate 2FA + generate recovery codes
// ---------------------------------------------------------------------------

export async function enable2FA(
  code: string
): Promise<{ error: string } | { success: string; recoveryCodes: string[] }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.twoFactorSecret) return { error: "Setup 2FA first" }
  if (user.twoFactorEnabled) return { error: "2FA is already enabled" }

  const isValid = verifyTOTPCode(user.twoFactorSecret, code)
  if (!isValid) return { error: "Invalid code. Try again." }

  // Generate 8 recovery codes, store them hashed
  const recoveryCodes = generateRecoveryCodes()
  const hashes = await hashRecoveryCodes(recoveryCodes)

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    }),
    db.recoveryCode.createMany({
      data: hashes.map((codeHash) => ({ userId: user.id, codeHash })),
    }),
  ])

  return { success: "2FA enabled successfully", recoveryCodes }
}

// ---------------------------------------------------------------------------
// Disable 2FA
// ---------------------------------------------------------------------------

export async function disable2FA(code: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.twoFactorEnabled) return { error: "2FA is not enabled" }
  if (!user.twoFactorSecret) return { error: "2FA secret not found" }

  const isValid = verifyTOTPCode(user.twoFactorSecret, code)
  if (!isValid) return { error: "Invalid code. Try again." }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    }),
    db.recoveryCode.deleteMany({ where: { userId: user.id } }),
  ])

  return { success: "2FA disabled" }
}

// ---------------------------------------------------------------------------
// Verify 2FA during login (called from the two-factor page)
// ---------------------------------------------------------------------------

export async function verifyTwoFactor(
  userId: string,
  code: string
): Promise<ActionResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      recoveryCodes: { where: { usedAt: null } },
    },
  })

  if (!user?.twoFactorSecret) return { error: "2FA not configured" }

  // Try TOTP code first
  const isTOTP = verifyTOTPCode(user.twoFactorSecret, code)
  if (isTOTP) return { success: "ok" }

  // Try recovery codes
  const hashes = user.recoveryCodes.map((rc) => rc.codeHash)
  const matchIndex = await verifyRecoveryCode(code, hashes)

  if (matchIndex === null) return { error: "Invalid code. Try again." }

  // Mark recovery code as used
  const usedCode = user.recoveryCodes[matchIndex]
  await db.recoveryCode.update({
    where: { id: usedCode.id },
    data: { usedAt: new Date() },
  })

  return { success: "ok" }
}

// ---------------------------------------------------------------------------
// Complete login after 2FA — reads credentials from temp cookies, calls signIn
// ---------------------------------------------------------------------------

export async function completeTwoFactorLogin(
  userId: string,
  code: string,
  callbackUrl: string = "/dashboard"
): Promise<ActionResult> {
  // 1. Verify the 2FA code
  const result = await verifyTwoFactor(userId, code)
  if ("error" in result) return result

  // 2. Read credentials stored during the initial login attempt
  const cookieStore = await cookies()
  const email = cookieStore.get("authkit_2fa_email")?.value
  const password = cookieStore.get("authkit_2fa_password")?.value
  if (!email || !password) return { error: "Session expired. Please sign in again." }

  // 3. Clear the temporary cookies
  cookieStore.delete("authkit_2fa_email")
  cookieStore.delete("authkit_2fa_password")

  // 4. Complete the NextAuth sign-in — throws NEXT_REDIRECT on success
  await signIn("credentials", { email, password, redirectTo: callbackUrl })

  return { success: "ok" }
}

