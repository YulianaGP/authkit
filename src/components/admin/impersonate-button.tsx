"use client"

import { useTransition } from "react"
import { startImpersonation } from "@/actions/impersonate"
import { Button } from "@/components/ui/button"

export function ImpersonateButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs"
      disabled={isPending}
      onClick={() => startTransition(() => startImpersonation(userId))}
    >
      {isPending ? "…" : "Impersonate"}
    </Button>
  )
}
