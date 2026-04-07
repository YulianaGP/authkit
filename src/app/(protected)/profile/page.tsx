"use client"

import { useState } from "react"
import { TwoFactorSetup } from "@/components/auth/two-factor-setup"
import { RecoveryCodesDisplay } from "@/components/auth/recovery-codes-display"

export default function ProfilePage() {
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [twoFactorDone, setTwoFactorDone] = useState(false)

  if (recoveryCodes && !twoFactorDone) {
    return (
      <div className="p-8 max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          Save your recovery codes
        </h1>
        <RecoveryCodesDisplay
          codes={recoveryCodes}
          onDone={() => setTwoFactorDone(true)}
        />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="font-medium">Two-factor authentication</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Protect your account with an authenticator app
          </p>
        </div>
        {twoFactorDone ? (
          <p className="text-sm text-green-600 font-medium">
            ✓ Two-factor authentication is enabled
          </p>
        ) : (
          <TwoFactorSetup onEnabled={(codes) => setRecoveryCodes(codes)} />
        )}
      </div>
    </div>
  )
}
