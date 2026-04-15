import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = { title: "Reset password — AuthKit" }

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await props.searchParams

  if (!token) {
    return (
      <div className="rounded-2xl border bg-card p-8 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  )
}
