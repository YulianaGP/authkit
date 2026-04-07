import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Reset password — AuthKit" }

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await props.searchParams

  if (!token) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or has expired.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
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
