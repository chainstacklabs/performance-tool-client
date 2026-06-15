'use client';

import type { CSSProperties, ReactNode } from 'react';
import Sparkline from '@/components/Chain/Sparkline';
import { availTier } from './metrics';
import type { AvailTier, ScoredProvider } from '@/lib/types';

/* ─── helpers ─────────────────────────────────────────────── */

function fmtMs(ms: number | null): string | null {
  if (ms == null) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

type RelLevel = 'good' | 'warn' | 'bad' | 'unknown';

// Relative thresholds: compare against the best provider in the current table.
// green  ≤ best × 1.5  — competitive
// yellow ≤ best × 2.5  — moderately slower
// red    > best × 2.5  — clearly degraded
function relativeLevel(ms: number | null, bestMs: number | null): RelLevel {
  if (ms == null || bestMs == null) return 'unknown';
  if (ms <= bestMs * 1.5) return 'good';
  if (ms <= bestMs * 2.5) return 'warn';
  return 'bad';
}

// Heatmap cell background+text as Tailwind classes (static per level).
function heatCellClass(ms: number | null, bestMs: number): string {
  if (ms == null) return 'text-fg-ghost';
  const lvl = relativeLevel(ms, bestMs);
  if (lvl === 'good') return 'bg-[rgba(46,140,70,0.28)] text-[#7DCFA0]';
  if (lvl === 'warn') return 'bg-[rgba(150,110,20,0.28)] text-[#C4A45A]';
  return 'bg-[rgba(160,50,50,0.30)] text-[#D48080]';
}

// Bar accent — returns a hex value because it's composed with alpha suffixes.
function latencyColorHex(ms: number | null, bestMs: number): string {
  if (ms == null) return '#4A5260';
  const lvl = relativeLevel(ms, bestMs);
  if (lvl === 'good') return '#25B15F';
  if (lvl === 'warn') return '#C4A45A';
  return '#D48080';
}

const TIER_TEXT_CLASS: Record<AvailTier, string> = {
  healthy:    'text-tier-healthy',
  acceptable: 'text-tier-acceptable',
  degraded:   'text-tier-degraded',
  unhealthy:  'text-tier-unhealthy',
  unknown:    'text-tier-unknown',
};

const REGION_DISPLAY: Record<string, string> = {
  fra1: 'DE', sfo1: 'US', sin1: 'SG', hnd1: 'JP',
  'eu-west-1': 'DE', 'us-east-1': 'US', 'ap-southeast-1': 'SG', 'ap-northeast-1': 'JP',
};
const REGION_ORDER: string[] = ['DE', 'US', 'SG', 'JP'];
const REGION_EMOJI: Record<string, string> = { DE: '🇩🇪', US: '🇺🇸', SG: '🇸🇬', JP: '🇯🇵' };

function groupRegions(regionsRaw: Record<string, number> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [code, val] of Object.entries(regionsRaw ?? {})) {
    const label = REGION_DISPLAY[code];
    if (!label || !Number.isFinite(val)) continue;
    if (out[label] == null || val < out[label]) out[label] = val;
  }
  return out;
}

// Convert a brand "rgb(r,g,b)" string to "rgba(r,g,b,a)"
const toRgba = (rgb: string, a: number) => rgb.replace('rgb(', 'rgba(').replace(')', `,${a})`);

/* ─── latency distribution column ────────────────────────── */

interface LatencyBarProps {
  p50ms: number | null;
  p95ms: number | null;
  p99ms: number | null;
  maxVal: number;
  bestP95ms: number;
}

function LatencyBar({ p50ms, p95ms, p99ms, maxVal, bestP95ms }: LatencyBarProps) {
  const BAR_W  = 180;
  const ref    = maxVal || 1;
  const accent = latencyColorHex(p95ms, bestP95ms);

  const w50 = p50ms != null ? Math.round(BAR_W * Math.min(1, p50ms / ref)) : 0;
  const w95 = p95ms != null ? Math.round(BAR_W * Math.min(1, p95ms / ref)) : 0;
  const w99 = p99ms != null ? Math.round(BAR_W * Math.min(1, p99ms / ref)) : 0;

  // Segment colors/widths are data-derived → inline. Layout is class-based.
  const seg = 'absolute left-0 top-0 bottom-0 rounded-full';

  return (
    <div className="inline-flex flex-col gap-1.5 min-w-[220px]">
      {/* Shared scale: P50/P95/P99 as segments of one color, decreasing opacity */}
      <div className="relative w-[180px] h-1.5 bg-panel-row rounded-full">
        {w99 > w95 && <div className={seg} style={{ width: w99, background: accent + '30' }} />}
        {w95 > 0     && <div className={seg} style={{ width: w95, background: accent + '80' }} />}
        {w50 > 0     && <div className={seg} style={{ width: w50, background: accent }} />}
      </div>
      {/* Values row: same color, P95 slightly emphasized */}
      <div className="flex items-baseline gap-1 font-mono text-[11px] whitespace-nowrap text-fg-faint">
        <span>{fmtMs(p50ms) ?? '—'}</span>
        <span className="text-[#3E4552]">/</span>
        <span className="font-semibold text-xs text-[#7A8494]">{fmtMs(p95ms) ?? '—'}</span>
        <span className="text-[#3E4552]">/</span>
        <span>{fmtMs(p99ms) ?? '—'}</span>
      </div>
    </div>
  );
}

