import { Suspense } from 'react';
import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import LiveDot from '@/components/LiveDot';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';
import PageBackground from '@/components/PageBackground';
import DotGrid from '@/components/DotGrid';

export const revalidate = 60;


export default async function Home() {
  const allChainsData = await Promise.all(CHAINS.map(fetchChainData));

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

          <div style={{ paddingTop: 24, paddingBottom: 28 }}>
            <div className="type-h2" style={{ color: '#F6F9FD' }}>
              RPC provider performance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <span style={{ color: '#8D95A5', fontSize: 14, lineHeight: '18px', fontWeight: 400 }}>Last 24h · Updated every minute</span>
              <LiveDot />
            </div>
          </div>

          <div style={{ paddingBottom: 32 }}>
            <Suspense>
              <RpcPerformancePage allChainsData={allChainsData} chains={CHAINS} />
            </Suspense>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}
