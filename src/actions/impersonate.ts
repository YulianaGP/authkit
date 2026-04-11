"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function startImpersonation(userId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })
  if (!target) return { error: "User not found" }

  const cookieStore = await cookies()

  // httpOnly — server only, stores target ID
  cookieStore.set("authkit_impersonate_as", target.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  })

  // NOT httpOnly — readable by client for the banner
  cookieStore.set("authkit_impersonate_name", target.name ?? target.email ?? target.id, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  })

  redirect("/dashboard")
}

export async function stopImpersonation() {
  const cookieStore = await cookies()
  cookieStore.delete("authkit_impersonate_as")
  cookieStore.delete("authkit_impersonate_name")
  redirect("/admin")
}
