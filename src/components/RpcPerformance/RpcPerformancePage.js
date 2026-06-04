'use client';

import { useState, useMemo } from 'react';
import UseCaseSwitcher, { USE_CASES, USE_CASE_VIEWS, DEFAULT_VIEW } from './UseCaseSwitcher';
import ProtocolTabs from './ProtocolTabs';
import ViewTabs from './ViewTabs';
import SortControl, { VIEW_SORTS, DEFAULT_SORT } from './SortControl';
import ProviderMetricsTable from './ProviderMetricsTable';
import { enrichProviders, computeScores, generateSummary } from './metrics';

const REGION_SORT_KEY = {
  'us-east': 'us-east-1',
  'eu-west': 'eu-west-1',
  apac:      'ap-southeast-1',
};

function sortProviders(providers, sortKey) {
  const fns = {
    overall:      (a, b) => b.score - a.score,
    p95:          (a, b) => (a.p95ms ?? Infinity) - (b.p95ms ?? Infinity),
    p50:          (a, b) => (a.p50ms ?? Infinity) - (b.p50ms ?? Infinity),
    p99:          (a, b) => (a.p99ms ?? Infinity) - (b.p99ms ?? Infinity),
    availability: (a, b) => (b.availability ?? 0) - (a.availability ?? 0),
    tail:         (a, b) => (a.tail ?? Infinity) - (b.tail ?? Infinity),
    spread:       (a, b) => (a.regionalSpread ?? Infinity) - (b.regionalSpread ?? Infinity),
    'error-rate': (a, b) => (b.errorRate ?? 0) - (a.errorRate ?? 0),
    incidents:    (a, b) => (b.incidents ?? 0) - (a.incidents ?? 0),
    severity:     (a, b) => {
      const ord = { error: 0, warning: 1, ok: 2 };
      return (ord[a.severity] ?? 3) - (ord[b.severity] ?? 3) || (a.p95ms ?? 0) - (b.p95ms ?? 0);
    },
  };

  const regionFn = REGION_SORT_KEY[sortKey];
  if (regionFn) {
    return [...providers].sort((a, b) =>
      (a.regions?.[regionFn] ?? Infinity) - (b.regions?.[regionFn] ?? Infinity)
    );
  }

  return [...providers].sort(fns[sortKey] ?? fns.overall);
}

const USE_CASE_LABEL = {
  compare:     'Compare providers',
  reliability: 'Monitor reliability',
  issues:      'Investigate issues',
};

const VIEW_LABEL = {
  overview:             'Overview',
  latency:              'Latency',
  regions:              'Regions',
  availability:         'Availability',
  'tail-risk':          'Tail risk',
  'active-issues':      'Active issues',
  'latency-anomalies':  'Latency anomalies',
  'regional-anomalies': 'Regional anomalies',
};

export default function RpcPerformancePage({ allChainsData, chains }) {
  const [activeUseCase, setActiveUseCase] = useState('compare');
  const [activeProtocol, setActiveProtocol] = useState(chains[0]?.promName ?? '');
  const [activeView, setActiveView] = useState('overview');
  const [activeSort, setActiveSort] = useState('overall');

  function handleUseCaseChange(uc) {
    setActiveUseCase(uc);
    const view = DEFAULT_VIEW[uc] ?? USE_CASE_VIEWS[uc][0];
    setActiveView(view);
    setActiveSort(DEFAULT_SORT[`${uc}/${view}`] ?? 'overall');
  }

  function handleViewChange(view) {
    setActiveView(view);
    setActiveSort(DEFAULT_SORT[`${activeUseCase}/${view}`] ?? 'overall');
  }

  const chainData = useMemo(
    () => allChainsData.find(d => d.chain.promName === activeProtocol),
    [allChainsData, activeProtocol]
  );

  const sortedProviders = useMemo(() => {
    if (!chainData?.providers?.length) return [];
    const enriched = enrichProviders(chainData.providers, chainData.regions);
    const scored   = computeScores(enriched);
    return sortProviders(scored, activeSort);
  }, [chainData, activeSort]);

  const summary = useMemo(
    () => chainData
      ? generateSummary(activeUseCase, activeView, chainData.chain, sortedProviders, chainData.regions)
      : null,
    [activeUseCase, activeView, chainData, sortedProviders]
  );

  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark`
    : null;

  const views = USE_CASE_VIEWS[activeUseCase] ?? [];
  const sorts = VIEW_SORTS[`${activeUseCase}/${activeView}`] ?? [];

  const contextLabel = [
    chainData?.chain.name,
    USE_CASE_LABEL[activeUseCase],
    VIEW_LABEL[activeView],
  ].filter(Boolean).join(' · ');

  return (
    <div>
      {/* Use case — primary nav */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: '#656E80', fontSize: 11, fontFamily: 'var(--font-space-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Use case
        </div>
        <UseCaseSwitcher active={activeUseCase} onChange={handleUseCaseChange} />
      </div>

      {/* Protocol — secondary nav */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: '#656E80', fontSize: 11, fontFamily: 'var(--font-space-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Protocol
        </div>
        <ProtocolTabs chains={chains} active={activeProtocol} onChange={setActiveProtocol} />
      </div>

      {/* Context breadcrumb + summary */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#F6F9FD', fontSize: 15, fontWeight: 500, marginBottom: 4, letterSpacing: '-0.2px' }}>
            {contextLabel}
          </div>
          {summary && (
            <div style={{ color: '#8D95A5', fontSize: 13 }}>{summary}</div>
          )}
        </div>
        {dashboardUrl && (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4DAFFF', fontSize: 12, fontFamily: 'var(--font-space-mono), monospace', flexShrink: 0, textDecoration: 'none' }}
          >
            Open in Grafana ↗
          </a>
        )}
      </div>

      {/* Table card */}
      <div style={{ background: '#1F2228', border: '1px solid #2E3338', borderRadius: 12, padding: '0 0 4px' }}>
        {/* View tabs + Sort control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 0', gap: 16, flexWrap: 'wrap' }}>
          <ViewTabs views={views} active={activeView} onChange={handleViewChange} />
          {sorts.length > 0 && (
            <div style={{ paddingBottom: 8 }}>
              <SortControl sorts={sorts} active={activeSort} onChange={setActiveSort} />
            </div>
          )}
        </div>

        {/* Regions insight banner */}
        {activeUseCase === 'compare' && activeView === 'regions' && summary && (
          <div style={{ margin: '12px 16px 0', padding: '8px 12px', background: '#151A1E', borderRadius: 8, border: '1px solid #2E3338', color: '#8D95A5', fontSize: 12 }}>
            {summary}
          </div>
        )}

        {/* Table */}
        <div style={{ padding: '4px 0 0' }}>
          {chainData?.error ? (
            <div style={{ padding: '20px 16px', color: '#FF294C', fontSize: 13, fontFamily: 'var(--font-space-mono)' }}>
              Data unavailable
            </div>
          ) : (
            <ProviderMetricsTable
              useCase={activeUseCase}
              view={activeView}
              providers={sortedProviders}
              regionList={chainData?.regions ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
