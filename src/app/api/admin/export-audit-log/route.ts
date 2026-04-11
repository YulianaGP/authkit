import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  })

  const header = ["Date", "User", "Email", "Action", "IP", "Country", "City", "Device", "Browser", "OS", "Success"]

  const rows = logs.map((log) => [
    new Date(log.createdAt).toISOString(),
    log.user.name ?? "",
    log.user.email ?? "",
    log.action,
    log.ip ?? "",
    log.country ?? "",
    log.city ?? "",
    log.device ?? "",
    log.browser ?? "",
    log.os ?? "",
    log.success ? "true" : "false",
  ])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
