import { formatLatency } from '@/lib/format';

function heatColor(value, min, max) {
  if (!Number.isFinite(value)) return 'transparent';
  if (max === min) return 'hsl(140 40% 22%)';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // hue 140 (green) → 0 (red), darker at the high end for dark theme legibility.
  const hue = 140 - 140 * t;
  const sat = 45;
  const light = 28 - 6 * t;
  return `hsl(${hue.toFixed(0)} ${sat}% ${light}%)`;
}

export default function RegionHeatmap({ providers, regions }) {
  if (!providers?.length || !regions?.length) return null;

  const allValues = [];
  for (const p of providers) {
    for (const r of regions) {
      const v = p.regions?.[r];
      if (Number.isFinite(v)) allValues.push(v);
    }
  }
  if (!allValues.length) return null;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return (
    <div className="mt-5">
      <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">
        p95 by region · 24h
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-separate border-spacing-y-1">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-normal pr-3 pb-1">Provider</th>
              {regions.map((r) => (
                <th key={r} className="text-right font-normal pl-3 pb-1">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.name}>
                <td className="text-gray-300 pr-3 truncate max-w-[180px]">{p.name}</td>
                {regions.map((r) => {
                  const v = p.regions?.[r];
                  return (
                    <td
                      key={r}
                      className="text-right text-gray-100 px-2 py-1 rounded"
                      style={{ background: heatColor(v, min, max) }}
                    >
                      {formatLatency(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
