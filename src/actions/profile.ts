"use server"

import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import {
  UpdateProfileSchema,
  UpdatePasswordSchema,
  type UpdateProfileInput,
  type UpdatePasswordInput,
} from "@/lib/validations/auth"

type ActionResult = { error: string } | { success: string }

export async function updateProfile(data: UpdateProfileInput): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const parsed = UpdateProfileSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid fields" }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  })

  return { success: "Name updated successfully" }
}

export async function updatePassword(data: UpdatePasswordInput): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const parsed = UpdatePasswordSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return { error: "No password set on this account" }

  const passwordMatch = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!passwordMatch) return { error: "Current password is incorrect" }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12)
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return { success: "Password updated successfully" }
}
