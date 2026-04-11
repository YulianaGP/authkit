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

  const firstName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
            {user?.role}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a summary of your account
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 space-y-2 hover:border-primary/30 transition-colors">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
          <p className="font-medium truncate text-sm">{user?.email}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-2 hover:border-primary/30 transition-colors">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Two-factor auth</p>
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${user?.twoFactorEnabled ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            <p className="font-medium text-sm">{user?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-2 hover:border-primary/30 transition-colors">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
          <p className="font-medium text-sm">{user?.role}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <p className="text-sm font-medium">Quick links</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: "/profile", label: "Edit profile" },
            { href: "/sessions", label: "View activity" },
            ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin panel" }] : []),
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-border"
            >
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
