import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import { formatLatency } from '@/lib/format';

function countWinsBy(chainsData, key) {
  const wins = new Map();
  for (const data of chainsData) {
    const sorted = [...data.providers]
      .filter((p) => Number.isFinite(p[key]))
      .sort((a, b) => a[key] - b[key]);
    const winner = sorted[0];
    if (winner) wins.set(winner.name, (wins.get(winner.name) ?? 0) + 1);
  }
  return [...wins.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function Headline() {
  const chainsData = await Promise.all(CHAINS.map(fetchChainData));

  const totalProviders = new Set(
    chainsData.flatMap((c) => c.providers.map((p) => p.name))
  ).size;

  const allP95 = chainsData.flatMap((c) =>
    c.providers.map((p) => ({ name: p.name, p95: p.p95, chain: c.chain.name }))
  );
  const fastest = allP95
    .filter((p) => Number.isFinite(p.p95))
    .sort((a, b) => a.p95 - b.p95)[0];

  const p95Wins = countWinsBy(chainsData, 'p95');
  const p99Wins = countWinsBy(chainsData, 'p99');

  const topByWins = p95Wins[0];
  const tailLeader = p99Wins[0];

  if (!fastest && !topByWins) {
    return (
      <div className="text-center text-gray-500 font-mono text-sm">
        Provider stats unavailable.
      </div>
    );
  }

  return (
    <div className="text-center text-gray-300 text-base sm:text-lg leading-relaxed">
      Across <b className="text-white">{chainsData.length}</b> chains and{' '}
      <b className="text-white">{totalProviders}</b> providers.
      {fastest && (
        <>
          {' '}Fastest right now:{' '}
          <b className="text-emerald-400">{fastest.name}</b>{' '}
          on <span className="text-gray-200">{fastest.chain}</span>{' '}
          at <span className="font-mono">{formatLatency(fastest.p95)}</span>.
        </>
      )}
      {topByWins && (
        <>
          {' '}Most p95 wins:{' '}
          <b className="text-emerald-400">{topByWins[0]}</b>{' '}
          <span className="text-gray-500">({topByWins[1]}/{chainsData.length})</span>.
        </>
      )}
      {tailLeader && tailLeader[0] !== topByWins?.[0] && (
        <>
          {' '}Tail-latency leader:{' '}
          <b className="text-emerald-400">{tailLeader[0]}</b>{' '}
          <span className="text-gray-500">({tailLeader[1]} p99 wins)</span>.
        </>
      )}
    </div>
  );
}
