export default function AdminLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-4 w-28 rounded-lg bg-muted" />
      </div>
      <div className="hidden sm:block rounded-2xl border overflow-hidden">
        <div className="h-12 bg-muted" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t px-4 py-3 flex gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-4 w-8 rounded bg-muted ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
