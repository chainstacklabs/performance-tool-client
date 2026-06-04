'use client';

const VIEW_LABELS = {
  overview:             'Overview',
  latency:              'Latency',
  regions:              'Regions',
  availability:         'Availability',
  'tail-risk':          'Tail risk',
  'active-issues':      'Active issues',
  'latency-anomalies':  'Latency anomalies',
  'regional-anomalies': 'Regional anomalies',
};

export default function ViewTabs({ views, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #2E3338', gap: 0 }}>
      {views.map(v => {
        const isActive = v === active;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              background:   'none',
              border:       'none',
              borderBottom: `2px solid ${isActive ? '#4DAFFF' : 'transparent'}`,
              color:        isActive ? '#F6F9FD' : '#656E80',
              padding:      '7px 16px',
              marginBottom: '-1px',
              fontSize:     '13px',
              fontWeight:   isActive ? 500 : 400,
              fontFamily:   'inherit',
              cursor:       'pointer',
              transition:   'color 0.15s',
              whiteSpace:   'nowrap',
            }}
          >
            {VIEW_LABELS[v] ?? v}
          </button>
        );
      })}
    </div>
  );
}
