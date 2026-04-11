/**
 * AuthKit — Database Seed
 *
 * Creates the initial ADMIN user from environment variables.
 * Run with: npx prisma db seed
 *
 * Required env vars (add to .env or .env.local):
 *   SEED_ADMIN_EMAIL    — email for the admin account
 *   SEED_ADMIN_PASSWORD — password (min 8 chars, 1 uppercase, 1 number)
 *   SEED_ADMIN_NAME     — display name (optional, defaults to "Admin")
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME ?? "Admin"

  if (!email || !password) {
    console.error("❌  Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in environment.")
    console.error("    Add them to your .env file and try again.")
    process.exit(1)
  }

  const existing = await db.user.findUnique({ where: { email } })

  if (existing) {
    // If user exists but is not admin, promote them
    if (existing.role !== "ADMIN") {
      await db.user.update({
        where: { email },
        data: { role: "ADMIN" },
      })
      console.log(`✅  Promoted ${email} to ADMIN.`)
    } else {
      console.log(`ℹ️   ${email} is already an ADMIN. Nothing to do.`)
    }
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: new Date(), // pre-verified — no email confirmation needed
      role: "ADMIN",
    },
  })

  console.log(`✅  Admin user created: ${email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
