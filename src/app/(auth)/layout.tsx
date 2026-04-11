import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 py-12">
      {/* Brand mark */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 group"
      >
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm group-hover:bg-primary/90 transition-colors">
          A
        </div>
        <span className="font-semibold text-sm tracking-tight">AuthKit</span>
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
