'use client';

import Sparkline from '@/components/Chain/Sparkline';
import { p95Color, availColor, severityColor, severityLabel, regionShort, REGION_LABEL } from './metrics';

const CARD_BG = '#1F2228';

const TREND_COLOR = { stable: '#25B15F', down: '#FF294C', mixed: '#FFDD33', spiky: '#FFDD33' };

const TH = ({ children, align = 'right' }) => (
  <th
    style={{
      color: '#656E80',
      fontSize: 11,
      fontFamily: 'var(--font-space-mono), monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: 400,
      padding: '8px 12px',
      textAlign: align,
      whiteSpace: 'nowrap',
      borderBottom: '1px solid #2E3338',
    }}
  >
    {children}
  </th>
);

function TD({ children, align = 'right', mono = true, style: s, size = 13 }) {
  return (
    <td
      style={{
        padding: '10px 12px',
        textAlign: align,
        fontSize: size,
        fontFamily: mono ? 'var(--font-space-mono), monospace' : 'inherit',
        letterSpacing: mono ? '-0.3px' : 'normal',
        ...s,
      }}
    >
      {children}
    </td>
  );
}

function getColumns(useCase, view, regionList) {
  if (useCase === 'compare') {
    if (view === 'overview') {
      return [
        {
          header: '#',
          render: (p, i) => `#${i + 1}`,
          style: (p, i) => ({ color: i === 0 ? '#4DAFFF' : '#656E80', fontWeight: i === 0 ? 600 : 400 }),
        },
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style: p => ({ color: availColor(p.availability) }),
        },
        {
          header: 'P95, ms',
          render: p => p.p95ms ?? '—',
          style: p => ({ color: p95Color(p.p95ms), fontWeight: 600, fontSize: 14 }),
        },
        {
          header: 'Tail risk',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: 'Best region',
          render: p => p.bestRegion ? `${regionShort(p.bestRegion)} ${p.bestRegionMs}` : '—',
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: 'Worst region',
          render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
          style: p => ({ color: (p.worstRegionMs ?? 0) > 200 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: '24h',
          mono: false,
          render: p => (
            <span style={{ color: TREND_COLOR[p.trendStatus] ?? '#8D95A5', fontSize: 12 }}>
              {p.trendStatus ?? 'stable'}
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
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: 'P95, ms',
          render: p => p.p95ms ?? '—',
          style: p => ({ color: p95Color(p.p95ms), fontWeight: 600, fontSize: 14 }),
        },
        {
          header: 'P99, ms',
          render: p => p.p99ms ?? '—',
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: 'Tail risk',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: p => ({ color: (p.tail ?? 0) > 150 ? '#FFDD33' : '#656E80' }),
        },
        {
          header: '24h',
          align: 'center',
          mono: false,
          render: p => (
            <Sparkline
              values={p.trend ?? []}
              width={64}
              height={20}
              stroke="#73808C"
              strokeWidth={1.25}
            />
          ),
        },
      ];
    }

    if (view === 'regions') {
      return [
        ...(regionList ?? []).map(r => ({
          header: REGION_LABEL[r] ?? regionShort(r),
          render: p => Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : '—',
          style: p => {
            const ms = Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : null;
            return { color: p95Color(ms) };
          },
        })),
        {
          header: 'Spread',
          render: p => p.regionalSpread != null ? `+${p.regionalSpread}` : '—',
          style: p => ({ color: (p.regionalSpread ?? 0) > 60 ? '#FFDD33' : '#656E80' }),
        },
      ];
    }
  }

  if (useCase === 'reliability') {
    if (view === 'overview') {
      return [
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style: p => ({ color: availColor(p.availability), fontWeight: 600 }),
        },
        {
          header: 'Error rate',
          render: p => p.errorRate != null ? `${p.errorRate.toFixed(4)}%` : '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: 'Tail risk',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: p => ({ color: (p.tail ?? 0) > 150 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: 'Incidents',
          render: p => p.incidents ?? 0,
          style: p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: '24h status',
          mono: false,
          render: p => (
            <span style={{ color: TREND_COLOR[p.trendStatus] ?? '#8D95A5', fontSize: 12 }}>
              {p.trendStatus ?? 'stable'}
            </span>
          ),
        },
      ];
    }

    if (view === 'availability') {
      return [
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style: p => ({ color: availColor(p.availability), fontWeight: 600, fontSize: 14 }),
        },
        {
          header: 'Error rate',
          render: p => p.errorRate != null ? `${p.errorRate.toFixed(4)}%` : '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: 'Incidents',
          render: p => p.incidents ?? 0,
          style: p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#8D95A5' }),
        },
      ];
    }

    if (view === 'tail-risk') {
      return [
        {
          header: 'P99, ms',
          render: p => p.p99ms ?? '—',
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: 'P95, ms',
          render: p => p.p95ms ?? '—',
          style: p => ({ color: p95Color(p.p95ms) }),
        },
        {
          header: 'Tail risk',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: p => ({ color: (p.tail ?? 0) > 150 ? '#FFDD33' : '#8D95A5', fontWeight: 600, fontSize: 14 }),
        },
      ];
    }
  }

  if (useCase === 'issues') {
    const baseColumns = [
      {
        header: 'Status',
        mono: false,
        render: p => severityLabel(p.severity),
        style: p => ({ color: severityColor(p.severity), fontWeight: 500 }),
      },
      {
        header: 'P95, ms',
        render: p => p.p95ms ?? '—',
        style: p => ({ color: p95Color(p.p95ms), fontWeight: 600, fontSize: 14 }),
      },
      {
        header: 'Tail risk',
        render: p => p.tail != null ? `+${p.tail}` : '—',
        style: p => ({ color: (p.tail ?? 0) > 150 ? '#FF294C' : '#8D95A5' }),
      },
    ];

    if (view === 'active-issues') {
      return [
        ...baseColumns,
        {
          header: 'Incidents',
          render: p => p.incidents ?? 0,
          style: p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: 'Notes',
          align: 'left',
          mono: false,
          render: p => {
            const notes = [];
            if ((p.tail ?? 0) > 150) notes.push('high tail');
            if (p.trendStatus === 'down') notes.push('degraded');
            if (p.trendStatus === 'spiky') notes.push('spiky');
            if ((p.incidents ?? 0) > 0) notes.push(`${p.incidents} incident${p.incidents > 1 ? 's' : ''}`);
            return notes.join(' · ') || '—';
          },
          style: () => ({ color: '#656E80', fontSize: 12 }),
        },
      ];
    }

    if (view === 'latency-anomalies') {
      return [
        ...baseColumns,
        {
          header: 'Worst region',
          render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
          style: () => ({ color: '#8D95A5' }),
        },
      ];
    }

    if (view === 'regional-anomalies') {
      return [
        ...baseColumns,
        {
          header: 'Spread',
          render: p => p.regionalSpread != null ? `+${p.regionalSpread}` : '—',
          style: p => ({ color: (p.regionalSpread ?? 0) > 60 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: 'Worst region',
          render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
          style: () => ({ color: '#8D95A5' }),
        },
      ];
    }
  }

  return [];
}

export default function ProviderMetricsTable({ useCase, view, providers, regionList }) {
  const columns = getColumns(useCase, view, regionList);
  if (!providers.length) {
    return <div style={{ color: '#656E80', fontSize: 13, fontFamily: 'var(--font-space-mono)' }}>No data</div>;
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
              style={{
                borderBottom: '1px solid #2E3338',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}
            >
              <td style={{ padding: '10px 12px', textAlign: 'left' }}>
                <span
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: i === 0 ? '#F6F9FD' : '#8D95A5',
                    fontWeight: i === 0 ? 500 : 400,
                  }}
                >
                  {p.name}
                </span>
                {i === 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: '#024156',
                      color: '#8AD5EF',
                      fontFamily: 'var(--font-space-mono), monospace',
                      letterSpacing: '0.04em',
                    }}
                  >
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
