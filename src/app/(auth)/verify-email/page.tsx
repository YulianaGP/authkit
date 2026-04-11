import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export const metadata = { title: "Verify email — AuthKit" }

export default async function VerifyEmailPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await props.searchParams

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm text-center">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {token ? "Confirming your email address…" : "Check your inbox for a verification link"}
        </p>
      </div>
      {token ? (
        <VerifyEmailForm token={token} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or try signing up again.
        </p>
      )}
    </div>
  )
}
