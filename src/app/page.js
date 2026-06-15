import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import LiveDot from '@/components/LiveDot';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';
import PageBackground from '@/components/PageBackground';
import DotGrid from '@/components/DotGrid';

export const dynamic = 'force-dynamic';

function fetchAllChains(timeRange) {
  return Promise.all(CHAINS.map(chain => fetchChainData(chain, timeRange)));
}

export default async function Home({ searchParams }) {
  const timeRange = searchParams?.range === '7d' ? '7d' : '24h';
  const allChainsData = await fetchAllChains(timeRange);

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <DotGrid />
      <div className="relative z-[1]">
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
          <Header />
        </div>
        <main>
          <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
            <div className="pt-6 pb-10">
              <div className="type-h2 text-fg-primary">
                RPC provider performance
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-fg-muted text-[15px] leading-5 font-normal">Updated every minute</span>
                <LiveDot />
              </div>
            </div>
            <div className="pb-8">
              <RpcPerformancePage allChainsData={allChainsData} chains={CHAINS} timeRange={timeRange} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
