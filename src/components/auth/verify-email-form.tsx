"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { verifyEmail } from "@/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface VerifyEmailFormProps {
  token: string
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)

  useEffect(() => {
    verifyEmail(token).then(setResult)
  }, [token])

  if (!result) {
    return (
      <p className="text-center text-sm text-muted-foreground animate-pulse">
        Verifying your email…
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {result.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
      {result.success && (
        <Alert>
          <AlertDescription>{result.success}</AlertDescription>
        </Alert>
      )}
      <Button asChild className="w-full">
        <Link href="/login">Go to sign in</Link>
      </Button>
    </div>
  )
}
