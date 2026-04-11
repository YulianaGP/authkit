import { RegisterForm } from "@/components/auth/register-form"

export const metadata = { title: "Create account — AuthKit" }

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Get started with a free account today
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
