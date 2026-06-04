'use client';

import Sparkline from '@/components/Chain/Sparkline';
import {
  p95Color, availColor, severityColor, severityLabel,
  regionShort, REGION_LABEL, TAIL_RISK_COLOR,
} from './metrics';

const TREND_COLOR  = { stable: '#25B15F', down: '#FF294C', mixed: '#FFDD33', spiky: '#FF294C' };
const TREND_LABEL  = { stable: 'stable', down: 'down', mixed: 'mixed', spiky: 'spiky' };

const TH = ({ children, align = 'right' }) => (
  <th
    style={{
      color:          '#4A5260',
      fontSize:       11,
      fontFamily:     'var(--font-space-mono), monospace',
      textTransform:  'uppercase',
      letterSpacing:  '0.06em',
      fontWeight:     400,
      padding:        '8px 10px',
      textAlign:      align,
      whiteSpace:     'nowrap',
      borderBottom:   '1px solid #252A30',
    }}
  >
    {children}
  </th>
);

function TD({ children, align = 'right', mono = true, style: s, size = 13 }) {
  return (
    <td
      style={{
        padding:       '9px 10px',
        textAlign:     align,
        fontSize:      size,
        fontFamily:    mono ? 'var(--font-space-mono), monospace' : 'inherit',
        letterSpacing: mono ? '-0.3px' : 'normal',
        color:         '#8D95A5',
        ...s,
      }}
    >
      {children}
    </td>
  );
}

function TailCell({ tail, level }) {
  const color = TAIL_RISK_COLOR[level] ?? '#8D95A5';
  return (
    <span>
      <span style={{ color, fontWeight: 500 }}>+{tail}</span>
      <span style={{ color: '#4A5260', fontSize: 11, marginLeft: 4 }}>{level}</span>
    </span>
  );
}

