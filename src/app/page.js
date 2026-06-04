import { Suspense } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ChainTOC from '@/components/ChainTOC';
import ChainTOCSkeleton from '@/components/ChainTOCSkeleton';
import ChainCard from '@/components/Chain/ChainCard';
import ChainCardSkeleton from '@/components/Chain/ChainCardSkeleton';
import { CHAINS } from '@/lib/queries';

export const revalidate = 60;

const headingStyle = {
  fontFamily: "'Suisse Int\'l', sans-serif",
  fontWeight: 500,
  fontSize: 'clamp(36px, 6vw, 56px)',
  lineHeight: 1.21,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'block',
};

export default function Home() {
  return (
    <>
      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Header />
      </div>

      <main>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">

          {/* Hero heading — two layered copies blended together */}
          <div className="relative text-center mt-16 mb-4 select-none">
            <span
              style={{
                ...headingStyle,
                background: 'radial-gradient(87.91% 179.45% at 81.17% -63.53%, #FFF 0%, #99CAFF 25.48%, #027BFF 62.02%, #002150 100%)',
              }}
            >
              RPC Provider
              <br />
              Performance Overview
            </span>
            <span
              aria-hidden="true"
              style={{
                ...headingStyle,
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(109.24% 155.24% at -3.67% 116.54%, #002150 0%, #027BFF 37.98%, #B8DAFF 74.52%, #EBF4FF 100%), radial-gradient(87.91% 179.45% at 81.17% -63.53%, #FFF 0%, #99CAFF 25.48%, #027BFF 62.02%, #002150 100%)',
                mixBlendMode: 'screen',
              }}
            >
              RPC Provider
              <br />
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
