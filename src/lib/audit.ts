import { UAParser } from "ua-parser-js"
import type { IncomingHttpHeaders } from "http"
import { db } from "@/lib/db"
import type { AuditAction } from "@prisma/client"

// ---------------------------------------------------------------------------
// Extract geo from Vercel headers (free + zero latency in production)
// Falls back to ip-api.com for other hosts
// ---------------------------------------------------------------------------

async function getGeoFromIP(ip: string): Promise<{ country?: string; city?: string }> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,countryCode`, {
      next: { revalidate: 3600 }, // cache 1 hour
    })
    if (!res.ok) return {}
    const data = await res.json()
    return { country: data.countryCode, city: data.city }
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Parse device info from User-Agent string
// ---------------------------------------------------------------------------

function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const device = parser.getDevice()

  const browserStr = [browser.name, browser.version?.split(".")[0]]
    .filter(Boolean)
    .join(" ")

  const osStr = [os.name, os.version].filter(Boolean).join(" ")

  const deviceType =
    device.type === "mobile"
      ? "mobile"
      : device.type === "tablet"
        ? "tablet"
        : "desktop"

  return { browser: browserStr || undefined, os: osStr || undefined, device: deviceType }
}

// ---------------------------------------------------------------------------
// Create an audit log entry
// ---------------------------------------------------------------------------

interface AuditLogOptions {
  userId: string
  action: AuditAction
  headers: Headers | IncomingHttpHeaders
  success?: boolean
  metadata?: Record<string, unknown>
}

export async function createAuditLog({
  userId,
  action,
  headers,
  success = true,
  metadata,
}: AuditLogOptions) {
  try {
    const headersObj = headers as Headers

    // IP — Vercel sets x-forwarded-for
    const ip =
      headersObj.get?.("x-forwarded-for")?.split(",")[0].trim() ??
      headersObj.get?.("x-real-ip") ??
      "unknown"

    // Geo — Vercel headers first (instant), then ip-api fallback
    const vercelCountry = headersObj.get?.("x-vercel-ip-country") ?? undefined
    const vercelCity = headersObj.get?.("x-vercel-ip-city") ?? undefined

    let country = vercelCountry
    let city = vercelCity

    if (!country && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      const geo = await getGeoFromIP(ip)
      country = geo.country
      city = geo.city
    }

    // Device / browser
    const userAgent = headersObj.get?.("user-agent") ?? ""
    const { browser, os, device } = parseUserAgent(userAgent)

    await db.auditLog.create({
      data: {
        userId,
        action,
        ip,
        userAgent,
        country,
        city,
        browser,
        os,
        device,
        success,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    })
  } catch (err) {
    console.error("[AuditLog] Failed to write:", err)
  }
}
