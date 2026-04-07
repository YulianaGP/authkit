"use server"

import { auth } from "@/auth"
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
// Revoke a specific DB session
// ---------------------------------------------------------------------------

export async function revokeSession(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  // Ensure the session belongs to the current user
  const target = await db.session.findUnique({ where: { id: sessionId } })
  if (!target || target.userId !== session.user.id) {
    return { error: "Session not found" }
  }

  await db.session.delete({ where: { id: sessionId } })
  return { success: "Session revoked" }
}

// ---------------------------------------------------------------------------
// Logout all devices — delete every session for the current user
// ---------------------------------------------------------------------------

export async function logoutAllDevices() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  await db.session.deleteMany({ where: { userId: session.user.id } })
  return { success: "All sessions revoked" }
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
      _count: { select: { sessions: true, auditLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
