"use client"

import { useState, useTransition } from "react"
import { TwoFactorSetup } from "@/components/auth/two-factor-setup"
import { RecoveryCodesDisplay } from "@/components/auth/recovery-codes-display"
import { disable2FA } from "@/actions/two-factor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [showDisable, setShowDisable] = useState(false)
  const [code, setCode] = useState("")
  const [result, setResult] = useState<{ error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // After enabling — show recovery codes
  if (recoveryCodes) {
    return (
      <RecoveryCodesDisplay
        codes={recoveryCodes}
        onDone={() => {
          setRecoveryCodes(null)
          setIsEnabled(true)
        }}
      />
    )
  }

  // Already enabled — show status + disable option
  if (isEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge>Enabled</Badge>
          <span className="text-sm text-muted-foreground">
            Your account is protected with TOTP 2FA.
          </span>
        </div>

        {!showDisable ? (
          <Button variant="outline" size="sm" onClick={() => setShowDisable(true)}>
            Disable 2FA
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter your authenticator code to disable 2FA.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="w-32 font-mono"
                disabled={isPending}
              />
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending || code.length < 6}
                onClick={() => {
                  startTransition(async () => {
                    const res = await disable2FA(code)
                    if ("error" in res) {
                      setResult(res)
                    } else {
                      setIsEnabled(false)
                      setShowDisable(false)
                      setCode("")
                      setResult(null)
                    }
                  })
                }}
              >
                {isPending ? "Disabling…" : "Confirm"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowDisable(false); setCode(""); setResult(null) }}
              >
                Cancel
              </Button>
            </div>
            {result?.error && (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    )
  }

  // Not enabled — show setup flow
  return <TwoFactorSetup onEnabled={(codes) => setRecoveryCodes(codes)} />
}
