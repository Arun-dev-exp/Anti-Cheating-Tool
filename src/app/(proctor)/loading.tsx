export default function ProctorLoading() {
  return (
    <main className="p-6 lg:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-bg-surface/40" />
        <div>
          <div className="h-5 w-48 bg-bg-surface/40 rounded-lg mb-2" />
          <div className="h-3 w-64 bg-bg-surface/30 rounded-lg" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[120px] rounded-xl bg-bg-surface/30 border border-border-subtle/30"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-[400px] rounded-xl bg-bg-surface/20 border border-border-subtle/20" />
    </main>
  );
}
