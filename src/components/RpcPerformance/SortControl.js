'use client';

const SORT_LABELS = {
  overall:      'Overall',
  p95:          'P95',
  p50:          'P50',
  p99:          'P99',
  availability: 'Availability',
  tail:         'Tail risk',
  spread:       'Spread',
  'us-east':    'US-East',
  'eu-west':    'EU-West',
  apac:         'APAC',
  severity:     'Severity',
  'error-rate': 'Error rate',
  incidents:    'Incidents',
};

export const VIEW_SORTS = {
  'compare/overview':    ['overall', 'p95', 'availability', 'tail', 'spread'],
  'compare/latency':     ['p95', 'p50', 'p99', 'tail'],
  'compare/regions':     ['overall', 'us-east', 'eu-west', 'apac', 'spread'],
  'reliability/overview':    ['availability', 'tail', 'incidents'],
  'reliability/availability': ['availability', 'error-rate'],
  'reliability/tail-risk':    ['tail', 'p99'],
  'issues/active-issues':      ['severity', 'p95'],
  'issues/latency-anomalies':  ['p95', 'tail'],
  'issues/regional-anomalies': ['spread'],
};

export const DEFAULT_SORT = {
  'compare/overview':    'overall',
  'compare/latency':     'p95',
  'compare/regions':     'overall',
  'reliability/overview':    'availability',
  'reliability/availability': 'availability',
  'reliability/tail-risk':    'tail',
  'issues/active-issues':      'severity',
  'issues/latency-anomalies':  'p95',
  'issues/regional-anomalies': 'spread',
};

export default function SortControl({ sorts, active, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        color: '#656E80',
        fontSize: 11,
        fontFamily: 'var(--font-space-mono), monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}>
        Sort by
      </span>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {sorts.map(s => {
          const isActive = s === active;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              style={{
                background:   isActive ? '#2E3338' : 'transparent',
                border:       `1px solid ${isActive ? '#40474E' : 'transparent'}`,
                color:        isActive ? '#F6F9FD' : '#656E80',
                borderRadius: 6,
                padding:      '3px 10px',
                fontSize:     12,
                fontFamily:   'inherit',
                cursor:       'pointer',
                transition:   'all 0.12s',
              }}
            >
              {SORT_LABELS[s] ?? s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
