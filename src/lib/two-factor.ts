import * as OTPAuth from "otpauth"
import QRCode from "qrcode"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"

const ISSUER = "AuthKit"
const RECOVERY_CODE_COUNT = 8

// ---------------------------------------------------------------------------
// Generate a new TOTP secret + QR code data URL
// ---------------------------------------------------------------------------

export function generateTOTPSecret(email: string) {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret(),
  })

  return {
    secret: totp.secret.base32,
    otpauthUrl: totp.toString(),
  }
}

export async function generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, { width: 200, margin: 2 })
}

// ---------------------------------------------------------------------------
// Verify a TOTP code against a secret
// ---------------------------------------------------------------------------

export function verifyTOTPCode(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  // window: 1 = accept 1 period before/after to handle clock drift
  const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 })
  return delta !== null
}

// ---------------------------------------------------------------------------
// Recovery codes — generated once, shown once, stored hashed
// ---------------------------------------------------------------------------

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-")
  )
}

export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)))
}

export async function verifyRecoveryCode(
  code: string,
  hashes: string[]
): Promise<number | null> {
  for (let i = 0; i < hashes.length; i++) {
    const match = await bcrypt.compare(code.replace(/[\s-]/g, "").toUpperCase(), hashes[i])
    if (match) return i
  }
  return null
}
