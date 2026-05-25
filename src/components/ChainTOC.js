import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import { formatLatency, chainAnchor } from '@/lib/format';
import Sparkline from './Chain/Sparkline';

export default async function ChainTOC() {
  const chainsData = await Promise.all(CHAINS.map(fetchChainData));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {chainsData.map((data) => {
        const leader = data.leader;
        return (
          <a
            key={data.chain.promName}
            href={`#${chainAnchor(data.chain.promName)}`}
            className="block border border-gray-800 rounded-lg p-3 hover:border-gray-700 hover:bg-gray-900/40 transition-colors"
            style={{ background: '#0a0d18' }}
          >
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-sm font-semibold text-white">
                {data.chain.name}
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                {data.providers.length} prov
              </div>
            </div>
            <div className="h-6 -mx-1">
              <Sparkline
                values={leader?.trend ?? []}
                width={140}
                height={24}
                stroke="#10b981"
                strokeWidth={1.25}
              />
            </div>
            {leader ? (
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-xs font-mono text-gray-300 truncate pr-2">
                  {leader.name}
                </div>
                <div className="text-xs font-mono text-emerald-400">
                  {formatLatency(leader.p95)}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-gray-600 mt-1">No data</div>
            )}
          </a>
        );
      })}
    </div>
  );
}
