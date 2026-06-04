'use client';

import { useState, useMemo } from 'react';
import UseCaseSwitcher, { USE_CASES, USE_CASE_VIEWS, DEFAULT_VIEW } from './UseCaseSwitcher';
import ProtocolChips from './ProtocolChips';
import ViewTabs from './ViewTabs';
import ProviderMetricsTable from './ProviderMetricsTable';
import { enrichProviders, computeScores, generateSummary, regionInsight } from './metrics';

const REGION_SORT_KEY = {
  'us-east': 'us-east-1',
  'eu-west': 'eu-west-1',
  apac:      'ap-southeast-1',
};

function sortProviders(providers, useCase, view) {
  const copy = [...providers];
  if (useCase === 'compare') {
    if (view === 'overview')  return copy.sort((a, b) => b.score - a.score);
    if (view === 'latency')   return copy.sort((a, b) => (a.p95ms ?? Infinity) - (b.p95ms ?? Infinity));
    if (view === 'regions')   return copy.sort((a, b) => (a.regionalSpread ?? Infinity) - (b.regionalSpread ?? Infinity));
  }
  if (useCase === 'reliability') {
    if (view === 'overview')      return copy.sort((a, b) => (b.availability ?? 0) - (a.availability ?? 0) || (a.tail ?? Infinity) - (b.tail ?? Infinity));
    if (view === 'availability')  return copy.sort((a, b) => (b.availability ?? 0) - (a.availability ?? 0));
    if (view === 'tail-risk')     return copy.sort((a, b) => (a.tail ?? Infinity) - (b.tail ?? Infinity));
  }
  if (useCase === 'issues') {
    const ord = { error: 0, warning: 1, ok: 2 };
    return copy.sort((a, b) => (ord[a.severity] ?? 3) - (ord[b.severity] ?? 3) || (a.p95ms ?? 0) - (b.p95ms ?? 0));
  }
  return copy;
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

  function handleUseCaseChange(uc) {
    setActiveUseCase(uc);
    const view = DEFAULT_VIEW[uc] ?? USE_CASE_VIEWS[uc][0];
    setActiveView(view);
  }

  const chainData = useMemo(
    () => allChainsData.find(d => d.chain.promName === activeProtocol),
    [allChainsData, activeProtocol]
  );

  const sortedProviders = useMemo(() => {
    if (!chainData?.providers?.length) return [];
    const enriched = enrichProviders(chainData.providers, chainData.regions);
    const scored   = computeScores(enriched);
    return sortProviders(scored, activeUseCase, activeView);
  }, [chainData, activeUseCase, activeView]);

  const summary = useMemo(
    () => chainData
      ? generateSummary(activeUseCase, activeView, chainData.chain, sortedProviders, chainData.regions)
      : null,
    [activeUseCase, activeView, chainData, sortedProviders]
  );

  const insight = useMemo(() => {
    if (!sortedProviders.length || !chainData) return null;
    if (activeUseCase === 'compare' && (activeView === 'overview' || activeView === 'regions')) {
      return regionInsight(sortedProviders, chainData.regions);
    }
    return null;
  }, [activeUseCase, activeView, sortedProviders, chainData]);

  const dashboardUrl = chainData
    ? `https://chainstack.grafana.net/public-dashboards/${chainData.chain.publicToken}?orgId=1&theme=dark`
    : null;

  const views = USE_CASE_VIEWS[activeUseCase] ?? [];

  const contextLabel = [
    chainData?.chain.name,
    USE_CASE_LABEL[activeUseCase],
  ].filter(Boolean).join(' · ');

  return (
    <div>
      {/* Use case — primary, full width */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: '#4A5260', fontSize: 11, fontFamily: 'var(--font-space-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Use case
        </div>
        <UseCaseSwitcher active={activeUseCase} onChange={handleUseCaseChange} />
      </div>

      {/* Protocol — chips with logo */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: '#4A5260', fontSize: 11, fontFamily: 'var(--font-space-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Protocol
        </div>
        <ProtocolChips chains={chains} active={activeProtocol} onChange={setActiveProtocol} />
      </div>

      {/* Context + summary */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#F6F9FD', fontSize: 15, fontWeight: 500, marginBottom: 4, letterSpacing: '-0.2px' }}>
            {contextLabel}
          </div>
          {summary && (
            <div style={{ color: '#656E80', fontSize: 13 }}>{summary}</div>
          )}
        </div>
        {dashboardUrl && (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4DAFFF', fontSize: 12, fontFamily: 'var(--font-space-mono), monospace', flexShrink: 0, textDecoration: 'none', opacity: 0.7 }}
          >
            Open in Grafana ↗
          </a>
        )}
      </div>

      {/* View tabs — outside table card */}
      <div style={{ marginBottom: 12 }}>
        <ViewTabs views={views} active={activeView} onChange={setActiveView} />
      </div>

      {/* Regional insight */}
      {insight && (
        <div style={{ marginBottom: 10, color: '#4A5260', fontSize: 12, fontFamily: 'var(--font-space-mono), monospace' }}>
          {insight}
        </div>
      )}

      {/* Table card — lighter, just data */}
      <div style={{ background: '#161A1E', border: '1px solid #252A30', borderRadius: 10, overflow: 'hidden' }}>
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
  );
}
