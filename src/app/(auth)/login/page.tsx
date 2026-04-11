import { LoginForm } from "@/components/auth/login-form"

export const metadata = { title: "Sign in — AuthKit" }

export default function LoginPage() {
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
