'use client';

const VIEW_LABELS = {
  overview:    'Overview',
  latency:     'Latency',
  reliability: 'Reliability',
  regions:     'Regions',
  issues:      'Issues',
};

export default function ViewTabs({ views, active, onChange, accentColor = '#4DAFFF' }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(64,71,78,0.5)', gap: 0 }}>
      {views.map(v => {
        const isActive = v === active;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              background:   'none',
              border:       'none',
              borderBottom: `2px solid ${isActive ? accentColor : 'transparent'}`,
              color:        isActive ? '#F6F9FD' : '#606772',
              padding:      '7px 16px',
              marginBottom: '-1px',
              fontSize:     '14px',
              fontWeight:   isActive ? 500 : 400,
              fontFamily:   'inherit',
              cursor:       'pointer',
              transition:   'color 0.15s',
              whiteSpace:   'nowrap',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#8D95A5'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#606772'; }}
          >
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ visibility: 'hidden', fontWeight: 500 }}>{VIEW_LABELS[v] ?? v}</span>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{VIEW_LABELS[v] ?? v}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
