"use client"

import { Button } from "@/components/ui/button"

export function ExportCsvButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.open("/api/admin/export-audit-log", "_blank")}
    >
      Export CSV
    </Button>
  )
}
