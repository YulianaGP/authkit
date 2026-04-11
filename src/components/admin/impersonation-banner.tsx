"use client"

import { useEffect, useState } from "react"
import { stopImpersonation } from "@/actions/impersonate"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((c) => c.startsWith("authkit_impersonate_name="))
      ?.split("=")[1]
    if (value) setName(decodeURIComponent(value))
  }, [])

  if (!name) return null

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <span>
        Impersonating <strong>{name}</strong> — you are seeing the app as this user
      </span>
      <form action={stopImpersonation}>
        <Button type="submit" size="sm" className="h-7 text-xs bg-white text-destructive hover:bg-white/90 font-semibold">
          Exit impersonation
        </Button>
      </form>
    </div>
  )
}
