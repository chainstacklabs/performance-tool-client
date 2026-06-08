'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Export } from '@phosphor-icons/react';
import ProtocolChips from './ProtocolChips';
import ViewTabs from './ViewTabs';
import ProviderMetricsTable from './ProviderMetricsTable';
import { enrichProviders, computeScores, generateSummary, regionInsight } from './metrics';
import { brandHex } from './brandColors';

const VIEWS = ['overview', 'latency', 'reliability', 'regions', 'issues'];

function sortProviders(providers, view) {
  const copy = [...providers];
  switch (view) {
    case 'overview':
      return copy.sort((a, b) => b.score - a.score);
    case 'latency':
      return copy.sort((a, b) => (a.p95ms ?? Infinity) - (b.p95ms ?? Infinity));
    case 'reliability':
      return copy.sort((a, b) => (b.availability ?? 0) - (a.availability ?? 0) || (a.tail ?? Infinity) - (b.tail ?? Infinity));
    case 'regions':
      return copy.sort((a, b) => (a.regionalSpread ?? Infinity) - (b.regionalSpread ?? Infinity));
    case 'issues': {
      const ord = { error: 0, warning: 1, ok: 2 };
      return copy.sort((a, b) => (ord[a.severity] ?? 3) - (ord[b.severity] ?? 3) || (b.p95ms ?? 0) - (a.p95ms ?? 0));
    }
    default: return copy;
  }
}

function ShareButton({ protocol, view }) {
  const [state, setState] = useState('idle');

  async function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set('protocol', protocol.toLowerCase());
    url.searchParams.set('view', view);

    try {
      await navigator.clipboard.writeText(url.toString());
      setState('copied');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = url.toString();
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setState('copied');
      } catch {
        setState('error');
      }
    }
    window.setTimeout(() => setState('idle'), 1600);

  }

  const isCopied = state === 'copied';

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {isCopied && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1E24',
          borderRadius: 6,
          padding: '4px 10px',
          color: '#F6F9FD',
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          animation: 'tooltipFade 1.6s ease forwards',
        }}>
          Copied
        </div>
      )}
      <button
        onClick={handleShare}
        aria-label="Copy share link"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          borderRadius: 8,
          padding: '0 12px',
          height: 32,
          cursor: 'pointer',
          color: '#8D95A5',
          fontSize: 14,
          fontFamily: 'inherit',
          fontWeight: 500,
          lineHeight: '18px',
          letterSpacing: '0.01em',
          transition: 'color 0.15s, border-color 0.15s, background 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#F6F9FD';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#8D95A5';
        }}
      >
        <Export size={14} weight="regular" />
        Share
      </button>
    </div>
  );
}

export default function RpcPerformancePage({ allChainsData, chains }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultProtocol = chains[0]?.promName ?? '';
  const defaultView = 'overview';

  const paramProtocol = searchParams.get('protocol');
  const paramView = searchParams.get('view');

  const initialProtocol = chains.find(c => c.promName.toLowerCase() === paramProtocol?.toLowerCase())?.promName ?? defaultProtocol;
  const initialView = VIEWS.includes(paramView) ? paramView : defaultView;

  const [activeProtocol, setActiveProtocol] = useState(initialProtocol);
  const [activeView, setActiveView] = useState(initialView);

  const updateUrl = useCallback((protocol, view) => {
    const params = new URLSearchParams();
    params.set('protocol', protocol.toLowerCase());
    params.set('view', view);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  function handleProtocolChange(p) {
    setActiveProtocol(p);
    updateUrl(p, activeView);
  }

  function handleViewChange(v) {
    setActiveView(v);
    updateUrl(activeProtocol, v);
  }

  const chainData = useMemo(
    () => allChainsData.find(d => d.chain.promName === activeProtocol),
    [allChainsData, activeProtocol]
  );

  const sortedProviders = useMemo(() => {
    if (!chainData?.providers?.length) return [];
    const enriched = enrichProviders(chainData.providers, chainData.regions);
    const scored   = computeScores(enriched);
    return sortProviders(scored, activeView);
  }, [chainData, activeView]);

  const summary = useMemo(
    () => chainData ? generateSummary(activeView, chainData.chain, sortedProviders) : null,
    [activeView, chainData, sortedProviders]
  );

  const insight = useMemo(() => {
    if (!sortedProviders.length || !chainData) return null;
    if (activeView === 'overview' || activeView === 'regions') {
      return regionInsight(sortedProviders, chainData.regions);
    }
    return null;
  }, [activeView, sortedProviders, chainData]);

  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark`
    : null;

  return (
    <div>
      {/* Protocol selector */}
      <div style={{ marginBottom: 24 }}>
        <ProtocolChips chains={chains} active={activeProtocol} onChange={handleProtocolChange} />
      </div>

      {/* View tabs */}
      <div style={{ marginBottom: 20 }}>
        <ViewTabs views={VIEWS} active={activeView} onChange={handleViewChange} accentColor={brandHex(activeProtocol)} />
      </div>

      {/* Summary block + Share button */}
      <div style={{ minHeight: 44, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          {activeView === 'regions' && insight ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#1A1E24',
              border: '1px solid #252A30',
              borderRadius: 6,
              padding: '3px 10px',
              color: '#F6F9FD',
              fontSize: 12,
              fontFamily: 'var(--font-space-mono), monospace',
            }}>
              {insight}
            </span>
          ) : summary?.headline ? (
            <div>
              <div style={{ color: '#F6F9FD', fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px' }}>
                {summary.headline}
              </div>
              {summary.detail && (
                <div style={{ color: '#656E80', fontSize: 14, lineHeight: '18px', marginTop: 4 }}>
                  {summary.detail}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <ShareButton protocol={activeProtocol} view={activeView} />
      </div>

      {/* Table card */}
      <div style={{ background: '#161A1E', border: '1px solid #252A30', borderRadius: 10, overflow: 'hidden' }}>
        {chainData?.error ? (
          <div style={{ padding: '20px 16px', color: '#FF294C', fontSize: 13 }}>Data unavailable</div>
        ) : (
          <ProviderMetricsTable
            view={activeView}
            providers={sortedProviders}
            regionList={chainData?.regions ?? []}
            accentColor={brandHex(activeProtocol)}
          />
        )}
      </div>

      {/* Grafana link */}
      {dashboardUrl && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <span style={{ color: '#4A5260', fontSize: 14 }}>
            Per-method breakdowns are available in{' '}
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4DAFFF', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              Grafana ↗
            </a>
          </span>
        </div>
      )}
    </div>
  );
}
