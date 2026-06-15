'use client';

import { useMemo } from 'react';
import { Export } from '@phosphor-icons/react';
import Header from '@/components/Header/Header';
import LiveDot from '@/components/LiveDot';
import PageBackground from '@/components/PageBackground';
import DotGrid from '@/components/DotGrid';
import ProtocolChips from '@/components/RpcPerformance/ProtocolChips';
import TimeRangeSwitcher from '@/components/RpcPerformance/TimeRangeSwitcher';
import TableSkeleton from '@/components/RpcPerformance/TableSkeleton';
import { CHAINS } from '@/lib/queries';

export default function Loading() {
  const activeProtocol = useMemo(() => {
    if (typeof window === 'undefined') return CHAINS[0].promName;
    const p = new URLSearchParams(window.location.search).get('protocol');
    return CHAINS.find(c => c.promName.toLowerCase() === p?.toLowerCase())?.promName ?? CHAINS[0].promName;
  }, []);

  const timeRange = useMemo(() => {
    if (typeof window === 'undefined') return '24h';
    return new URLSearchParams(window.location.search).get('range') === '7d' ? '7d' : '24h';
  }, []);

  const rowCount = useMemo(() => {
    if (typeof window === 'undefined') return 5;
    try {
      const cached = localStorage.getItem(`rpc_rows_${activeProtocol}`);
      return cached ? parseInt(cached, 10) : 5;
    } catch { return 5; }
  }, [activeProtocol]);

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
                <span style={{ color: '#8D95A5', fontSize: 15, lineHeight: '20px', fontWeight: 400 }}>Updated every minute</span>
                <LiveDot />
              </div>
            </div>

            <div style={{ paddingBottom: 32 }}>
              {/* Protocol chips */}
              <div style={{ marginBottom: 24 }}>
                <ProtocolChips chains={CHAINS} active={activeProtocol} onChange={() => {}} />
              </div>

              {/* Summary skeleton + actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, minHeight: 40 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ width: 280, height: 18, borderRadius: 5, background: 'rgba(255,255,255,0.07)', animation: 'skeletonPulse 1.6s ease-in-out infinite' }} />
                  <div style={{ width: 200, height: 13, borderRadius: 4, background: 'rgba(255,255,255,0.07)', animation: 'skeletonPulse 1.6s ease-in-out infinite' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 8, padding: '0 14px', height: 34,
                    cursor: 'default', color: '#8D95A5', fontSize: 14,
                    fontFamily: 'inherit', fontWeight: 500,
                  }}>
                    <Export size={14} weight="regular" />
                    Share
                  </button>
                  <TimeRangeSwitcher current={timeRange} />
                </div>
              </div>

              <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
              <TableSkeleton rowCount={rowCount} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
