'use client';

export const USE_CASES = [
  { id: 'compare',     label: 'Compare providers' },
  { id: 'reliability', label: 'Monitor reliability' },
  { id: 'issues',      label: 'Investigate issues' },
];

export const USE_CASE_VIEWS = {
  compare:     ['overview', 'latency', 'regions'],
  reliability: ['overview', 'availability', 'tail-risk'],
  issues:      ['active-issues', 'latency-anomalies', 'regional-anomalies'],
};

export const DEFAULT_VIEW = {
  compare:     'overview',
  reliability: 'overview',
  issues:      'active-issues',
};

export default function UseCaseSwitcher({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #2E3338' }}>
      {USE_CASES.map(uc => {
        const isActive = uc.id === active;
        return (
          <button
            key={uc.id}
            onClick={() => onChange(uc.id)}
            style={{
              background:    'none',
              border:        'none',
              borderBottom:  `2px solid ${isActive ? '#007BFF' : 'transparent'}`,
              color:         isActive ? '#F6F9FD' : '#606772',
              padding:       '10px 20px',
              marginBottom:  '-1px',
              fontSize:      '14px',
              fontWeight:    isActive ? 500 : 400,
              fontFamily:    'inherit',
              cursor:        'pointer',
              whiteSpace:    'nowrap',
              transition:    'color 0.15s, border-color 0.15s',
            }}
          >
            {uc.label}
          </button>
        );
      })}
    </div>
  );
}
