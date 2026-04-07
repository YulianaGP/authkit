"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RecoveryCodesDisplayProps {
  codes: string[]
  onDone: () => void
}

export function RecoveryCodesDisplay({ codes, onDone }: RecoveryCodesDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          <strong>Save these recovery codes now.</strong> They won&apos;t be shown again.
          If you lose your phone, use one of these to sign in.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border bg-muted p-4 grid grid-cols-2 gap-2">
        {codes.map((code) => (
          <code key={code} className="font-mono text-sm text-center py-1">
            {code}
          </code>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1">
          {copied ? "Copied!" : "Copy all"}
        </Button>
        <Button onClick={onDone} className="flex-1">
          I&apos;ve saved them
        </Button>
      </div>
    </div>
  )
}
