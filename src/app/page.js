import { Suspense } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ChainTOC from '@/components/ChainTOC';
import ChainTOCSkeleton from '@/components/ChainTOCSkeleton';
import ChainCard from '@/components/Chain/ChainCard';
import ChainCardSkeleton from '@/components/Chain/ChainCardSkeleton';
import { CHAINS } from '@/lib/queries';

export const revalidate = 60;

const lineBase = {
  fontFamily: "'Suisse Int\\'l', -apple-system, sans-serif",
  fontWeight: 500,
  fontSize: '56px',
  lineHeight: '68px',
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  display: 'block',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};

export default function Home() {
  return (
    <>
      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Header />
      </div>

      <main>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">

          <div className="text-center mt-16 mb-4">
            <span style={{
              ...lineBase,
              background: 'radial-gradient(87.91% 179.45% at 81.17% -63.53%, #FFF 0%, #99CAFF 25.48%, #027BFF 62.02%, #002150 100%)',
            }}>
              RPC Provider
            </span>
            <span style={{
              ...lineBase,
              background: 'radial-gradient(109.24% 155.24% at -3.67% 116.54%, #002150 0%, #027BFF 37.98%, #B8DAFF 74.52%, #EBF4FF 100%)',
            }}>
              Performance Overview
            </span>
          </div>

          <div
            className="text-base mb-12 text-center max-w-xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Latency percentiles for public RPC providers
            <br />
            Last 24 hours, updated every minute
          </div>

          <div className="mb-12">
            <Suspense fallback={<ChainTOCSkeleton />}>
              <ChainTOC />
            </Suspense>
          </div>

          <div className="grid gap-6 mb-16">
            {CHAINS.map((chain) => (
              <Suspense
                key={chain.promName}
                fallback={<ChainCardSkeleton chain={chain} />}
              >
                <ChainCard chain={chain} />
              </Suspense>
            ))}
          </div>

          <p
            className="text-center font-mono text-sm mb-16"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            For per-method breakdowns, open any chain&apos;s Grafana dashboard.
          </p>
        </div>
      </main>

      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Footer />
      </div>
    </>
  );
}
