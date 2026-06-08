'use client';

import Sparkline from '@/components/Chain/Sparkline';
import {
  availColor, severityColor, regionShort, REGION_LABEL,
  TAIL_RISK_COLOR, issueNotes,
} from './metrics';

const TREND_COLOR = { stable: '#25B15F', down: '#FF294C', mixed: '#FFDD33', spiky: '#FF294C' };
const TREND_LABEL = { stable: 'stable', down: 'down', mixed: 'mixed', spiky: 'spiky' };

function fmtMs(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function heatCell(ms) {
  if (ms == null) return { bg: 'transparent', color: '#4A5260' };
  if (ms < 120)  return { bg: 'rgba(46,140,70,0.28)',  color: '#7DCFA0' };
  if (ms < 200)  return { bg: 'rgba(150,110,20,0.28)', color: '#C4A45A' };
  return           { bg: 'rgba(160,50,50,0.30)',  color: '#D48080' };
}

const TH = ({ children, align = 'right', padding = '0 12px', minWidth, width }) => (
  <th style={{
    color: '#606772', fontSize: 11,
    fontFamily: 'var(--font-space-mono), monospace',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    fontWeight: 400, padding,
    textAlign: align, whiteSpace: 'nowrap',
    borderBottom: '1px solid #252A30',
    ...(minWidth ? { minWidth } : {}),
    ...(width ? { width } : {}),
  }}>
    {children}
  </th>
);

function TD({ children, align = 'right', mono = true, style: s, size = 13, padding = '0 12px' }) {
  return (
    <td style={{
      padding, textAlign: align, fontSize: size,
      fontFamily: mono ? 'var(--font-space-mono), monospace' : 'inherit',
      letterSpacing: mono ? '-0.3px' : 'normal',
      whiteSpace: 'nowrap',
      color: '#8D95A5', ...s,
    }}>
      {children}
    </td>
  );
}

function TailCell({ tail, level }) {
  const valueColor = level === 'high' ? '#FFDD33' : level === 'low' ? '#25B15F' : '#8D95A5';
  const labelColor = level === 'high' ? '#B8860B' : level === 'low' ? '#1A6B3A' : '#4A5260';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{ color: valueColor }}>+{tail}</span>
      <span style={{ color: labelColor, fontSize: 11 }}>{level}</span>
    </span>
  );
}

function getColumns(view, regionList, accentColor) {
  switch (view) {
    case 'overview':
      return [
        {
          header: '#',
          render: (p, i) => `#${i + 1}`,
          style:  (p, i) => ({ color: i === 0 ? '#4DAFFF' : '#8D95A5', fontWeight: 500 }),
        },
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style:  p => ({ color: availColor(p.availability) }),
        },
        {
          header: 'P95, ms',
          render: p => p.p95ms ?? '—',
          style:  (p, i) => ({
            color:      i === 0 ? '#25B15F' : (p.p95ms ?? 0) >= 200 ? '#FFDD33' : '#8D95A5',
            fontWeight: i === 0 ? 600 : 400,
            fontSize:   i === 0 ? 14 : 13,
          }),
        },
        {
          header: 'Tail risk',
          align:  'left',
          padding: '0 20px 0 48px',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: 'Spread, ms',
          align:  'center',
          render: p => p.regionalSpread != null ? `+${p.regionalSpread}` : '—',
          style:  () => ({ color: '#8D95A5' }),
        },
        {
          header: '24h',
          mono:   false,
          render: p => (
            <span style={{ color: TREND_COLOR[p.trendStatus] ?? '#8D95A5', fontSize: 12 }}>
              {TREND_LABEL[p.trendStatus] ?? 'stable'}
            </span>
          ),
        },
      ];

    case 'latency':
      return [
        {
          header:  'P50, ms',
          width:   '1%',
          render:  p => p.p50ms ?? '—',
          style:   () => ({ color: '#8D95A5' }),
        },
        {
          header:  'P95, ms',
          width:   '1%',
          render:  p => p.p95ms ?? '—',
          style:   (p, i) => ({
            color:      i === 0 ? '#25B15F' : (p.p95ms ?? 0) >= 200 ? '#FFDD33' : '#8D95A5',
            fontWeight: i === 0 ? 600 : 400,
            fontSize:   i === 0 ? 14 : 13,
          }),
        },
        {
          header:  'P99, ms',
          width:   '1%',
          render:  p => p.p99ms ?? '—',
          style:   () => ({ color: '#8D95A5' }),
        },
        {
          header:  'Tail risk',
          align:   'left',
          padding: '0 20px 0 72px',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: 'P95, 24h',
          align:  'left',
          mono:   false,
          render: (p, i) => (
            <Sparkline
              values={p.trend ?? []}
              width={64} height={20}
              stroke={accentColor}
              strokeWidth={1.5}
              opacity={i === 0 ? 1 : 0.45}
            />
          ),
        },
      ];

    case 'reliability':
      return [
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style:  (p, i) => ({ color: availColor(p.availability), fontWeight: i === 0 ? 600 : 400 }),
        },
        {
          header: 'Error rate',
          render: p => p.errorRate != null ? `${p.errorRate.toFixed(4)}%` : '—',
          style:  () => ({ color: '#8D95A5' }),
        },
        {
          header: 'Tail risk',
          align:  'left',
          padding: '0 20px',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: 'Incidents',
          render: p => p.incidents ?? 0,
          style:  p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: '24h',
          mono:   false,
          render: p => (
            <span style={{ color: TREND_COLOR[p.trendStatus] ?? '#8D95A5', fontSize: 12 }}>
              {TREND_LABEL[p.trendStatus] ?? 'stable'}
            </span>
          ),
        },
      ];

    case 'regions':
      return [
        ...(regionList ?? []).map(r => ({
          header: (() => {
            const label = REGION_LABEL[r] ?? regionShort(r);
            const parts = label.split(' ');
            const hasFlag = parts.length > 1;
            return hasFlag
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{parts[0]}</span>
                  <span>{parts.slice(1).join(' ')}</span>
                </span>
              : label;
          })(),
          width:  '1%',
          align:  'center',
          padding: '0 16px',
          render: p => {
            const ms = Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : null;
            return fmtMs(ms);
          },
          style: p => {
            const ms = Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : null;
            const { bg, color } = heatCell(ms);
            return { background: bg, color };
          },
        })),
        {
          header: 'Spread, ms',
          align:  'center',
          render: p => p.regionalSpread != null ? `+${p.regionalSpread}` : '—',
          style:  p => ({ color: (p.regionalSpread ?? 0) > 80 ? '#C4893A' : '#8D95A5', fontWeight: 500 }),
        },
      ];

    case 'issues':
      return [
        {
          header: 'Status',
          align:  'left',
          mono:   false,
          render: p => p.severity === 'ok' ? 'healthy' : p.severity,
          style:  p => ({
            color:      severityColor(p.severity),
            fontWeight: 500,
            fontSize:   12,
          }),
        },
        {
          header: 'P95, ms',
          render: p => p.p95ms ?? '—',
          style:  (p, i) => ({
            color:      (p.p95ms ?? 0) >= 200 ? '#FFDD33' : p.severity === 'ok' ? '#8D95A5' : '#8D95A5',
            fontWeight: p.severity !== 'ok' ? 500 : 400,
          }),
        },
        {
          header: 'Δ baseline',
          render: p => {
            if (p.delta == null) return '—';
            return p.delta >= 0 ? `+${p.delta}` : `${p.delta}`;
          },
          style:  p => ({ color: (p.delta ?? 0) > 30 ? '#FFDD33' : (p.delta ?? 0) < 0 ? '#25B15F' : '#8D95A5' }),
        },
        {
          header: 'Tail risk',
          align:  'left',
          padding: '0 20px 0 48px',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: 'Worst region',
          align:  'left',
          render: p => p.worstRegion ? `${REGION_LABEL[p.worstRegion] ?? regionShort(p.worstRegion)}  ${fmtMs(p.worstRegionMs)}` : '—',
          style:  p => ({ color: (p.worstRegionMs ?? 0) >= 200 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: 'Notes',
          align:  'left',
          mono:   false,
          render: p => issueNotes(p),
          style:  p => ({ color: p.severity === 'ok' ? '#25B15F' : '#8D95A5', fontSize: 12 }),
        },
      ];

    default: return [];
  }
}

