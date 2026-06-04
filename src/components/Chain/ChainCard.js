import { fetchChainData } from '@/lib/chain-data';
import { chainAnchor } from '@/lib/format';
import Sparkline from './Sparkline';

const CARD_BG = '#0b0f1f';

// Figma status colors: success #25b05f · warning #ffd002 · error #ff1a40
function p95Color(ms) {
  if (!Number.isFinite(ms)) return '#606772';
  const t = Math.min(1, ms / 400);
  const [a, b, pct] = t <= 0.5
    ? ['#25b05f', '#ffd002', t * 2]
    : ['#ffd002', '#ff1a40', (t - 0.5) * 2];
  const hex = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [ar,ag,ab] = hex(a), [br,bg,bb] = hex(b);
  return `rgb(${Math.round(ar+(br-ar)*pct)},${Math.round(ag+(bg-ag)*pct)},${Math.round(ab+(bb-ab)*pct)})`;
}

function availColor(pct) {
  if (pct >= 99.9) return '#9aa3ac';
  if (pct >= 99.5) return '#ffd002';
  return '#ff1a40';
}

const REGION_SHORT = {
  'us-east-1': 'US', 'us-west-1': 'US', 'us-west-2': 'US',
  'eu-west-1': 'EU', 'eu-central-1': 'EU', 'fra1': 'EU', 'ams3': 'EU',
  'ap-southeast-1': 'APAC', 'ap-northeast-1': 'APAC', 'sgp1': 'SG', 'sin1': 'SG',
  'nyc1': 'US', 'nyc3': 'US', 'sfo3': 'US', 'lon1': 'UK',
};
const regionShort = code => REGION_SHORT[code] ?? code.split('-')[0].toUpperCase();

function compactRegions(regionsMap, regionList) {
  return regionList
    .filter(r => Number.isFinite(regionsMap?.[r]))
    .map(r => `${regionShort(r)} ${Math.round(regionsMap[r] * 1000)}`)
    .join(' · ');
}

export default async function ChainCard({ chain }) {
  const { providers, regions, error } = await fetchChainData(chain);
  const dashboardUrl = `https://chainstack.grafana.net/public-dashboards/${chain.publicToken}?orgId=1&theme=dark`;

  return (
    <section
      id={chainAnchor(chain.promName)}
      className="border border-gray-800 rounded-xl p-6 scroll-mt-6"
      style={{ background: CARD_BG }}
    >
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-white">{chain.name}</h2>
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
        <div className="text-red-400 text-sm font-mono mb-3">Data unavailable</div>
      )}
      {!error && providers.length === 0 && (
        <div className="text-gray-500 text-sm font-mono">No data</div>
      )}

      {providers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr
                className="text-[11px] uppercase tracking-wider font-mono"
                style={{ color: '#606772' }}
              >
                <th
                  className="sticky left-0 text-left font-normal py-2 pr-6"
                  style={{ background: CARD_BG }}
                >
                  Provider
                </th>
                <th className="text-right font-normal px-3 whitespace-nowrap">Avail.</th>
                <th className="text-right font-normal px-3 whitespace-nowrap">P95, ms</th>
                <th className="text-right font-normal px-3 whitespace-nowrap">P99 tail</th>
                <th className="text-center font-normal px-3">24h</th>
                <th className="text-left font-normal pl-4 whitespace-nowrap">
                  Regions, P95 ms
                </th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => {
                const p95ms = Number.isFinite(p.p95) ? Math.round(p.p95 * 1000) : null;
                const p99ms = Number.isFinite(p.p99) ? Math.round(p.p99 * 1000) : null;
                const tail  = p95ms != null && p99ms != null ? p99ms - p95ms : null;
                const avail = Number.isFinite(p.success) ? p.success * 100 : null;
                const isLeader = i === 0;

                return (
                  <tr
                    key={p.name}
                    className="border-t border-gray-800/60 hover:bg-white/[0.02] transition-colors"
                  >
                    <td
                      className="sticky left-0 py-2.5 pr-6 font-mono"
                      style={{ background: CARD_BG }}
                    >
                      <span style={{ color: isLeader ? '#fff' : '#d1d5db' }}>
                        {p.name}
                      </span>
                      {isLeader && (
                        <span
                          className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: '#002150', color: '#99CAFF' }}
                        >
                          best
                        </span>
                      )}
                    </td>

                    <td
                      className="text-right px-3 py-2.5 font-mono tabular-nums text-[13px]"
                      style={{ color: avail != null ? availColor(avail) : '#606772' }}
                    >
                      {avail != null ? `${avail.toFixed(2)}%` : '—'}
                    </td>

                    <td
                      className="text-right px-3 py-2.5 font-mono tabular-nums text-[15px] font-semibold"
                      style={{ color: p95ms != null ? p95Color(p95ms) : '#606772' }}
                    >
                      {p95ms ?? '—'}
                    </td>

                    <td
                      className="text-right px-3 py-2.5 font-mono tabular-nums text-[13px]"
                      style={{ color: '#606772' }}
                    >
                      {tail != null ? `+${tail}` : '—'}
                    </td>

                    <td className="px-3 py-2.5">
                      <Sparkline
                        values={p.trend}
                        width={60}
                        height={24}
                        stroke={isLeader ? '#25b05f' : '#475569'}
                        strokeWidth={1.25}
                      />
                    </td>

                    <td
                      className="pl-4 py-2.5 font-mono tabular-nums text-[12px] whitespace-nowrap"
                      style={{ color: '#9aa3ac' }}
                    >
                      {compactRegions(p.regions, regions)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
