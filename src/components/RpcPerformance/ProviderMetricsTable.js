'use client';

import Sparkline from '@/components/Chain/Sparkline';

/* ─── helpers ─────────────────────────────────────────────── */

function fmtMs(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Tier thresholds match metrics.js availTier()
function availStatus(pct) {
  if (!Number.isFinite(pct)) return 'unknown';
  if (pct >= 99.9) return 'healthy';
  if (pct >= 99.0) return 'acceptable';
  if (pct >= 95.0) return 'degraded';
  return 'unhealthy';
}

const STATUS_COLOR = {
  healthy:    '#25B15F',
  acceptable: '#6FC784',   // slightly muted green
  degraded:   '#FFDD33',
  unhealthy:  '#FF294C',
  unknown:    '#4A5260',
};

// Relative thresholds: compare against the best provider in the current table.
// green  ≤ best × 1.5  — competitive
// yellow ≤ best × 2.5  — moderately slower
// red    > best × 2.5  — clearly degraded
function relativeLevel(ms, bestMs) {
  if (ms == null || bestMs == null) return 'unknown';
  if (ms <= bestMs * 1.5) return 'good';
  if (ms <= bestMs * 2.5) return 'warn';
  return 'bad';
}

function heatCell(ms, bestMs) {
  if (ms == null) return { bg: 'transparent', color: '#4A5260' };
  const lvl = relativeLevel(ms, bestMs);
  if (lvl === 'good') return { bg: 'rgba(46,140,70,0.28)',  color: '#7DCFA0' };
  if (lvl === 'warn') return { bg: 'rgba(150,110,20,0.28)', color: '#C4A45A' };
  return                     { bg: 'rgba(160,50,50,0.30)',  color: '#D48080' };
}

function latencyColor(ms, bestMs) {
  if (ms == null) return '#4A5260';
  const lvl = relativeLevel(ms, bestMs);
  if (lvl === 'good') return '#25B15F';
  if (lvl === 'warn') return '#C4A45A';
  return '#D48080';
}

const REGION_DISPLAY = {
  fra1: 'DE', sfo1: 'US', sin1: 'SG', hnd1: 'JP',
  'eu-west-1': 'DE', 'us-east-1': 'US', 'ap-southeast-1': 'SG', 'ap-northeast-1': 'JP',
};
const REGION_ORDER  = ['DE', 'US', 'SG', 'JP'];
const REGION_EMOJI  = { DE: '🇩🇪', US: '🇺🇸', SG: '🇸🇬', JP: '🇯🇵' };

function groupRegions(regionsRaw) {
  const out = {};
  for (const [code, val] of Object.entries(regionsRaw ?? {})) {
    const label = REGION_DISPLAY[code];
    if (!label || !Number.isFinite(val)) continue;
    if (out[label] == null || val < out[label]) out[label] = val;
  }
  return out;
}

/* ─── latency distribution column ────────────────────────── */

function LatencyBar({ p50ms, p95ms, p99ms, maxVal, bestP95ms }) {
  const BAR_W  = 180;
  const ref    = maxVal || 1;
  const accent = latencyColor(p95ms, bestP95ms);

  const w50 = p50ms != null ? Math.round(BAR_W * Math.min(1, p50ms / ref)) : 0;
  const w95 = p95ms != null ? Math.round(BAR_W * Math.min(1, p95ms / ref)) : 0;
  const w99 = p99ms != null ? Math.round(BAR_W * Math.min(1, p99ms / ref)) : 0;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
      {/* Shared scale: P50/P95/P99 as segments of one color, decreasing opacity */}
      <div style={{ position: 'relative', width: BAR_W, height: 6, background: '#1E2328', borderRadius: 99 }}>
        {/* P95→P99: faintest tail */}
        {w99 > w95 && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: w99,
            background: accent + '30', borderRadius: 99,
          }} />
        )}
        {/* P50→P95: medium */}
        {w95 > 0 && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: w95,
            background: accent + '80', borderRadius: 99,
          }} />
        )}
        {/* 0→P50: full brightness */}
        {w50 > 0 && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: w50,
            background: accent, borderRadius: 99,
          }} />
        )}
      </div>
      {/* Values row: same color, P95 slightly emphasized */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 4,
        fontFamily: 'var(--font-space-mono), monospace',
        fontSize: 11, whiteSpace: 'nowrap',
        color: '#606772',
      }}>
        <span>{fmtMs(p50ms) ?? '—'}</span>
        <span style={{ color: '#3E4552' }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 12, color: '#7A8494' }}>{fmtMs(p95ms) ?? '—'}</span>
        <span style={{ color: '#3E4552' }}>/</span>
        <span>{fmtMs(p99ms) ?? '—'}</span>
      </div>
    </div>
  );
}

