"use client"

import { useEffect, useState, useTransition } from "react"
import { getAuditLogs, logoutAllDevices } from "@/actions/sessions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>[number]

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function DeviceIcon({ device }: { device?: string | null }) {
  if (device === "mobile") return <span aria-hidden>📱</span>
  if (device === "tablet") return <span aria-hidden>📟</span>
  return <span aria-hidden>💻</span>
}

function ActionBadge({ action }: { action: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    LOGIN: "default",
    LOGIN_FAILED: "destructive",
    REGISTER: "secondary",
    PASSWORD_RESET: "secondary",
    TWO_FACTOR_ENABLED: "secondary",
  }
  const labels: Record<string, string> = {
    LOGIN: "Sign in",
    LOGIN_FAILED: "Failed attempt",
    REGISTER: "Registered",
    LOGOUT: "Signed out",
    LOGOUT_ALL: "Signed out all",
    PASSWORD_RESET: "Password reset",
    EMAIL_VERIFIED: "Email verified",
    TWO_FACTOR_ENABLED: "2FA enabled",
    TWO_FACTOR_DISABLED: "2FA disabled",
    SESSION_REVOKED: "Session revoked",
  }
  return (
    <Badge variant={variants[action] ?? "secondary"}>
      {labels[action] ?? action.toLowerCase().replace(/_/g, " ")}
    </Badge>
  )
}

export default function SessionsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data)
      setLoading(false)
    })
  }, [])

  const handleLogoutAll = () => {
    startTransition(async () => {
      const res = await logoutAllDevices()
      setResult(res ?? null)
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recent sign-in activity on your account
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogoutAll}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </Button>
      </div>

      {result?.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
      {result?.success && (
        <Alert>
          <AlertDescription>{result.success}</AlertDescription>
        </Alert>
      )}

      {/* Log list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 animate-pulse bg-muted h-16" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No activity recorded yet
        </p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="rounded-2xl border p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">
                  <DeviceIcon device={log.device} />
                </span>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ActionBadge action={log.action} />
                    {log.browser && (
                      <span className="text-sm font-medium truncate">{log.browser}</span>
                    )}
                    {log.os && (
                      <span className="text-sm text-muted-foreground truncate">{log.os}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {(log.city || log.country) && (
                      <span>{[log.city, log.country].filter(Boolean).join(", ")}</span>
                    )}
                    {log.ip && log.ip !== "unknown" && (
                      <span className="font-mono">{log.ip}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground sm:shrink-0 pl-8 sm:pl-0">
                {timeAgo(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