export default function ProviderMetricsTable({ view, providers, regionList, accentColor = '#40474E' }) {
  const columns = getColumns(view, regionList, accentColor);
  if (!providers.length) {
    return <div style={{ padding: '20px 16px', color: '#4A5260', fontSize: 13 }}>No data</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        minWidth: view === 'latency' ? 640 : view === 'regions' ? 560 : view === 'issues' ? 700 : 520,
        borderCollapse: 'collapse',
        tableLayout: view === 'regions' || view === 'latency' ? 'fixed' : 'auto',
      }}>
        {view === 'latency' && (
          <colgroup>
            <col style={{ width: '34%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '17%' }} />
          </colgroup>
        )}
        {view === 'regions' && regionList?.length > 0 && (() => {
          const dataCols = regionList.length + 1; // regions + spread
          const providerPct = 28;
          const colPct = Math.floor((100 - providerPct) / dataCols);
          return (
            <colgroup>
              <col style={{ width: `${providerPct}%` }} />
              {Array.from({ length: dataCols }).map((_, i) => <col key={i} style={{ width: `${colPct}%` }} />)}
            </colgroup>
          );
        })()}
        <thead>
          <tr style={{ height: 40, background: '#0E1115' }}>
            <TH align="left" minWidth={160}>Provider</TH>
            {columns.map((col, i) => (
              <TH key={i} align={col.align ?? 'right'} padding={col.padding}>{col.header}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {providers.map((p, i) => {
            const isBest = i === 0 && view !== 'issues';
            const rowBg = isBest ? accentColor.replace('rgb(', 'rgba(').replace(')', ', 0.04)') : 'transparent';
            return (
            <tr
              key={p.name}
              style={{ height: 52, borderBottom: '1px solid #1E2328', background: rowBg, transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = isBest
                ? accentColor.replace('rgb(', 'rgba(').replace(')', ', 0.07)')
                : 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = rowBg}
            >
              <td style={{ padding: '0 12px', textAlign: 'left', whiteSpace: 'nowrap', minWidth: 160 }}>
                <span style={{ fontSize: 13, color: isBest ? '#F6F9FD' : '#8D95A5', fontWeight: isBest ? 500 : 400 }}>
                  {p.name}
                </span>
                {isBest && (
                  <span style={{
                    marginLeft: 8, fontSize: 10, padding: '2px 7px', borderRadius: 999,
                    background: accentColor.replace('rgb(', 'rgba(').replace(')', ', 0.18)'),
                    color: accentColor,
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}>
                    Best
                  </span>
                )}
              </td>
              {columns.map((col, j) => (
                <TD key={j} align={col.align ?? 'right'} mono={col.mono !== false} style={col.style?.(p, i)} size={col.size ?? 13} padding={col.padding}>
                  {col.render(p, i)}
                </TD>
              ))}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