/* ─── main table ──────────────────────────────────────────── */

export default function ProviderMetricsTable({ providers, accentColor = '#4DAFFF' }) {
  if (!providers.length) {
    return <div style={{ padding: '20px 16px', color: '#4A5260', fontSize: 13 }}>No data</div>;
  }

  const maxP95ms = Math.max(...providers.map(p => p.p99ms ?? p.p95ms ?? 0), 1);
  // Best (lowest) P95 in this table — used for relative color thresholds
  const bestP95ms = Math.min(...providers.map(p => p.p95ms).filter(Number.isFinite));

  const regionMaps     = providers.map(p => groupRegions(p.regions));
  const presentRegions = REGION_ORDER.filter(r => regionMaps.some(m => m[r] != null));

  // Total region section is always 240px — each column gets an equal share.
  // 4 cols → 60px, 3 cols → 80px, 2 cols → 120px
  const regionColW = presentRegions.length > 0 ? Math.round(240 / presentRegions.length) : 80;

  const TH = ({ children, align = 'left', style: s }) => (
    <th style={{
      color: '#606772', fontSize: 12,
      fontFamily: 'var(--font-space-mono), monospace',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      fontWeight: 400, padding: '0 16px', height: 44,
      textAlign: align, whiteSpace: 'nowrap',
      borderBottom: '1px solid #252A30',
      background: '#0E1115',
      ...s,
    }}>{children}</th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 160 }} />
          <col style={{ width: 130 }} />
          <col style={{ width: 220 }} />
          <col style={{ width: 140 }} />
          {presentRegions.map(r => <col key={r} style={{ width: regionColW }} />)}
        </colgroup>
        <thead>

          <tr>
            <TH>Provider</TH>
            <TH>Availability</TH>
            <TH>P50 / P95 / P99</TH>
            <TH>P95, 24h</TH>
            {presentRegions.map(r => (
              <TH key={r} align="center">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{REGION_EMOJI[r]}</span>
                  <span>{r}</span>
                </span>
              </TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {providers.map((p, i) => {
            const avail   = p.availability;
            const status  = availStatus(avail);
            const regions = regionMaps[i];

            return (
              <tr
                key={p.name}
                style={{
                  height: 68, borderBottom: '1px solid #1E2328', transition: 'background 0.12s',
                  background: i === 0 ? accentColor.replace('rgb(', 'rgba(').replace(')', ',0.05)') : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = i === 0 ? accentColor.replace('rgb(', 'rgba(').replace(')', ',0.10)') : 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = i === 0 ? accentColor.replace('rgb(', 'rgba(').replace(')', ',0.05)') : 'transparent'}
              >
                {/* Provider */}
                <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="type-subtitle-s" style={{ color: '#F6F9FD' }}>{p.name}</span>
                  </div>
                </td>

                {/* Availability */}
                <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                  {Number.isFinite(avail) ? (
                    <span style={{
                      fontSize: 14, fontWeight: 500,
                      color: STATUS_COLOR[status],
                      fontFamily: 'var(--font-space-mono), monospace',
                      letterSpacing: '-0.3px',
                    }}>
                      {avail.toFixed(2)}%
                    </span>
                  ) : (
                    <span style={{ color: '#4A5260', fontSize: 13 }}>—</span>
                  )}
                </td>

                {/* Latency bar */}
                <td style={{ padding: '0 16px' }}>
                  <LatencyBar p50ms={p.p50ms} p95ms={p.p95ms} p99ms={p.p99ms} maxVal={maxP95ms} bestP95ms={bestP95ms} />
                </td>

                {/* P95 sparkline */}
                <td style={{ padding: '0 16px' }}>
                  {p.trend?.length ? (
                    <Sparkline values={p.trend} width={120} height={24} stroke={accentColor} strokeWidth={1.5} opacity={1} />
                  ) : (
                    <span style={{ color: '#4A5260', fontSize: 13 }}>—</span>
                  )}
                </td>

                {/* Regional P95 heatmap */}
                {presentRegions.map(r => {
                  const ms = regions[r] != null ? Math.round(regions[r] * 1000) : null;
                  const { bg, color } = heatCell(ms, bestP95ms);
                  return (
                    <td key={r} style={{
                      padding: '0 8px', textAlign: 'center',
                      background: bg, color,
                      fontFamily: 'var(--font-space-mono), monospace',
                      fontSize: 12, letterSpacing: '-0.2px', whiteSpace: 'nowrap',
                    }}>
                      {ms != null ? fmtMs(ms) : <span style={{ color: '#4A5260' }}>—</span>}
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
