'use client';

import Sparkline from '@/components/Chain/Sparkline';
import { p95Color, availColor, severityColor, severityLabel, regionShort } from './metrics';

const CARD_BG = '#1F2228';

const TH = ({ children, align = 'right' }) => (
  <th
    className={`font-normal py-2 px-3 whitespace-nowrap text-[11px] uppercase tracking-wider font-mono text-${align}`}
    style={{ color: '#656E80' }}
  >
    {children}
  </th>
);

function TD({ children, align = 'right', style: s, mono = true, size = 13 }) {
  return (
    <td
      className={`py-2.5 px-3 text-${align} ${mono ? 'font-mono tabular-nums' : ''}`}
      style={{ fontSize: size, ...s }}
    >
      {children}
    </td>
  );
}

function getColumns(useCase, regionList, activeRegion) {
  switch (useCase) {
    case 'best-overall':
      return [
        {
          header: 'Score',
          render: p => p.score,
          style: p => ({ color: p.score >= 70 ? '#25B15F' : p.score >= 40 ? '#FFDD33' : '#FF294C', fontWeight: 600 }),
        },
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style: p => ({ color: availColor(p.availability) }),
        },
        {
          header: 'P95, ms',
          size: 15,
          render: p => p.p95ms ?? '—',
          style: p => ({ color: p95Color(p.p95ms), fontWeight: 600 }),
        },
        {
          header: 'P99 tail',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: 'Worst region',
          render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: '24h', align: 'center', mono: false,
          render: p => <Sparkline values={p.trend ?? []} width={60} height={20} stroke="#73808C" strokeWidth={1.25} />,
        },
      ];

    case 'fastest':
      return [
        {
          header: 'P95, ms', size: 15,
          render: p => p.p95ms ?? '—',
          style: p => ({ color: p95Color(p.p95ms), fontWeight: 600 }),
        },
        {
          header: 'P50, ms',
          render: p => p.p50ms ?? '—',
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: 'P99 tail',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: '24h', align: 'center', mono: false,
          render: p => <Sparkline values={p.trend ?? []} width={60} height={20} stroke="#73808C" strokeWidth={1.25} />,
        },
        {
          header: 'Regions, P95 ms', align: 'left',
          render: p => regionList
            .filter(r => Number.isFinite(p.regions?.[r]))
            .map(r => `${regionShort(r)} ${Math.round(p.regions[r] * 1000)}`).join(' · ') || '—',
          style: () => ({ color: '#8D95A5', fontSize: 12 }),
        },
      ];

    case 'most-stable':
      return [
        {
          header: 'Avail.',
          render: p => p.availability != null ? `${p.availability.toFixed(2)}%` : '—',
          style: p => ({ color: availColor(p.availability), fontWeight: 600 }),
        },
        {
          header: 'Error rate',
          render: p => p.errorRate != null ? `${p.errorRate.toFixed(2)}%` : '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: 'P99 tail',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: p => ({ color: (p.tail ?? 0) > 200 ? '#FF294C' : (p.tail ?? 0) > 100 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: 'Incidents',
          render: p => p.incidents ?? 0,
          style: p => ({ color: (p.incidents ?? 0) > 0 ? '#FFDD33' : '#8D95A5' }),
        },
        {
          header: '24h status', mono: false,
          render: p => {
            const colors = { stable: '#25B15F', down: '#FF294C', mixed: '#FFDD33', spiky: '#FFDD33' };
            return (
              <span style={{ color: colors[p.trendStatus] ?? '#8D95A5', textTransform: 'capitalize' }}>
                {p.trendStatus ?? 'stable'}
              </span>
            );
          },
        },
      ];

    case 'by-region':
      return [
        ...regionList.map(r => ({
          header: regionShort(r),
          render: p => Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : '—',
          style: p => {
            const ms = Number.isFinite(p.regions?.[r]) ? Math.round(p.regions[r] * 1000) : null;
            return { color: p95Color(ms), fontWeight: r === activeRegion ? 700 : 400 };
          },
        })),
        {
          header: 'Best',
          render: p => p.bestRegion ? regionShort(p.bestRegion) : '—',
          style: () => ({ color: '#25B15F' }),
        },
        {
          header: 'Worst',
          render: p => p.worstRegion ? regionShort(p.worstRegion) : '—',
          style: () => ({ color: '#FF294C' }),
        },
      ];

    case 'issues':
      return [
        {
          header: 'Status', mono: false,
          render: p => severityLabel(p.severity),
          style: p => ({ color: severityColor(p.severity), fontWeight: 500 }),
        },
        {
          header: 'P95, ms', size: 15,
          render: p => p.p95ms ?? '—',
          style: p => ({ color: p95Color(p.p95ms), fontWeight: 600 }),
        },
        {
          header: 'Δ 24h',
          render: () => '—',
          style: () => ({ color: '#656E80' }),
        },
        {
          header: 'P99 tail',
          render: p => p.tail != null ? `+${p.tail}` : '—',
          style: p => ({ color: (p.tail ?? 0) > 150 ? '#FF294C' : '#8D95A5' }),
        },
        {
          header: 'Worst region',
          render: p => p.worstRegion ? `${regionShort(p.worstRegion)} ${p.worstRegionMs}` : '—',
          style: () => ({ color: '#8D95A5' }),
        },
        {
          header: 'Notes', align: 'left', mono: false,
          render: p => {
            const notes = [];
            if ((p.tail ?? 0) > 150) notes.push('high tail');
            if (p.trendStatus === 'down') notes.push('degraded');
            if (p.trendStatus === 'spiky') notes.push('spiky');
            if ((p.incidents ?? 0) > 0) notes.push(`${p.incidents} incident${p.incidents > 1 ? 's' : ''}`);
            return notes.join(', ') || '—';
          },
          style: () => ({ color: '#656E80', fontSize: 12 }),
        },
      ];

    default: return [];
  }
}

export default function ProviderMetricsTable({ useCase, providers, regionList, activeRegion }) {
  const columns = getColumns(useCase, regionList, activeRegion);
  if (!providers.length) {
    return <div className="text-sm font-mono" style={{ color: '#656E80' }}>No data</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
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
            <tr key={p.name} style={{ borderTop: '1px solid #2E3338' }}>
              <td className="sticky left-0 py-2.5 pr-6 font-mono" style={{ background: CARD_BG }}>
                <span style={{ color: i === 0 ? '#F6F9FD' : '#8D95A5' }}>{p.name}</span>
                {i === 0 && (
                  <span
                    className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: '#024156', color: '#8AD5EF' }}
                  >
                    best
                  </span>
                )}
              </td>
              {columns.map((col, j) => (
                <TD
                  key={j}
                  align={col.align ?? 'right'}
                  style={col.style?.(p)}
                  mono={col.mono !== false}
                  size={col.size ?? 13}
                >
                  {col.render(p)}
                </TD>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
