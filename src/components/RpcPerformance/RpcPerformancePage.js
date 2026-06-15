'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Export, Question } from '@phosphor-icons/react';
import ProtocolChips from './ProtocolChips';
import ProviderMetricsTable from './ProviderMetricsTable';
import TimeRangeSwitcher from './TimeRangeSwitcher';
import TableSkeleton from './TableSkeleton';
import { enrichProviders, computeScores, sortByReliabilityThenLatency, generateSummary } from './metrics';
import { brandHex } from './brandColors';
import { TEXT, SIGNAL } from '@/lib/theme';

const skeletonStyle = `
  @keyframes skeletonPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

function HowWeRank() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer', color: TEXT.ghost, fontSize: 14,
          fontFamily: 'inherit', fontWeight: 400,
          transition: 'color 0.15s',
        }}
        onMouseEnterCapture={e => e.currentTarget.style.color = '#6B7585'}
        onMouseLeaveCapture={e => e.currentTarget.style.color = TEXT.ghost}
      >
        <Question size={14} weight="regular" />
        How ranking works
      </button>
      {visible && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', top: 'auto',
          left: '50%', transform: 'translateX(-50%)',
          background: '#1A1E24', border: '1px solid #2E3338',
          borderRadius: 8, padding: '10px 14px',
          width: 'max-content', maxWidth: 340, pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 50,
          animation: 'tooltipIn 0.15s ease',
        }}>
          <div style={{ color: TEXT.primary, fontSize: 13, lineHeight: '18px', fontWeight: 500, marginBottom: 6 }}>
            We evaluate RPC providers based on their speed (response time) and reliability (success rate) across three regions.
          </div>
          <div style={{ color: TEXT.muted, fontSize: 13, lineHeight: '18px', fontFamily: 'var(--font-space-mono), monospace' }}>
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
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={handleShare}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent',
          border: 'none',
          borderRadius: 8, padding: '0 14px', height: 34,
          cursor: 'pointer', color: TEXT.muted, fontSize: 14,
          fontFamily: 'inherit', fontWeight: 500,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = TEXT.primary; }}
        onMouseLeave={e => { e.currentTarget.style.color = TEXT.muted; }}
      >
        <Export size={14} weight="regular" />
        Share
      </button>
      {copied && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)', background: '#1A1E24',
          border: '1px solid #2E3338',
          borderRadius: 6, padding: '4px 10px',
          color: TEXT.primary, fontSize: 12, fontWeight: 500,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          zIndex: 50,
        }}>Copied</div>
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
    const enriched = enrichProviders(chainData.providers, chainData.regions);
    const scored = computeScores(enriched);
    const sorted = sortByReliabilityThenLatency(scored);
    // Cache provider count per protocol for skeleton sizing
    try { localStorage.setItem(`rpc_rows_${activeProtocol}`, sorted.length); } catch {}
    return sorted;
  }, [chainData]);

  const summary = useMemo(
    () => chainData ? generateSummary('latency', chainData.chain, sortedProviders) : null,
    [chainData, sortedProviders]
  );


  const accentColor = brandHex(activeProtocol);
  const grafanaFrom = timeRange === '7d' ? 'now-7d' : 'now-24h';
  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark&from=${grafanaFrom}&to=now`
    : null;

  return (
    <div>
      <style>{skeletonStyle}</style>
      {/* Protocol chips */}
      <div style={{ marginBottom: 24 }}>
        <ProtocolChips chains={chains} active={activeProtocol} onChange={handleProtocolChange} />
      </div>

      {/* Summary + actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, minHeight: 40 }}>
        {isTimeRangeLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 280, height: 18, borderRadius: 5, background: 'rgba(255,255,255,0.07)', animation: 'skeletonPulse 1.6s ease-in-out infinite' }} />
            <div style={{ width: 200, height: 13, borderRadius: 4, background: 'rgba(255,255,255,0.07)', animation: 'skeletonPulse 1.6s ease-in-out infinite' }} />
          </div>
        ) : summary?.headline ? (
          <div>
            <div style={{ color: TEXT.primary, fontSize: 18, lineHeight: '24px', fontWeight: 500, letterSpacing: '-0.2px' }}>
              {summary.headline}
            </div>
            {summary.detail && (
              <div style={{ color: TEXT.dim, fontSize: 14, lineHeight: '18px', marginTop: 4 }}>
                {summary.detail}
              </div>
            )}
          </div>
        ) : <div />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <ShareButton protocol={activeProtocol} />
          <TimeRangeSwitcher current={timeRange} onLoadingChange={setIsTimeRangeLoading} />
        </div>
      </div>

      {/* Table */}
      {isTimeRangeLoading ? (
        <TableSkeleton rowCount={sortedProviders.length || 5} />
      ) : (
        <div style={{ background: '#161A1E', border: '1px solid #252A30', borderRadius: 10, overflow: 'hidden' }}>
          {chainData?.error ? (
            <div style={{ padding: '20px 16px', color: SIGNAL.bad, fontSize: 13 }}>Data unavailable</div>
          ) : (
            <ProviderMetricsTable providers={sortedProviders} accentColor={accentColor} />
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        <HowWeRank />
        {dashboardUrl && (
          <span style={{ color: TEXT.ghost, fontSize: 14 }}>
            Per-method breakdowns available in{' '}
            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#4DAFFF', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >Grafana ↗</a>
          </span>
        )}
      </div>
    </div>
  );
}
