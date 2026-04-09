import Link from "next/link"
import { auth } from "@/auth"
import { logout } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export async function Navbar() {
  const session = await auth()
  if (!session?.user) return null

  const isAdmin = session.user.role === "ADMIN"

  return (
    <header className="border-b bg-background">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left — brand + links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-sm tracking-tight">
            AuthKit
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/sessions" className="hover:text-foreground transition-colors">
              Activity
            </Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">
              Profile
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-foreground transition-colors">
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right — user info + sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground truncate max-w-40">
              {session.user.name ?? session.user.email}
            </span>
            {isAdmin && (
              <Badge variant="default" className="text-xs">Admin</Badge>
            )}
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden flex items-center gap-4 px-4 pb-3 text-sm text-muted-foreground overflow-x-auto">
        <Link href="/dashboard" className="hover:text-foreground transition-colors shrink-0">
          Dashboard
        </Link>
        <Link href="/sessions" className="hover:text-foreground transition-colors shrink-0">
          Activity
        </Link>
        <Link href="/profile" className="hover:text-foreground transition-colors shrink-0">
          Profile
        </Link>
        {isAdmin && (
          <Link href="/admin" className="hover:text-foreground transition-colors shrink-0">
            Admin
          </Link>
        )}
      </nav>
    </header>
  )
}
