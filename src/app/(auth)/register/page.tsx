import { RegisterForm } from "@/components/auth/register-form"

export const metadata = { title: "Create account — AuthKit" }

export default function RegisterPage() {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
