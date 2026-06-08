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
    <div style={{ display: 'flex', gap: 24 }}>
      {USE_CASES.map(uc => {
        const isActive = uc.id === active;
        return (
          <button
            key={uc.id}
            onClick={() => onChange(uc.id)}
            style={{
              background:  'none',
              border:      'none',
              padding:     0,
              color:       isActive ? '#F6F9FD' : '#606772',
              fontSize:    '20px',
              fontWeight:  500,
              fontFamily:  'inherit',
              cursor:      'pointer',
              whiteSpace:  'nowrap',
              transition:  'color 0.15s',
            }}
          >
            {uc.label}
          </button>
        );
      })}
    </div>
  );
}
