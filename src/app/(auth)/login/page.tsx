import { LoginForm } from "@/components/auth/login-form"

export const metadata = { title: "Sign in — AuthKit" }

export default function LoginPage() {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
