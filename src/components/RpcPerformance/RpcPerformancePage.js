'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Export, Question } from '@phosphor-icons/react';
import ProtocolChips from './ProtocolChips';
import ProviderMetricsTable from './ProviderMetricsTable';
import { enrichProviders, computeScores, sortByReliabilityThenLatency, generateSummary } from './metrics';
import { brandHex } from './brandColors';


function HowWeRank() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', borderRadius: 8,
          padding: '0 14px', height: 36, cursor: 'pointer',
          color: '#8D95A5', fontSize: 15, fontFamily: 'inherit',
          fontWeight: 500, transition: 'color 0.15s',
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        <Question size={16} weight="regular" />
        How ranking works
      </button>
      {visible && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          left: '50%', transform: 'translateX(-50%)',
          background: '#1A1E24', border: '1px solid #2E3338',
          borderRadius: 8, padding: '10px 14px',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 50,
          animation: 'tooltipIn 0.15s ease',
        }}>
          <div style={{ color: '#F6F9FD', fontSize: 13, lineHeight: '18px', fontWeight: 500, marginBottom: 6 }}>
            Best overall = Availability first, P95 second.
          </div>
          <div style={{ color: '#8D95A5', fontSize: 13, lineHeight: '18px' }}>
            Providers below 99.9% Availability get a reliability penalty and cannot be #1 in the default ranking.
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
      {copied && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)', background: '#1A1E24',
          borderRadius: 6, padding: '4px 10px',
          color: '#F6F9FD', fontSize: 12, fontWeight: 500,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          animation: 'tooltipFade 1.6s ease forwards',
        }}>
          Copied
        </div>
      )}
      <button
        onClick={handleShare}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', borderRadius: 8,
          padding: '0 14px', height: 36, cursor: 'pointer',
          color: '#8D95A5', fontSize: 15, fontFamily: 'inherit',
          fontWeight: 500, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#F6F9FD'}
        onMouseLeave={e => e.currentTarget.style.color = '#8D95A5'}
      >
        <Export size={16} weight="regular" />
        Share
      </button>
    </div>
  );
}

export default function RpcPerformancePage({ allChainsData, chains }) {
  const searchParams = useSearchParams();

  const defaultProtocol = chains[0]?.promName ?? '';

  const resolveProtocol = (param) =>
    chains.find(c => c.promName.toLowerCase() === param?.toLowerCase())?.promName ?? defaultProtocol;

  const [activeProtocol, setActiveProtocol] = useState(() =>
    resolveProtocol(searchParams.get('protocol'))
  );

  // Sync when URL changes externally (back/forward)
  useEffect(() => {
    const p = resolveProtocol(searchParams.get('protocol'));
    setActiveProtocol(p);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleProtocolChange(p) {
    setActiveProtocol(p);
    const url = new URL(window.location.href);
    url.searchParams.set('protocol', p.toLowerCase());
    window.history.replaceState(null, '', url.toString());
  }

  const chainData = useMemo(
    () => allChainsData.find(d => d.chain.promName === activeProtocol),
    [allChainsData, activeProtocol]
  );

  const sortedProviders = useMemo(() => {
    if (!chainData?.providers?.length) return [];
    const enriched = enrichProviders(chainData.providers, chainData.regions);
    const scored   = computeScores(enriched);
    return sortByReliabilityThenLatency(scored);
  }, [chainData]);

  const summary = useMemo(
    () => chainData ? generateSummary('latency', chainData.chain, sortedProviders) : null,
    [chainData, sortedProviders]
  );

  const accentColor = brandHex(activeProtocol);

  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark`
    : null;

  return (
    <div>
      {/* Chain selector */}
      <div style={{ marginBottom: 24 }}>
        <ProtocolChips chains={chains} active={activeProtocol} onChange={handleProtocolChange} />
      </div>

      {/* Summary + Share */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, minHeight: 40 }}>
        {summary?.headline ? (
          <div>
            <div style={{ color: '#F6F9FD', fontSize: 18, lineHeight: '24px', fontWeight: 500, letterSpacing: '-0.2px' }}>
              {summary.headline}
            </div>
            {summary.detail && (
              <div style={{ color: '#656E80', fontSize: 14, lineHeight: '18px', marginTop: 4 }}>
                {summary.detail}
              </div>
            )}
          </div>
        ) : <div />}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HowWeRank />
          <ShareButton protocol={activeProtocol} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#161A1E', border: '1px solid #252A30', borderRadius: 10, overflow: 'hidden' }}>
        {chainData?.error ? (
          <div style={{ padding: '20px 16px', color: '#FF294C', fontSize: 13 }}>Data unavailable</div>
        ) : (
          <ProviderMetricsTable
            providers={sortedProviders}
            accentColor={accentColor}
          />
        )}
      </div>

      {/* Grafana link */}
      {dashboardUrl && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <span style={{ color: '#4A5260', fontSize: 14 }}>
            Per-method breakdowns available in{' '}
            <a
              href={dashboardUrl} target="_blank" rel="noopener noreferrer"
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