/* ─── main table ──────────────────────────────────────────── */

const TH = ({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'center' }) => (
  <th className={`text-fg-faint text-xs font-mono uppercase tracking-[0.05em] font-normal px-4 h-11 whitespace-nowrap border-b border-panel-border bg-panel-head ${
    align === 'center' ? 'text-center' : 'text-left'
  }`}>{children}</th>
);

interface ProviderMetricsTableProps {
  providers: ScoredProvider[];
  accentColor?: string;
  rangeLabel?: string;
}

export default function ProviderMetricsTable({ providers, accentColor = '#4DAFFF', rangeLabel = '24h' }: ProviderMetricsTableProps) {
  if (!providers.length) {
    return <div className="px-4 py-5 text-fg-ghost text-[13px]">No data</div>;
  }

  const maxP95ms = Math.max(...providers.map((p) => p.p99ms ?? p.p95ms ?? 0), 1);
  // Best (lowest) P95 in this table — used for relative color thresholds
  const bestP95ms = Math.min(
    ...providers.map((p) => p.p95ms).filter((v): v is number => Number.isFinite(v)),
  );

  const regionMaps     = providers.map((p) => groupRegions(p.regions));
  const presentRegions = REGION_ORDER.filter((r) => regionMaps.some((m) => m[r] != null));

  // Total region section is always 240px — each column gets an equal share.
  const regionColW = presentRegions.length > 0 ? Math.round(240 / presentRegions.length) : 80;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse table-fixed">
        <colgroup>
          <col className="w-40" />
          <col className="w-[130px]" />
          <col className="w-[220px]" />
          <col className="w-[140px]" />
          {presentRegions.map((r) => <col key={r} style={{ width: regionColW }} />)}
        </colgroup>
        <thead>
          <tr>
            <TH>Provider</TH>
            <TH>Availability</TH>
            <TH>P50 / P95 / P99</TH>
            <TH>P95, {rangeLabel}</TH>
            {presentRegions.map((r) => (
              <TH key={r} align="center">
                <span className="inline-flex items-center gap-1">
                  <span className="text-[15px] leading-none">{REGION_EMOJI[r]}</span>
                  <span>{r}</span>
                </span>
              </TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {providers.map((p, i) => {
            const avail   = p.availability;
            const status  = availTier(avail);
            const regions = regionMaps[i];

            // Row highlight is brand-derived → CSS variables; hover via class.
            const rowVars = {
              '--row-bg':       i === 0 ? toRgba(accentColor, 0.05) : 'transparent',
              '--row-bg-hover': i === 0 ? toRgba(accentColor, 0.10) : 'rgba(255,255,255,0.025)',
            } as CSSProperties;

            return (
              <tr
                key={p.name}
                style={rowVars}
                className="h-[68px] border-b border-panel-row transition-colors bg-[var(--row-bg)] hover:bg-[var(--row-bg-hover)]"
              >
                {/* Provider */}
                <td className="px-4 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="type-subtitle-s text-fg-primary">{p.displayName}</span>
                  </div>
                </td>

                {/* Availability */}
                <td className="px-4 whitespace-nowrap">
                  {Number.isFinite(avail) ? (
                    <span className={`text-sm font-medium font-mono tracking-[-0.3px] ${TIER_TEXT_CLASS[status]}`}>
                      {(avail as number).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-fg-ghost text-[13px]">—</span>
                  )}
                </td>

                {/* Latency bar */}
                <td className="px-4">
                  <LatencyBar p50ms={p.p50ms} p95ms={p.p95ms} p99ms={p.p99ms} maxVal={maxP95ms} bestP95ms={bestP95ms} />
                </td>

                {/* P95 sparkline */}
                <td className="px-4">
                  {p.trend?.length ? (
                    <Sparkline values={p.trend} width={120} height={24} stroke={accentColor} strokeWidth={1.5} opacity={1} />
                  ) : (
                    <span className="text-fg-ghost text-[13px]">—</span>
                  )}
                </td>

                {/* Regional P95 heatmap */}
                {presentRegions.map((r) => {
                  const ms = regions[r] != null ? Math.round(regions[r] * 1000) : null;
                  return (
                    <td key={r} className={`px-2 text-center font-mono text-xs tracking-[-0.2px] whitespace-nowrap ${heatCellClass(ms, bestP95ms)}`}>
                      {ms != null ? fmtMs(ms) : <span className="text-fg-ghost">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
