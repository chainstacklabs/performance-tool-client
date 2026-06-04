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
            className="block rounded-xl p-4 transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            {/* Row: logo + name | min latency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={`/logos/${logoName}.svg`}
                  alt={data.chain.name}
                  width={32}
                  height={32}
                  className="shrink-0"
                  style={{ borderRadius: '9999px' }}
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
                <span
                  className="text-xs font-mono"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  —
                </span>
              )}
            </div>

            {/* Sparkline */}
            <div className="mt-2">
              <Sparkline
                values={leader?.trend ?? []}
                width="100%"
                height={32}
                stroke="var(--color-blue-brand)"
                strokeWidth={1.5}
              />
            </div>

            {/* Provider count */}
            <div
              className="mt-2 text-xs font-mono"
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
