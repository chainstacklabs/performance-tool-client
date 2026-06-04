import { CHAINS } from '@/lib/queries';
import { fetchChainData } from '@/lib/chain-data';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import HeroMesh from '@/components/HeroMesh';
import RpcPerformancePage from '@/components/RpcPerformance/RpcPerformancePage';

export const revalidate = 60;

const HEADING_GRADIENT = 'radial-gradient(530.09% 357.09% at 10.5% 188.24%, #EBF4FF 0%, #B8DAFF 25.48%, #027BFF 62.02%, #002150 100%)';

export default async function Home() {
  const allChainsData = await Promise.all(CHAINS.map(fetchChainData));

  return (
    <>
      {/* Hero area with mesh gradient background */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <HeroMesh />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
            <Header />
          </div>

          <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
            <div style={{ paddingTop: 32, paddingBottom: 32 }}>
              <div style={{
                display: 'inline-block',
                background: HEADING_GRADIENT,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Suisse Int\\'l', sans-serif",
                fontWeight: 500,
                fontSize: '40px',
                lineHeight: '50px',
                letterSpacing: '-0.8px',
                fontFeatureSettings: '"liga" off, "clig" off',
              }}>
                RPC provider<br />performance overview
              </div>
              <div style={{ color: '#4A5260', fontSize: 13, marginTop: 8 }}>
                Latency percentiles · last 24 hours · updated every minute
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
          <div style={{ paddingTop: 32, paddingBottom: 48 }}>
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
