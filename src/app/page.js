import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ChainTOC from '@/components/ChainTOC';
import ChainTOCSkeleton from '@/components/ChainTOCSkeleton';
import { Suspense } from 'react';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';

export const revalidate = 60;

export default async function Home() {
  const allChainsData = await Promise.all(CHAINS.map(fetchChainData));

  return (
    <>
      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Header />
      </div>

      <main>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">

          {/* Hero heading */}
          <div className="text-center mt-16 mb-4">
            <div style={{
              fontFamily: "'Suisse Int\\'l', sans-serif",
              fontWeight: 500,
              fontSize: '56px',
              lineHeight: '68px',
              letterSpacing: '-1.12px',
              fontFeatureSettings: '"liga" off, "clig" off',
              background: 'radial-gradient(87.91% 179.45% at 81.17% -63.53%, #FFF 0%, #99CAFF 25.48%, #027BFF 62.02%, #002150 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#F6F9FD',
            }}>
              RPC provider
            </div>
            <div style={{
              fontFamily: "'Suisse Int\\'l', sans-serif",
              fontWeight: 500,
              fontSize: '56px',
              lineHeight: '68px',
              letterSpacing: '-1.12px',
              fontFeatureSettings: '"liga" off, "clig" off',
              background: 'radial-gradient(109.24% 155.24% at -3.67% 116.54%, #002150 0%, #027BFF 37.98%, #B8DAFF 74.52%, #EBF4FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#F6F9FD',
            }}>
              performance overview
            </div>
          </div>

          <div className="text-base mb-12 text-center max-w-xl mx-auto" style={{ color: '#8D95A5' }}>
            Latency percentiles for public RPC providers
            <br />
            Last 24 hours, updated every minute
          </div>

          {/* Protocol overview tiles */}
          <div className="mb-12">
            <Suspense fallback={<ChainTOCSkeleton />}>
              <ChainTOC />
            </Suspense>
          </div>

          {/* Interactive use-case / protocol explorer */}
          <div className="mb-16">
            <RpcPerformancePage allChainsData={allChainsData} chains={CHAINS} />
          </div>

        </div>
      </main>

      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Footer />
      </div>
    </>
  );
}
