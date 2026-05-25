import { fetchChainData } from '@/lib/chain-data';
import { formatLatency, formatPercent, chainAnchor } from '@/lib/format';
import BulletBar from './BulletBar';
import Sparkline from './Sparkline';
import RegionHeatmap from './RegionHeatmap';

export default async function ChainCard({ chain }) {
  const data = await fetchChainData(chain);
  const { providers, regions, successRate, error } = data;

  const maxP99 = providers.reduce((m, p) => Math.max(m, p.p99 ?? p.p95 ?? 0), 0);
  const dashboardUrl = `https://chainstack.grafana.net/public-dashboards/${chain.publicToken}?orgId=1&theme=dark`;

  return (
    <section
      id={chainAnchor(chain.promName)}
      className="border border-gray-800 rounded-xl p-6 scroll-mt-6"
      style={{ background: '#0b0f1f' }}
    >
      <div className="flex justify-between items-baseline mb-5 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">{chain.name}</h2>
        <div className="flex gap-5 items-baseline">
          {successRate !== null && Number.isFinite(successRate) && (
            <span className="text-gray-400 text-sm font-mono">
              Success {formatPercent(successRate)}
            </span>
          )}
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 text-sm font-mono"
          >
            Open in Grafana ↗
          </a>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm font-mono mb-3">
          Data unavailable: {error}
        </div>
      )}

      {!error && providers.length === 0 && (
        <div className="text-gray-500 text-sm font-mono">
          No successful samples in the last 24h.
        </div>
      )}

      {providers.length > 0 && (
        <>
          <div className="flex items-center text-[10px] uppercase tracking-wider text-gray-500 font-mono mb-2 gap-3 sm:gap-4">
            <div className="w-32 sm:w-44 shrink-0">Provider</div>
            <div className="flex-1">p50 / p95 / p99 · 24h</div>
            <div className="hidden sm:block w-20 text-center">Trend</div>
            <div className="w-16 sm:w-20 text-right">p50</div>
            <div className="w-16 sm:w-20 text-right">p95</div>
            <div className="w-16 sm:w-20 text-right hidden sm:block">p99</div>
          </div>

          <div className="space-y-2">
            {providers.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center gap-3 sm:gap-4 text-sm"
              >
                <div className="w-32 sm:w-44 text-gray-300 font-mono shrink-0 truncate">
                  {p.name}
                </div>
                <div className="flex-1 min-w-0">
                  <BulletBar
                    p50={p.p50}
                    p95={p.p95}
                    p99={p.p99}
                    max={maxP99}
                    isLeader={i === 0}
                  />
                </div>
                <div className="hidden sm:block w-20">
                  <Sparkline
                    values={p.trend}
                    stroke={i === 0 ? '#10b981' : '#475569'}
                  />
                </div>
                <div className="w-16 sm:w-20 text-right text-gray-300 font-mono shrink-0">
                  {formatLatency(p.p50)}
                </div>
                <div className="w-16 sm:w-20 text-right text-gray-100 font-mono shrink-0">
                  {formatLatency(p.p95)}
                </div>
                <div className="w-16 sm:w-20 text-right text-gray-500 font-mono shrink-0 hidden sm:block">
                  {formatLatency(p.p99)}
                </div>
              </div>
            ))}
          </div>

          <RegionHeatmap providers={providers} regions={regions} />
        </>
      )}
    </section>
  );
}
