import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';

export const revalidate = 60;

const HEADING_GRADIENT = 'radial-gradient(530.09% 357.09% at 10.5% 188.24%, #EBF4FF 0%, #B8DAFF 25.48%, #027BFF 62.02%, #002150 100%)';

export default async function Home() {
  const allChainsData = await Promise.all(CHAINS.map(fetchChainData));

  return (
    <>
      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Header />
      </div>

      <main>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">

          <div className="text-center mt-16 mb-4">
            <div style={{
              display: 'inline-block',
              background: HEADING_GRADIENT,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Suisse Int\\'l', sans-serif",
              fontWeight: 500,
              fontSize: '56px',
              lineHeight: '68px',
              letterSpacing: '-1.12px',
              fontFeatureSettings: '"liga" off, "clig" off',
            }}>
              RPC provider<br />performance overview
            </div>
          </div>

          <div className="text-base mb-12 text-center max-w-xl mx-auto" style={{ color: '#8D95A5' }}>
            Latency percentiles for public RPC providers
            <br />
            Last 24 hours, updated every minute
          </div>

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
