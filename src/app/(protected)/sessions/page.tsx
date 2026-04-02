// Session 5 — Active sessions list (device, browser, IP, location, last active)
export default function SessionsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Active sessions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your logged-in devices
      </p>
      {/* TODO: SessionList, RevokeButton, LogoutAllButton (Session 5) */}
    </div>
  )
}
