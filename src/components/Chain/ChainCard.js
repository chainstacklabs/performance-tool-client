import { fetchChainData } from '@/lib/chain-data';
import { formatLatency, formatPercent, chainAnchor, regionLabels, regionTitle } from '@/lib/format';
import BulletBar from './BulletBar';
import Sparkline from './Sparkline';

const CARD_BG = '#0b0f1f';

// Per-region p95 cell shading: hue 140 (green) → 0 (red), darker at the high
// end for dark-theme legibility. Scaled against the chain's full range so a
// colour means the same thing in every row.
function heatColor(value, min, max) {
  if (!Number.isFinite(value)) return 'transparent';
  if (max === min) return 'hsl(140 40% 22%)';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const hue = 140 - 140 * t;
  const light = 28 - 6 * t;
  return `hsl(${hue.toFixed(0)} 45% ${light}%)`;
}

export default async function ChainCard({ chain }) {
  const data = await fetchChainData(chain);
  const { providers, regions, error } = data;

  const maxP99 = providers.reduce((m, p) => Math.max(m, p.p99 ?? p.p95 ?? 0), 0);
  const dashboardUrl = `https://chainstack.grafana.net/public-dashboards/${chain.publicToken}?orgId=1&theme=dark`;

  const regionLabel = regionLabels(regions);
  const regionValues = providers.flatMap((p) =>
    regions.map((r) => p.regions?.[r]).filter(Number.isFinite)
  );
  const regionMin = regionValues.length ? Math.min(...regionValues) : 0;
  const regionMax = regionValues.length ? Math.max(...regionValues) : 0;

  return (
    <section
      id={chainAnchor(chain.promName)}
      className="border border-gray-800 rounded-xl p-6 scroll-mt-6"
      style={{ background: CARD_BG }}
    >
      <div className="flex justify-between items-baseline mb-5 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">{chain.name}</h2>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-400 text-sm font-mono"
        >
          Open in Grafana ↗
        </a>
      </div>

      {error && (
        <div className="text-red-400 text-sm font-mono mb-3">
          Data unavailable
        </div>
      )}

      {!error && providers.length === 0 && (
        <div className="text-gray-500 text-sm font-mono">
          No successful samples in the last 24 hours
        </div>
      )}

      {providers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
            {/* Fixed widths on the metric columns keep them identical across
                every chain (so bars start and numbers line up card-to-card,
                regardless of provider-name length); the region columns are
                auto-width and split the remaining space, keeping the heatmap
                flush-right with no gap. */}
            <colgroup>
              <col className="w-[200px]" />
              <col className="w-40" />
              <col className="w-0 sm:w-24" />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-0 sm:w-16" />
              {regions.length > 0 ? (
                regions.map((r) => <col key={r} />)
              ) : (
                <col className="w-full" />
              )}
            </colgroup>
            <thead>
              {regions.length > 0 && (
                <tr className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                  <th className="sticky left-0 z-10" style={{ background: CARD_BG }} />
                  <th />
                  <th className="hidden sm:table-cell" />
                  <th />
                  <th />
                  <th className="hidden sm:table-cell" />
                  <th
                    colSpan={regions.length}
                    className="text-left font-normal px-2 pb-1 border-l border-gray-800"
                  >
                    p95 by region
                  </th>
                </tr>
              )}
              <tr className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                <th
                  className="sticky left-0 z-10 text-left font-normal py-2 pr-4"
                  style={{ background: CARD_BG }}
                >
                  Provider
                </th>
                <th className="text-left font-normal px-3">
                  p50 / p95 / p99
                </th>
                <th className="font-normal px-2 hidden sm:table-cell">p95, 24h</th>
                <th className="text-right font-normal px-2">p50</th>
                <th className="text-right font-normal px-2">p95</th>
                <th className="text-right font-normal px-2 hidden sm:table-cell">
                  p99
                </th>
                {regions.map((r, idx) => (
                  <th
                    key={r}
                    title={regionTitle(r)}
                    className={`text-right font-normal px-2 whitespace-nowrap ${
                      idx === 0 ? 'border-l border-gray-800' : ''
                    }`}
                  >
                    {regionLabel[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <tr key={p.name}>
                  <td
                    className="sticky left-0 z-10 py-2 pr-4 align-middle"
                    style={{ background: CARD_BG }}
                  >
                    <div
                      className={`font-mono truncate ${
                        i === 0 ? 'text-white' : 'text-gray-200'
                      }`}
                    >
                      {p.name}
                    </div>
                    {Number.isFinite(p.success) && (
                      <div
                        title="Success rate, last 24 hours"
                        className={`text-[10px] font-mono ${
                          p.success < 0.999 ? 'text-amber-400' : 'text-gray-600'
                        }`}
                      >
                        {formatPercent(p.success, 2)} ok
                      </div>
                    )}
                  </td>
                  <td className="px-3">
                    <BulletBar
                      p50={p.p50}
                      p95={p.p95}
                      p99={p.p99}
                      max={maxP99}
                      isLeader={i === 0}
                    />
                  </td>
                  <td className="px-2 hidden sm:table-cell">
                    <Sparkline
                      values={p.trend}
                      stroke={i === 0 ? '#10b981' : '#475569'}
                    />
                  </td>
                  <td className="text-right px-2 py-2 font-mono text-gray-300 whitespace-nowrap">
                    {formatLatency(p.p50)}
                  </td>
                  <td className="text-right px-2 py-2 font-mono text-gray-100 whitespace-nowrap">
                    {formatLatency(p.p95)}
                  </td>
                  <td className="text-right px-2 py-2 font-mono text-gray-500 whitespace-nowrap hidden sm:table-cell">
                    {formatLatency(p.p99)}
                  </td>
                  {regions.map((r, idx) => {
                    const v = p.regions?.[r];
                    return (
                      <td
                        key={r}
                        className={`text-right px-2 py-2 font-mono text-gray-100 whitespace-nowrap ${
                          idx === 0 ? 'border-l border-gray-800' : ''
                        }`}
                        style={{ background: heatColor(v, regionMin, regionMax) }}
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
      )}
    </section>
  );
}
