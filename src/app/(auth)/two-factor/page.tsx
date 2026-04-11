import { TwoFactorForm } from "@/components/auth/two-factor-form"

export const metadata = { title: "Two-factor authentication — AuthKit" }

export default async function TwoFactorPage(props: {
  searchParams: Promise<{ userId?: string; callbackUrl?: string }>
}) {
  const { userId, callbackUrl } = await props.searchParams

  if (!userId) {
    return (
      <div className="rounded-2xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invalid request</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in again.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      <TwoFactorForm userId={userId} callbackUrl={callbackUrl} />
    </div>
  )
}
