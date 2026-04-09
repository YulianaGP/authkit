"use server"

import { auth, signOut } from "@/auth"
import { db } from "@/lib/db"

// ---------------------------------------------------------------------------
// Get audit logs for current user (used as "active sessions" history)
// ---------------------------------------------------------------------------

export async function getAuditLogs() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.auditLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

// ---------------------------------------------------------------------------
// Sign out current device (JWT strategy — no DB sessions to delete)
// ---------------------------------------------------------------------------

export async function logoutAllDevices() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  await signOut({ redirectTo: "/login" })
}

// ---------------------------------------------------------------------------
// Admin — get all users with their session count (ADMIN only)
// ---------------------------------------------------------------------------

export async function getAllUsers() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return []

  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      _count: { select: { auditLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
