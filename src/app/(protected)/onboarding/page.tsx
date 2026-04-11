import { auth } from "@/auth"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata = { title: "Welcome — AuthKit" }

export default async function OnboardingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/40">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <OnboardingWizard email={session?.user?.email ?? ""} />
      </div>
    </div>
  )
}
