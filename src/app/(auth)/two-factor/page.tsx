// Session 4 — 2FA verification step during login
export default function TwoFactorPage() {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app
      </p>
      {/* TODO: TwoFactorForm component (Session 4) */}
    </div>
  )
}