function getColumns(useCase, view, regionList) {
  if (useCase === 'compare') {
    if (view === 'overview') {
      return [
        {
          header: '#',
          render: (p, i) => `#${i + 1}`,
          style:  (p, i) => ({ color: i === 0 ? '#4DAFFF' : '#4A5260', fontWeight: 500 }),
        },
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style:  p => ({ color: availColor(p.availability) }),
        },
        {
          header: 'P95, ms',
          render: (p, i) => p.p95ms ?? '—',
          style:  (p, i) => ({ color: p95Color(p.p95ms, i === 0), fontWeight: i === 0 ? 600 : 400, fontSize: i === 0 ? 14 : 13 }),
        },
        {
          header: 'Tail risk',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: 'Worst region',
          render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
          style:  p => ({ color: (p.worstRegionMs ?? 0) > 200 ? '#FFDD33' : '#4A5260' }),
        },
        {
          header: '24h',
          mono:   false,
          render: p => (
            <span style={{ color: TREND_COLOR[p.trendStatus] ?? '#4A5260', fontSize: 12 }}>
              {TREND_LABEL[p.trendStatus] ?? 'stable'}
            </span>
          ),
        },
      ];
    }

    if (view === 'latency') {
      return [
        {
          header: 'P50, ms',
          render: p => p.p50ms ?? '—',
          style:  () => ({ color: '#656E80' }),
        },
        {
          header: 'P95, ms',
          render: (p, i) => p.p95ms ?? '—',
          style:  (p, i) => ({ color: p95Color(p.p95ms, i === 0), fontWeight: i === 0 ? 600 : 400, fontSize: i === 0 ? 14 : 13 }),
        },
        {
          header: 'P99, ms',
          render: p => p.p99ms ?? '—',
          style:  () => ({ color: '#4A5260' }),
        },
        {
          header: 'Tail risk',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: '24h',
          align:  'center',
          mono:   false,
          render: p => (
            <Sparkline values={p.trend ?? []} width={64} height={20} stroke="#40474E" strokeWidth={1.5} />
          ),
        },
      ];
    }

    if (view === 'regions') {
      return [
        ...(regionList ?? []).map(r => ({
          header: REGION_LABEL[r] ?? regionShort(r),
          render: (p, i) => Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : '—',
          style:  (p, i) => {
            const ms = Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : null;
            return { color: i === 0 ? '#25B15F' : ms > 200 ? '#FFDD33' : '#8D95A5' };
          },
        })),
        {
          header: 'Spread',
          render: p => p.regionalSpread != null ? `+${p.regionalSpread}` : '—',
          style:  p => ({ color: (p.regionalSpread ?? 0) > 60 ? '#FFDD33' : '#4A5260', fontWeight: 500 }),
        },
      ];
    }
  }

  if (useCase === 'reliability') {
    const base = [
      {
        header: 'Avail.',
        render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
        style:  p => ({ color: availColor(p.availability), fontWeight: 500 }),
      },
      {
        header: 'Error rate',
        render: p => p.errorRate != null ? `${p.errorRate.toFixed(4)}%` : '—',
        style:  () => ({ color: '#4A5260' }),
      },
    ];

    if (view === 'overview') {
      return [
        ...base,
        {
          header: 'Tail risk',
          render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
          mono:   false,
        },
        {
          header: 'Incidents',
          render: p => p.incidents ?? 0,
          style:  p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#4A5260' }),
        },
        {
          header: '24h',
          mono:   false,
          render: p => (
            <span style={{ color: TREND_COLOR[p.trendStatus] ?? '#4A5260', fontSize: 12 }}>
              {TREND_LABEL[p.trendStatus] ?? 'stable'}
            </span>
          ),
        },
      ];
    }
    if (view === 'availability') return [...base, {
      header: 'Incidents',
      render: p => p.incidents ?? 0,
      style:  p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#4A5260' }),
    }];
    if (view === 'tail-risk') return [
      { header: 'P95, ms', render: (p,i) => p.p95ms ?? '—', style: (p,i) => ({ color: p95Color(p.p95ms, i===0) }) },
      { header: 'P99, ms', render: p => p.p99ms ?? '—', style: () => ({ color: '#4A5260' }) },
      { header: 'Tail risk', render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—', mono: false },
    ];
  }

  if (useCase === 'issues') {
    const base = [
      {
        header: 'Status',
        mono:   false,
        render: p => severityLabel(p.severity),
        style:  p => ({ color: severityColor(p.severity), fontWeight: 500 }),
      },
      {
        header: 'P95, ms',
        render: (p,i) => p.p95ms ?? '—',
        style:  (p,i) => ({ color: p95Color(p.p95ms, i===0), fontWeight: i===0 ? 600 : 400 }),
      },
      {
        header: 'Tail risk',
        render: p => p.tail != null ? <TailCell tail={p.tail} level={p.tailLevel} /> : '—',
        mono:   false,
      },
    ];

    if (view === 'active-issues') return [...base, {
      header: 'Notes',
      align:  'left',
      mono:   false,
      render: p => {
        const notes = [];
        if (p.trendStatus === 'down') notes.push('degraded');
        if (p.trendStatus === 'spiky') notes.push('spiky');
        if ((p.incidents ?? 0) > 0) notes.push(`${p.incidents} incident${p.incidents > 1 ? 's' : ''}`);
        return notes.join(' · ') || '—';
      },
      style: () => ({ color: '#656E80', fontSize: 12 }),
    }];
    if (view === 'latency-anomalies') return [...base, {
      header: 'Worst region',
      render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
      style:  () => ({ color: '#4A5260' }),
    }];
    if (view === 'regional-anomalies') return [...base, {
      header: 'Spread',
      render: p => p.regionalSpread != null ? `+${p.regionalSpread}` : '—',
      style:  p => ({ color: (p.regionalSpread ?? 0) > 60 ? '#FFDD33' : '#4A5260', fontWeight: 500 }),
    }];
  }

  return [];
}

export default function ProviderMetricsTable({ useCase, view, providers, regionList }) {
  const columns = getColumns(useCase, view, regionList);
  if (!providers.length) {
    return (
      <div style={{ padding: '20px 16px', color: '#4A5260', fontSize: 13, fontFamily: 'var(--font-space-mono)' }}>
        No data
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <TH align="left">Provider</TH>
            {columns.map((col, i) => (
              <TH key={i} align={col.align ?? 'right'}>{col.header}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {providers.map((p, i) => (
            <tr
              key={p.name}
              style={{ borderBottom: '1px solid #1E2328' }}
            >
              <td style={{ padding: '9px 10px', textAlign: 'left' }}>
                <span style={{
                  fontSize:   13,
                  color:      i === 0 ? '#F6F9FD' : '#8D95A5',
                  fontWeight: i === 0 ? 500 : 400,
                }}>
                  {p.name}
                </span>
                {i === 0 && (
                  <span style={{
                    marginLeft:  8,
                    fontSize:    10,
                    padding:     '2px 6px',
                    borderRadius: 4,
                    background:  '#024156',
                    color:       '#8AD5EF',
                    fontFamily:  'var(--font-space-mono), monospace',
                    letterSpacing: '0.02em',
                  }}>
                    best
                  </span>
                )}
              </td>
              {columns.map((col, j) => (
                <TD
                  key={j}
                  align={col.align ?? 'right'}
                  mono={col.mono !== false}
                  style={col.style?.(p, i)}
                  size={col.size ?? 13}
                >
                  {col.render(p, i)}
                </TD>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
