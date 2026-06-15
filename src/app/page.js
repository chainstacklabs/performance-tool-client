import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import LiveDot from '@/components/LiveDot';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';
import PageBackground from '@/components/PageBackground';
import DotGrid from '@/components/DotGrid';
import { TEXT } from '@/lib/theme';

export const dynamic = 'force-dynamic';

function fetchAllChains(timeRange) {
  return Promise.all(CHAINS.map(chain => fetchChainData(chain, timeRange)));
}

export default async function Home({ searchParams }) {
  const timeRange = searchParams?.range === '7d' ? '7d' : '24h';
  const allChainsData = await fetchAllChains(timeRange);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PageBackground />
      <DotGrid />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
          <Header />
        </div>
        <main>
          <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
            <div style={{ paddingTop: 24, paddingBottom: 40 }}>
              <div className="type-h2" style={{ color: TEXT.primary }}>
                RPC provider performance
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <span style={{ color: TEXT.muted, fontSize: 15, lineHeight: '20px', fontWeight: 400 }}>Updated every minute</span>
                <LiveDot />
              </div>
            </div>
            <div style={{ paddingBottom: 32 }}>
              <RpcPerformancePage allChainsData={allChainsData} chains={CHAINS} timeRange={timeRange} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
