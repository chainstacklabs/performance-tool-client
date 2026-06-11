import { Suspense } from 'react';
import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import LiveDot from '@/components/LiveDot';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';
import PageBackground from '@/components/PageBackground';
import DotGrid from '@/components/DotGrid';

export const revalidate = 60;


async function fetchAllChains() {
  // Sequential with stagger to avoid rate-limiting the public Grafana API
  const results = [];
  for (let i = 0; i < CHAINS.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 600));
    results.push(await fetchChainData(CHAINS[i]));
  }
  return results;
}

export default async function Home() {
  const allChainsData = await fetchAllChains();

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
            <div className="type-h2" style={{ color: '#F6F9FD' }}>
              RPC provider performance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <span style={{ color: '#8D95A5', fontSize: 16, lineHeight: '20px', fontWeight: 400 }}>Last 24h · Updated every minute</span>
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
