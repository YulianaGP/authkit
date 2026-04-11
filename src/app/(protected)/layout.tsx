import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/nav/navbar"
import { ImpersonationBanner } from "@/components/admin/impersonation-banner"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ImpersonationBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
