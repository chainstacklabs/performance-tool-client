import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import { formatLatency, chainAnchor } from '@/lib/format';
import Sparkline from './Chain/Sparkline';
import Image from 'next/image';

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
            {/* Logo + name | min p95 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={`/logos/${logoName}.svg`}
                  alt={data.chain.name}
                  width={32}
                  height={32}
                  style={{ borderRadius: '9999px' }}
                  className="shrink-0"
                />
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
                  style={{ color: 'var(--color-blue-brand)' }}
                >
                  {formatLatency(leader.p95)}
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs font-mono">—</span>
              )}
            </div>

            {/* Sparkline */}
            <div style={{ marginTop: '8px' }}>
              <Sparkline
                values={leader?.trend ?? []}
                height={32}
                stroke="var(--color-blue-brand)"
                strokeWidth={1.5}
              />
            </div>

            {/* Provider count */}
            <div
              className="text-xs font-mono mt-2"
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
