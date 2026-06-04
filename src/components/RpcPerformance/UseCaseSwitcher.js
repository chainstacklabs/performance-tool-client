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
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {USE_CASES.map(uc => {
        const isActive = uc.id === active;
        return (
          <button
            key={uc.id}
            onClick={() => onChange(uc.id)}
            style={{
              background:   isActive ? '#007BFF' : 'transparent',
              color:        isActive ? '#FFFFFF'  : '#4DAFFF',
              border:       `1px solid ${isActive ? '#007BFF' : '#1A3A5C'}`,
              borderRadius: '10px',
              padding:      '8px 18px',
              fontSize:     '13px',
              fontWeight:   400,
              fontFamily:   'inherit',
              cursor:       'pointer',
              textAlign:    'center',
              transition:   'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            {uc.label}
          </button>
        );
      })}
    </div>
  );
}
