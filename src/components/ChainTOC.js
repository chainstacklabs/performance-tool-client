import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import { formatLatency, chainAnchor } from '@/lib/format';
import Image from 'next/image';

// Figma status colors
function latencyColor(seconds) {
  if (!Number.isFinite(seconds)) return '#606772';
  const ms = seconds * 1000;
  const t = Math.min(1, ms / 400);
  const [a, b, pct] = t <= 0.5
    ? ['#25b05f', '#ffd002', t * 2]
    : ['#ffd002', '#ff1a40', (t - 0.5) * 2];
  const hex = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [ar,ag,ab] = hex(a), [br,bg,bb] = hex(b);
  return `rgb(${Math.round(ar+(br-ar)*pct)},${Math.round(ag+(bg-ag)*pct)},${Math.round(ab+(bb-ab)*pct)})`;
}

export default async function ChainTOC() {
  const chainsData = await Promise.all(CHAINS.map(fetchChainData));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {chainsData.map((data) => {
        const leader = data.leader;
        const logoName = data.chain.promName.toLowerCase().replace(/\s+/g, '');
        return (
          <a
            key={data.chain.promName}
            href={`#${chainAnchor(data.chain.promName)}`}
            className="toc-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div style={{ width: 32, height: 32, position: 'relative', flexShrink: 0 }}>
                  <Image
                    src={`/logos/${logoName}.svg`}
                    alt={data.chain.name}
                    fill
                    style={{ objectFit: 'contain', borderRadius: '9999px' }}
                    unoptimized
                  />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {data.chain.name}
                </span>
              </div>
              {leader ? (
                <span
                  className="text-sm font-mono font-medium tabular-nums"
                  style={{ color: latencyColor(leader.p95) }}
                >
                  {formatLatency(leader.p95)}
                </span>
              ) : (
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>—</span>
              )}
            </div>

            <div
              className="mt-3 text-xs font-mono"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {data.providers.length} providers
            </div>
          </a>
        );
      })}
    </div>
  );
}
