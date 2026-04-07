"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { setup2FA, enable2FA } from "@/actions/two-factor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

interface TwoFactorSetupProps {
  onEnabled: (recoveryCodes: string[]) => void
}

export function TwoFactorSetup({ onEnabled }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"idle" | "scan" | "verify">("idle")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleStart = () => {
    setError("")
    startTransition(async () => {
      const res = await setup2FA()
      if ("error" in res) {
        setError(res.error)
        return
      }
      setQrCodeUrl(res.qrCodeUrl)
      setSecret(res.secret)
      setStep("scan")
    })
  }

  const handleVerify = () => {
    setError("")
    startTransition(async () => {
      const res = await enable2FA(code)
      if ("error" in res) {
        setError(res.error)
        return
      }
      onEnabled(res.recoveryCodes)
    })
  }

  if (step === "idle") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account. You&apos;ll need an authenticator
          app like Google Authenticator, Authy, or 1Password.
        </p>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={handleStart} disabled={isPending}>
          {isPending ? "Setting up…" : "Set up 2FA"}
        </Button>
      </div>
    )
  }

  if (step === "scan") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
        </p>
        <div className="flex justify-center">
          <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} unoptimized />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Can&apos;t scan? Enter this code manually:</p>
          <code className="block rounded bg-muted px-3 py-2 text-xs font-mono break-all">
            {secret}
          </code>
        </div>
        <div className="space-y-2">
          <Label htmlFor="totp-code">Verification code</Label>
          <Input
            id="totp-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoComplete="one-time-code"
            inputMode="numeric"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={handleVerify} disabled={isPending || code.length !== 6} className="w-full">
          {isPending ? "Verifying…" : "Activate 2FA"}
        </Button>
      </div>
    )
  }

  return null
}
