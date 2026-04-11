import Link from "next/link"
import { DocSection } from "@/components/docs/doc-section"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Docs — AuthKit" }

const NAV = [
  { id: "getting-started", label: "Getting Started" },
  { id: "authentication", label: "Authentication" },
  { id: "two-factor", label: "Two-Factor Auth" },
  { id: "sessions", label: "Sessions & Audit" },
  { id: "roles", label: "Roles & Access" },
  { id: "admin", label: "Admin Panel" },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 h-14 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-sm tracking-tight">AuthKit</span>
          </Link>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="text-sm text-muted-foreground">Docs</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-1.5 rounded-lg"
        >
          Live demo →
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-10 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contents
            </p>
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Intro */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
            <p className="text-muted-foreground">
              AuthKit is a production-ready Next.js authentication template. Everything you need to understand how it works.
            </p>
          </div>

          {/* Getting Started */}
          <DocSection
            id="getting-started"
            title="Getting Started"
            description="Clone, configure environment variables, and run the project"
            defaultOpen
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Clone the repo and install dependencies:</p>
              <CodeBlock language="bash" code={`git clone https://github.com/your-username/authkit.git
cd authkit
npm install`} />

              <p className="text-sm text-muted-foreground">Copy the environment file and fill in your values:</p>
              <CodeBlock language="bash" code="cp .env.example .env.local" />

              <p className="text-sm text-muted-foreground">Required environment variables:</p>
              <CodeBlock language=".env.local" code={`# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://..."        # pooler URL for runtime
DATABASE_URL_UNPOOLED="postgresql://..." # direct URL for migrations

# NextAuth
AUTH_SECRET="your-secret-here"         # generate: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# OAuth providers (optional — only configure what you need)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_DISCORD_ID=""
AUTH_DISCORD_SECRET=""

# Email (optional — omit for demo mode, registration auto-verifies)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="AuthKit <onboarding@resend.dev>"

# Rate limiting (optional — omit to disable)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Admin seed (optional)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="Admin123!"
SEED_ADMIN_NAME="Admin"`} />

              <p className="text-sm text-muted-foreground">Push the database schema and seed the admin user:</p>
              <CodeBlock language="bash" code={`npx prisma db push
npx prisma db seed`} />

              <p className="text-sm text-muted-foreground">Start the development server:</p>
              <CodeBlock language="bash" code="npm run dev" />
            </div>
          </DocSection>

          {/* Authentication */}
          <DocSection
            id="authentication"
            title="Authentication"
            description="Credentials, OAuth providers, email verification, and password reset"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Key files</h3>
                <div className="rounded-xl border overflow-hidden text-sm">
                  {[
                    ["src/auth.ts", "NextAuth v5 config — providers, JWT callbacks, impersonation"],
                    ["src/proxy.ts", "Route protection — replaces middleware.ts in Next.js 16"],
                    ["src/actions/auth.ts", "Server Actions: register, login, logout, forgotPassword, resetPassword, verifyEmail"],
                    ["src/lib/mail.ts", "Email templates via Resend (verification, reset, new location alert)"],
                    ["src/lib/tokens.ts", "Token generation and validation utilities"],
                    ["src/lib/validations/auth.ts", "Zod schemas for all auth forms"],
                  ].map(([file, desc]) => (
                    <div key={file} className="flex flex-col sm:flex-row sm:items-center gap-1 px-4 py-3 border-b last:border-0 hover:bg-muted/50">
                      <code className="text-xs text-primary font-mono shrink-0">{file}</code>
                      <span className="text-xs text-muted-foreground sm:ml-3">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Demo mode</h3>
                <p className="text-sm text-muted-foreground">
                  When <code className="text-xs bg-muted px-1 py-0.5 rounded">RESEND_API_KEY</code> is not set,
                  registration auto-verifies the email and users can sign in immediately.
                  Configure your Resend key to enable the full email flow.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Adding an OAuth provider</h3>
                <CodeBlock language="src/auth.ts" code={`// Add the provider to the providers array
import LinkedIn from "next-auth/providers/linkedin"

providers: [
  // ...existing providers
  LinkedIn({
    clientId: process.env.AUTH_LINKEDIN_ID,
    clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
]`} />
              </div>
            </div>
          </DocSection>

          {/* 2FA */}
          <DocSection
            id="two-factor"
            title="Two-Factor Authentication"
            description="TOTP via authenticator apps + 8 recovery codes"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">How it works</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>User enables 2FA from their Profile page</li>
                  <li>App generates a TOTP secret and displays QR code</li>
                  <li>User scans with Google Authenticator, Authy, or 1Password</li>
                  <li>User confirms with a 6-digit code — 2FA is now active</li>
                  <li>On next login, user is redirected to <code className="text-xs bg-muted px-1 py-0.5 rounded">/two-factor</code> to enter their code</li>
                  <li>8 recovery codes are generated — each can be used once if the device is lost</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Key files</h3>
                <div className="rounded-xl border overflow-hidden text-sm">
                  {[
                    ["src/actions/two-factor.ts", "Setup, verify, and disable 2FA — generate recovery codes"],
                    ["src/components/profile/two-factor-section.tsx", "Profile UI: QR code display, enable/disable flow"],
                    ["src/components/auth/two-factor-form.tsx", "Login interceptor form for entering TOTP code"],
                    ["src/app/(auth)/two-factor/page.tsx", "2FA challenge page after credentials login"],
                  ].map(([file, desc]) => (
                    <div key={file} className="flex flex-col sm:flex-row sm:items-center gap-1 px-4 py-3 border-b last:border-0 hover:bg-muted/50">
                      <code className="text-xs text-primary font-mono shrink-0">{file}</code>
                      <span className="text-xs text-muted-foreground sm:ml-3">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DocSection>

          {/* Sessions */}
          <DocSection
            id="sessions"
            title="Sessions & Audit Log"
            description="Track every login event with device, browser, IP, and location"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">What gets logged</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["LOGIN", "LOGIN_FAILED", "LOGOUT", "LOGOUT_ALL", "REGISTER", "EMAIL_VERIFIED", "PASSWORD_RESET", "TWO_FACTOR_ENABLED", "TWO_FACTOR_DISABLED", "SESSION_REVOKED"].map((action) => (
                    <code key={action} className="text-xs bg-muted px-2 py-1.5 rounded-lg font-mono text-muted-foreground">
                      {action}
                    </code>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Key files</h3>
                <div className="rounded-xl border overflow-hidden text-sm">
                  {[
                    ["src/lib/audit.ts", "createAuditLog — logs action, IP, geo, browser, device, new-location alert"],
                    ["src/actions/sessions.ts", "getAuditLogs, logoutAllDevices"],
                    ["src/app/(protected)/sessions/page.tsx", "Activity page UI — responsive list with device icons"],
                    ["src/app/api/admin/export-audit-log/route.ts", "CSV export of all audit logs (admin only)"],
                  ].map(([file, desc]) => (
                    <div key={file} className="flex flex-col sm:flex-row sm:items-center gap-1 px-4 py-3 border-b last:border-0 hover:bg-muted/50">
                      <code className="text-xs text-primary font-mono shrink-0">{file}</code>
                      <span className="text-xs text-muted-foreground sm:ml-3">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Geolocation</h3>
                <p className="text-sm text-muted-foreground">
                  On Vercel, geo data comes from built-in headers at zero cost. On other hosts,
                  it falls back to <code className="text-xs bg-muted px-1 py-0.5 rounded">ip-api.com</code> (free tier: 1000 req/min).
                </p>
              </div>
            </div>
          </DocSection>

          {/* Roles */}
          <DocSection
            id="roles"
            title="Roles & Access Control"
            description="ADMIN and USER roles enforced at the proxy and page level"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Route protection in proxy.ts</h3>
                <CodeBlock language="src/proxy.ts" code={`// Protected routes require a valid session
const protectedRoutes = ["/dashboard", "/profile", "/sessions", "/admin", "/onboarding"]

// Redirect unauthenticated users to /login
// Redirect authenticated users away from /login and /register
// Redirect non-admin users away from /admin
// Redirect users with onboardingDone=false to /onboarding`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Checking roles in Server Components</h3>
                <CodeBlock language="tsx" code={`import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/dashboard")
  // ...
}`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Adding a MODERATOR role</h3>
                <CodeBlock language="prisma/schema.prisma" code={`enum Role {
  USER
  MODERATOR  // add this
  ADMIN
}`} />
                <p className="text-xs text-muted-foreground">
                  Then run <code className="bg-muted px-1 py-0.5 rounded">npx prisma migrate dev</code> and update <code className="bg-muted px-1 py-0.5 rounded">src/proxy.ts</code> with the new route rules.
                </p>
              </div>
            </div>
          </DocSection>

          {/* Admin */}
          <DocSection
            id="admin"
            title="Admin Panel"
            description="User management, audit log export, and impersonation"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>View all registered users with role, verification status, 2FA, and event count</li>
                  <li>Export full audit log as CSV</li>
                  <li>Impersonate any user — see the app exactly as they see it</li>
                  <li>Red banner while impersonating with one-click exit</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Creating the first admin</h3>
                <CodeBlock language="bash" code={`# Set in .env (not .env.local — prisma db seed reads .env)
SEED_ADMIN_EMAIL="admin@yourdomain.com"
SEED_ADMIN_PASSWORD="YourPassword123!"
SEED_ADMIN_NAME="Admin"

npx prisma db seed`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Key files</h3>
                <div className="rounded-xl border overflow-hidden text-sm">
                  {[
                    ["src/app/(protected)/admin/page.tsx", "Admin panel UI — table (desktop) + cards (mobile)"],
                    ["src/actions/sessions.ts", "getAllUsers — fetches users with role, verification, 2FA, event count"],
                    ["src/actions/impersonate.ts", "startImpersonation, stopImpersonation — cookie-based session substitution"],
                    ["src/app/api/admin/export-audit-log/route.ts", "GET /api/admin/export-audit-log — returns CSV download"],
                  ].map(([file, desc]) => (
                    <div key={file} className="flex flex-col sm:flex-row sm:items-center gap-1 px-4 py-3 border-b last:border-0 hover:bg-muted/50">
                      <code className="text-xs text-primary font-mono shrink-0">{file}</code>
                      <span className="text-xs text-muted-foreground sm:ml-3">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DocSection>
        </main>
      </div>
    </div>
  )
}
