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
import type { TimeRange } from '@/lib/types';

export default function Loading() {
  const activeProtocol = useMemo(() => {
    if (typeof window === 'undefined') return CHAINS[0].promName;
    const p = new URLSearchParams(window.location.search).get('protocol');
    return CHAINS.find((c) => c.promName.toLowerCase() === p?.toLowerCase())?.promName ?? CHAINS[0].promName;
  }, []);

  const timeRange = useMemo<TimeRange>(() => {
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
    <div className="relative min-h-screen">
      <PageBackground />
      <DotGrid />
      <div className="relative z-[1]">
        <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">
          <Header />
        </div>
        <main>
          <div className="lg:m-auto lg:max-w-6xl sm:mx-4 mx-4">

            <div className="pt-6 pb-10">
              <div className="type-h2 text-fg-primary">
                RPC provider performance
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-fg-muted text-[15px] leading-5 font-normal">Updated every minute</span>
                <LiveDot />
              </div>
            </div>

            <div className="pb-8">
              {/* Protocol chips */}
              <div className="mb-6">
                <ProtocolChips chains={CHAINS} active={activeProtocol} onChange={() => {}} />
              </div>

              {/* Summary skeleton + actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 min-h-10">
                <div className="flex flex-col gap-1.5">
                  <div className="w-[280px] h-[18px] rounded-[5px] bg-white/[0.07] animate-skeletonPulse" />
                  <div className="w-[200px] h-[13px] rounded bg-white/[0.07] animate-skeletonPulse" />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="inline-flex items-center gap-1.5 bg-transparent border-none rounded-lg px-3.5 h-[34px] cursor-default text-fg-muted text-sm font-[inherit] font-medium">
                    <Export size={14} weight="regular" />
                    Share
                  </button>
                  <TimeRangeSwitcher current={timeRange} />
                </div>
              </div>

              <TableSkeleton rowCount={rowCount} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
