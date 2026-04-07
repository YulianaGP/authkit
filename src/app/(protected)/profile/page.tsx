"use client"

import { useState } from "react"
import { TwoFactorSetup } from "@/components/auth/two-factor-setup"
import { RecoveryCodesDisplay } from "@/components/auth/recovery-codes-display"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [twoFactorDone, setTwoFactorDone] = useState(false)

  if (recoveryCodes && !twoFactorDone) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
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
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* 2FA section */}
      <div className="rounded-xl border p-4 sm:p-6 space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Two-factor authentication</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Protect your account with an authenticator app
            </p>
          </div>
          {twoFactorDone && (
            <Badge className="w-fit">Enabled</Badge>
          )}
        </div>

        {twoFactorDone ? (
          <p className="text-sm text-muted-foreground">
            Your account is protected with TOTP 2FA.
          </p>
        ) : (
          <TwoFactorSetup onEnabled={(codes) => setRecoveryCodes(codes)} />
        )}
      </div>
    </div>
  )
}
