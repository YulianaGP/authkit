import { randomBytes } from "crypto"
import { db } from "@/lib/db"

const TOKEN_EXPIRY_HOURS = 24
const RESET_EXPIRY_HOURS = 2

// ---------------------------------------------------------------------------
// Email verification tokens
// ---------------------------------------------------------------------------

export async function generateVerificationToken(email: string) {
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  // Delete any existing token for this email first
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  })

  return db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })
}

export async function getVerificationToken(token: string) {
  return db.verificationToken.findFirst({
    where: { token },
  })
}

// ---------------------------------------------------------------------------
// Password reset tokens
// ---------------------------------------------------------------------------

export async function generatePasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000)

  // Invalidate previous unused tokens for this user
  await db.passwordReset.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  })

  return db.passwordReset.create({
    data: { userId, token, expiresAt },
  })
}

export async function getPasswordResetToken(token: string) {
  return db.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  })
}
