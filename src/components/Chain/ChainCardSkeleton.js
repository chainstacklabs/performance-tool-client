export default function ChainCardSkeleton({ chain, rows = 4 }) {
  return (
    <section
      className="border border-gray-800 rounded-xl p-6 animate-pulse"
      style={{ background: '#0b0f1f' }}
    >
      <div className="flex justify-between items-baseline mb-5">
        <div className="h-7 w-32 bg-gray-800 rounded" />
        <div className="h-4 w-24 bg-gray-800 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-32 sm:w-44 h-4 bg-gray-800 rounded" />
            <div className="flex-1 h-6 bg-gray-800/70 rounded" />
            <div className="hidden sm:block w-20 h-4 bg-gray-800 rounded" />
            <div className="w-16 sm:w-20 h-4 bg-gray-800 rounded" />
            <div className="w-16 sm:w-20 h-4 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading {chain?.name ?? 'chain'}…</span>
    </section>
  );
}
