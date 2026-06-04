import { Suspense } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ChainTOC from '@/components/ChainTOC';
import ChainTOCSkeleton from '@/components/ChainTOCSkeleton';
import ChainCard from '@/components/Chain/ChainCard';
import ChainCardSkeleton from '@/components/Chain/ChainCardSkeleton';
import { CHAINS } from '@/lib/queries';

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
        <Header />
      </div>

      <main>
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
          <h1
            className="text-center mt-16 mb-4"
            style={{
              fontFamily: "'Suisse Int\'l', sans-serif",
              fontWeight: 500,
              fontSize: '56px',
              lineHeight: '68px',
              letterSpacing: '-2%',
              background: 'linear-gradient(180deg, #6699ff 0%, #cce0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
            }}
          >
            RPC Provider
            <br />
            Performance Overview
          </h1>

          <div className="text-base mb-12 text-gray-400 text-center max-w-xl mx-auto">
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

          <p className="text-center text-gray-500 font-mono text-sm mb-16">
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
