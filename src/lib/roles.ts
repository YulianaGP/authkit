import type { Session } from "next-auth"
import type { Role } from "@prisma/client"

export function hasRole(session: Session | null, role: Role): boolean {
  if (!session?.user?.role) return false
  const hierarchy: Role[] = ["USER", "MODERATOR", "ADMIN"]
  return hierarchy.indexOf(session.user.role) >= hierarchy.indexOf(role)
}
