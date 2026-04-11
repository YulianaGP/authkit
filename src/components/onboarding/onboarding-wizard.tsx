"use client"

import { useActionState, useState } from "react"
import { completeOnboarding } from "@/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STEPS = ["Welcome", "Your name", "You're all set"]

export function OnboardingWizard({ email }: { email: string }) {
  const [step, setStep] = useState(0)
  const [state, formAction, isPending] = useActionState(completeOnboarding, null)

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((label, i) => (
            <span key={i} className={i === step ? "text-foreground font-medium" : ""}>
              {label}
            </span>
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to AuthKit</h1>
            <p className="text-sm text-muted-foreground">
              Let&apos;s set up your account in a few quick steps. You&apos;re signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
          <Button className="w-full" onClick={() => setStep(1)}>
            Get started
          </Button>
        </div>
      )}

      {/* Step 1 — Name */}
      {step === 1 && (
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">What&apos;s your name?</h1>
            <p className="text-sm text-muted-foreground">
              This is how you&apos;ll appear in the app.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Display name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              autoFocus
              required
              disabled={isPending}
            />
          </div>
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(0)} disabled={isPending}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving…" : "Continue"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
