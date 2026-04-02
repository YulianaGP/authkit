// Session 2 — Reset password form (receives token via searchParams)
export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await props.searchParams

  if (!token) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This reset link is invalid or has expired.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a new password for your account
      </p>
      {/* TODO: ResetPasswordForm component (Session 2) */}
    </div>
  )
}
