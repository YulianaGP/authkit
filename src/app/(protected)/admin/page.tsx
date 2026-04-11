import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllUsers } from "@/actions/sessions"
import { Badge } from "@/components/ui/badge"
import { ExportCsvButton } from "@/components/admin/export-csv-button"
import { ImpersonateButton } from "@/components/admin/impersonate-button"

export const metadata = { title: "Admin — AuthKit" }

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/dashboard")

  const users = await getAllUsers()

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <ExportCsvButton />
      </div>

      {/* Mobile: card list / Desktop: table */}
      <div className="hidden sm:block rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Events</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-50">{user.name ?? "—"}</p>
                  <p className="text-muted-foreground truncate max-w-50">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.emailVerified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Unverified</Badge>
                    )}
                    {user.twoFactorEnabled && (
                      <Badge variant="secondary">2FA</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{user._count.auditLogs}</td>
                <td className="px-4 py-3 text-right">
                  <ImpersonateButton userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="sm:hidden space-y-3">
        {users.map((user) => (
          <li key={user.id} className="rounded-2xl border p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{user.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="shrink-0">
                {user.role}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.emailVerified ? (
                <Badge variant="secondary">Verified</Badge>
              ) : (
                <Badge variant="destructive">Unverified</Badge>
              )}
              {user.twoFactorEnabled && <Badge variant="secondary">2FA</Badge>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{user._count.auditLogs} event{user._count.auditLogs !== 1 ? "s" : ""}</span>
              <ImpersonateButton userId={user.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
