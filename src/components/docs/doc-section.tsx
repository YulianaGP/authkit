"use client"

import { useState } from "react"

interface DocSectionProps {
  id: string
  title: string
  description: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function DocSection({ id, title, description, children, defaultOpen = false }: DocSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section id={id} className="rounded-2xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="space-y-0.5">
          <h2 className="font-semibold text-base">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className={`text-muted-foreground transition-transform duration-200 ml-4 shrink-0 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 border-t space-y-5">
          {children}
        </div>
      )}
    </section>
  )
}
