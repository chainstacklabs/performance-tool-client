'use client';

import { useState, useMemo } from 'react';
import UseCaseSwitcher, { USE_CASES } from './UseCaseSwitcher';
import ProtocolTabs from './ProtocolTabs';
import RegionFocusControl from './RegionFocusControl';
import ProviderMetricsTable from './ProviderMetricsTable';
import { enrichProviders, computeScores, generateSummary } from './metrics';

const SORT = {
  'best-overall': (a, b) => b.score - a.score,
  'fastest':      (a, b) => (a.p95ms ?? Infinity) - (b.p95ms ?? Infinity),
  'most-stable':  (a, b) => (b.availability ?? 0) - (a.availability ?? 0) || (a.tail ?? Infinity) - (b.tail ?? Infinity),
  'issues':       (a, b) => {
    const ord = { error: 0, warning: 1, ok: 2 };
    return (ord[a.severity] ?? 3) - (ord[b.severity] ?? 3) || (a.p95ms ?? 0) - (b.p95ms ?? 0);
  },
};

const USE_CASE_SUBTITLE = {
  'best-overall': 'Sorted by score: P95 latency + availability + tail risk',
  'fastest':      'Sorted by P95 latency ascending',
  'most-stable':  'Sorted by availability descending, then tail risk ascending',
  'by-region':    'Sorted by selected region P95 latency ascending',
  'issues':       'Sorted by severity: errors first, then warnings',
};

export default function RpcPerformancePage({ allChainsData, chains }) {
  const [activeUseCase, setActiveUseCase] = useState('best-overall');
  const [activeProtocol, setActiveProtocol] = useState(chains[0]?.promName ?? '');
  const [activeRegion, setActiveRegion] = useState('global');

  const chainData = useMemo(
    () => allChainsData.find(d => d.chain.promName === activeProtocol),
    [allChainsData, activeProtocol]
  );

  const sortedProviders = useMemo(() => {
    if (!chainData?.providers?.length) return [];
    const enriched = enrichProviders(chainData.providers, chainData.regions);
    const scored = computeScores(enriched);
    let sortFn = SORT[activeUseCase] ?? SORT['best-overall'];
    if (activeUseCase === 'by-region' && activeRegion !== 'global') {
      sortFn = (a, b) => (a.regions?.[activeRegion] ?? Infinity) - (b.regions?.[activeRegion] ?? Infinity);
    }
    return [...scored].sort(sortFn);
  }, [chainData, activeUseCase, activeRegion]);

  const summary = useMemo(
    () => chainData ? generateSummary(activeUseCase, chainData.chain, sortedProviders) : null,
    [activeUseCase, chainData, sortedProviders]
  );

  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark`
    : null;

  const useCaseLabel = USE_CASES.find(u => u.id === activeUseCase)?.label ?? '';

  return (
    <div>
      {/* Use case switcher — primary nav */}
      <div className="mb-5">
        <UseCaseSwitcher active={activeUseCase} onChange={setActiveUseCase} />
      </div>

      {/* Protocol tabs — secondary nav */}
      <div className="mb-6">
        <div className="text-xs font-mono mb-2" style={{ color: '#656E80' }}>Protocol</div>
        <ProtocolTabs chains={chains} active={activeProtocol} onChange={setActiveProtocol} />
      </div>

      {/* Context header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="text-base font-semibold mb-0.5" style={{ color: '#F6F9FD' }}>
            {chainData?.chain.name} · {useCaseLabel}
          </div>
          <div className="text-xs font-mono mb-2" style={{ color: '#656E80' }}>
            {USE_CASE_SUBTITLE[activeUseCase]}
          </div>
          {summary && (
            <div className="text-sm" style={{ color: '#8D95A5' }}>{summary}</div>
          )}
        </div>
        {dashboardUrl && (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono shrink-0"
            style={{ color: '#4DAFFF' }}
          >
            Open in Grafana ↗
          </a>
        )}
      </div>

      {/* Region focus control */}
      {activeUseCase === 'by-region' && (
        <RegionFocusControl active={activeRegion} onChange={setActiveRegion} />
      )}

      {/* Table */}
      <div className="rounded-xl p-6" style={{ background: '#1F2228', border: '1px solid #2E3338' }}>
        {chainData?.error ? (
          <div className="text-sm font-mono" style={{ color: '#FF294C' }}>Data unavailable</div>
        ) : (
          <ProviderMetricsTable
            useCase={activeUseCase}
            providers={sortedProviders}
            regionList={chainData?.regions ?? []}
            activeRegion={activeRegion}
          />
        )}
      </div>
    </div>
  );
}
