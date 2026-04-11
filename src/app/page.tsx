import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 h-14 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-semibold text-sm tracking-tight text-foreground">
          AuthKit
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-1.5 rounded-lg"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-8">
          <span className="size-1.5 rounded-full bg-primary inline-block" />
          Production-ready auth template
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground max-w-2xl leading-tight">
          Auth that just{" "}
          <span className="text-primary">works</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
          A complete Next.js authentication starter with social login, 2FA,
          role-based access, session management, and admin tools — ready to ship.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
          <Link
            href="/register"
            className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2.5 rounded-lg text-sm"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="font-medium border hover:bg-muted transition-colors px-6 py-2.5 rounded-lg text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/docs"
            className="font-medium text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Docs
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl w-full text-left">
          {[
            { label: "OAuth Providers", detail: "Google, GitHub, Discord" },
            { label: "Two-Factor Auth", detail: "TOTP authenticator app" },
            { label: "Email Verification", detail: "Token-based flow" },
            { label: "Role-Based Access", detail: "ADMIN / USER roles" },
            { label: "Session Management", detail: "Revoke sessions per device" },
            { label: "Admin Panel", detail: "User management + audit log" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border bg-card p-4 space-y-1">
              <p className="text-sm font-medium">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        AuthKit — Next.js authentication template
      </footer>
    </div>
  )
}
