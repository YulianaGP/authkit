"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { verifyTwoFactor } from "@/actions/two-factor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TwoFactorFormProps {
  userId: string
  callbackUrl?: string
}

export function TwoFactorForm({ userId, callbackUrl = "/dashboard" }: TwoFactorFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isRecovery, setIsRecovery] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await verifyTwoFactor(userId, code)
      if ("error" in res) {
        setError(res.error)
        return
      }
      router.push(callbackUrl)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">
          {isRecovery ? "Recovery code" : "Authenticator code"}
        </Label>
        <Input
          id="code"
          placeholder={isRecovery ? "XXXXX-XXXXX" : "000000"}
          maxLength={isRecovery ? 11 : 6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="one-time-code"
          inputMode={isRecovery ? "text" : "numeric"}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          {isRecovery
            ? "Enter one of your 8-character recovery codes"
            : "Enter the 6-digit code from your authenticator app"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isPending || code.length < 6}>
        {isPending ? "Verifying…" : "Verify"}
      </Button>

      <button
        type="button"
        onClick={() => { setIsRecovery(!isRecovery); setCode(""); setError("") }}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isRecovery ? "Use authenticator app instead" : "Use a recovery code instead"}
      </button>
    </form>
  )
}
