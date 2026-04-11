import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = { title: "Forgot password — AuthKit" }

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
