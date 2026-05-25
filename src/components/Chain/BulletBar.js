function pct(v, max) {
  if (!Number.isFinite(v) || !max) return 0;
  return Math.min(100, (v / max) * 100);
}

export default function BulletBar({ p50, p95, p99, max, isLeader = false }) {
  const palette = isLeader
    ? { p99: 'bg-emerald-950', p95: 'bg-emerald-700', p50: 'bg-emerald-500' }
    : { p99: 'bg-slate-800',   p95: 'bg-slate-600',   p50: 'bg-slate-400' };

  return (
    <div
      className="relative h-6 w-full rounded overflow-hidden"
      style={{ background: '#0a0d18' }}
      aria-hidden
    >
      <div className={`absolute inset-y-0 left-0 ${palette.p99}`} style={{ width: `${pct(p99, max)}%` }} />
      <div className={`absolute inset-y-0 left-0 ${palette.p95}`} style={{ width: `${pct(p95, max)}%` }} />
      <div className={`absolute inset-y-1 left-0 ${palette.p50}`} style={{ width: `${pct(p50, max)}%` }} />
    </div>
  );
}
