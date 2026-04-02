import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back, {session?.user?.name ?? session?.user?.email}
      </p>
      {/* TODO: Dashboard widgets (Session 5+) */}
    </div>
  )
}
