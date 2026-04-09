"use client"

import { useState } from "react"
import { TwoFactorSetup } from "@/components/auth/two-factor-setup"
import { RecoveryCodesDisplay } from "@/components/auth/recovery-codes-display"
import { Badge } from "@/components/ui/badge"

export function TwoFactorSection() {
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [done, setDone] = useState(false)

  if (recoveryCodes && !done) {
    return (
      <RecoveryCodesDisplay
        codes={recoveryCodes}
        onDone={() => setDone(true)}
      />
    )
  }

  if (done) {
    return (
      <div className="flex items-center gap-2">
        <Badge>Enabled</Badge>
        <span className="text-sm text-muted-foreground">Your account is protected with TOTP 2FA.</span>
      </div>
    )
  }

  return <TwoFactorSetup onEnabled={(codes) => setRecoveryCodes(codes)} />
}
