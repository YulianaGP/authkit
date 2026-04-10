import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Dashboard — AuthKit" }

export default async function DashboardPage() {
  const session = await auth()
  const user = await db.user.findUnique({
    where: { id: session!.user!.id },
    select: { name: true, email: true, role: true, twoFactorEnabled: true },
  })

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
            {user?.role}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {user?.name ?? user?.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium truncate">{user?.email}</p>
        </div>
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">2FA</p>
          <p className="font-medium">{user?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
        </div>
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-medium">{user?.role}</p>
        </div>
      </div>
    </div>
  )
}
