import { auth } from "@/auth"
import { redirect } from "next/navigation"

// Session 5 — Admin panel (ADMIN role only, double-checked here + proxy.ts)
export default async function AdminPage() {
  const session = await auth()

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        User management and session oversight
      </p>
      {/* TODO: UserTable, SessionManagement (Session 5) */}
    </div>
  )
}
