'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Export, Question, Warning } from '@phosphor-icons/react';
import ProtocolChips from './ProtocolChips';
import ProviderMetricsTable from './ProviderMetricsTable';
import TimeRangeSwitcher from './TimeRangeSwitcher';
import TableSkeleton from './TableSkeleton';
import { enrichProviders, computeScores, sortByReliabilityThenLatency, generateSummary } from './metrics';
import { brandHex } from './brandColors';

function HowWeRank() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer text-fg-ghost hover:text-[#6B7585] text-sm font-[inherit] font-normal transition-colors"
      >
        <Question size={14} weight="regular" />
        How ranking works
      </button>
      {visible && (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#1A1E24] border border-[#2E3338] rounded-lg px-3.5 py-2.5 w-max max-w-[340px] pointer-events-none shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-50 animate-tooltipIn">
          <div className="text-fg-primary text-[13px] leading-[18px] font-medium mb-1.5">
            We evaluate RPC providers based on their speed (response time) and reliability (success rate) across three regions.
          </div>
          <div className="text-fg-muted text-[13px] leading-[18px] font-mono">
            Score = 1 / ((1/ResponseTime) × (SuccessRate³))
          </div>
        </div>
      )}
    </div>
  );
}

function ShareButton({ protocol }) {
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set('protocol', protocol.toLowerCase());
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url.toString();
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="relative inline-flex">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 bg-transparent border-none rounded-lg px-3.5 h-[34px] cursor-pointer text-fg-muted hover:text-fg-primary text-sm font-[inherit] font-medium transition-colors"
      >
        <Export size={14} weight="regular" />
        Share
      </button>
      {copied && (
        <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[#1A1E24] border border-[#2E3338] rounded-md px-2.5 py-1 text-fg-primary text-xs font-medium whitespace-nowrap pointer-events-none z-50">
          Copied
        </div>
      )}
    </div>
  );
}

export default function RpcPerformancePage({ allChainsData, chains, timeRange = '24h' }) {
  const searchParams = useSearchParams();
  const [isTimeRangeLoading, setIsTimeRangeLoading] = useState(false);
  const defaultProtocol = chains[0]?.promName ?? '';
  const resolveProtocol = (param) =>
    chains.find(c => c.promName.toLowerCase() === param?.toLowerCase())?.promName ?? defaultProtocol;

  const [activeProtocol, setActiveProtocol] = useState(() =>
    resolveProtocol(searchParams.get('protocol'))
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const protocol = url.searchParams.get('protocol') || activeProtocol.toLowerCase();
    const range = url.searchParams.get('range') || timeRange;
    const ordered = new URLSearchParams();
    ordered.set('protocol', protocol);
    ordered.set('range', range);
    window.history.replaceState(null, '', `?${ordered.toString()}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setActiveProtocol(resolveProtocol(searchParams.get('protocol')));
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleProtocolChange(p) {
    setActiveProtocol(p);
    const cur = new URLSearchParams(window.location.search);
    const ordered = new URLSearchParams();
    ordered.set('protocol', p.toLowerCase());
    ordered.set('range', cur.get('range') || timeRange);
    window.history.replaceState(null, '', `?${ordered.toString()}`);
  }

  const chainData = useMemo(
    () => allChainsData.find(d => d.chain.promName === activeProtocol),
    [allChainsData, activeProtocol]
  );

  const sortedProviders = useMemo(() => {
    if (!chainData?.providers?.length) return [];
    const enriched = enrichProviders(chainData.providers);
    const scored = computeScores(enriched);
    const sorted = sortByReliabilityThenLatency(scored);
    // Cache provider count per protocol for skeleton sizing
    try { localStorage.setItem(`rpc_rows_${activeProtocol}`, sorted.length); } catch {}
    return sorted;
  }, [chainData]);

  const summary = useMemo(
    () => chainData ? generateSummary(chainData.chain, sortedProviders) : null,
    [chainData, sortedProviders]
  );

  const accentColor = brandHex(activeProtocol);
  const grafanaFrom = timeRange === '7d' ? 'now-7d' : 'now-24h';
  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark&from=${grafanaFrom}&to=now`
    : null;

  return (
    <div>
      {/* Protocol chips */}
      <div className="mb-6">
        <ProtocolChips chains={chains} active={activeProtocol} onChange={handleProtocolChange} />
      </div>

      {/* Summary + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 min-h-10">
        {isTimeRangeLoading ? (
          <div className="flex flex-col gap-1.5">
            <div className="w-[280px] h-[18px] rounded-[5px] bg-white/[0.07] animate-skeletonPulse" />
            <div className="w-[200px] h-[13px] rounded bg-white/[0.07] animate-skeletonPulse" />
          </div>
        ) : summary?.headline ? (
          <div>
            <div className="text-fg-primary text-lg leading-6 font-medium tracking-[-0.2px]">
              {summary.headline}
            </div>
            {summary.detail && (
              <div className="text-fg-dim text-sm leading-[18px] mt-1">
                {summary.detail}
              </div>
            )}
          </div>
        ) : <div />}
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton protocol={activeProtocol} />
          <TimeRangeSwitcher current={timeRange} onLoadingChange={setIsTimeRangeLoading} />
        </div>
      </div>

      {/* Partial-data warning — some metrics failed but we still have providers */}
      {!isTimeRangeLoading && chainData?.partial && !chainData?.error && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-signal-warn/[0.08] border border-signal-warn/[0.25] rounded-lg text-signal-warn text-[13px]">
          <Warning size={14} weight="fill" />
          Partial data{chainData.degradedMetrics?.length ? ` — ${chainData.degradedMetrics.join(', ')} unavailable` : ''}; ranking may be affected.
        </div>
      )}

      {/* Table */}
      {isTimeRangeLoading ? (
        <TableSkeleton rowCount={sortedProviders.length || 5} />
      ) : (
        <div className="bg-panel border border-panel-border rounded-[10px] overflow-hidden">
          {chainData?.error ? (
            <div className="px-4 py-5 text-signal-bad text-[13px]">Data unavailable</div>
          ) : (
            <ProviderMetricsTable providers={sortedProviders} accentColor={accentColor} />
          )}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2 mt-4">
        <HowWeRank />
        {dashboardUrl && (
          <span className="text-fg-ghost text-sm">
            Per-method breakdowns available in{' '}
            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer"
              className="text-accent no-underline opacity-70 hover:opacity-100 transition-opacity"
            >Grafana ↗</a>
          </span>
        )}
      </div>
    </div>
  );
}
