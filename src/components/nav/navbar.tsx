import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logout } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export async function Navbar() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true },
  })
  if (!user) return null

  const isAdmin = user.role === "ADMIN"
  const displayName = user.name ?? user.email

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/sessions", label: "Activity" },
    { href: "/profile", label: "Profile" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left — brand + links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs group-hover:bg-primary/90 transition-colors">
              A
            </div>
            <span className="font-semibold text-sm tracking-tight hidden sm:block">AuthKit</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right — user info + actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-1">
            <span className="text-sm text-muted-foreground truncate max-w-40">
              {displayName}
            </span>
            {isAdmin && (
              <Badge variant="default" className="text-xs">Admin</Badge>
            )}
          </div>
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden flex items-center gap-1 px-4 pb-3 text-sm overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
