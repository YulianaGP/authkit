import { auth } from "@/auth"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata = { title: "Welcome — AuthKit" }

export default async function OnboardingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <OnboardingWizard email={session?.user?.email ?? ""} />
      </div>
    </div>
  )
}
