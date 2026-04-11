export default function DashboardLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border p-4 space-y-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-5 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
