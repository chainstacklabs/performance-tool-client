'use client';

export const USE_CASES = [
  { id: 'compare',     label: 'Compare providers',   desc: 'Choose the best provider for a protocol' },
  { id: 'reliability', label: 'Monitor reliability', desc: 'Uptime, stability, and reliability risk' },
  { id: 'issues',      label: 'Investigate issues',  desc: 'Current degradation and anomalies' },
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {USE_CASES.map(uc => {
        const isActive = uc.id === active;
        return (
          <button
            key={uc.id}
            onClick={() => onChange(uc.id)}
            style={{
              background:   isActive ? '#007BFF' : '#03264F',
              color:        isActive ? '#FFFFFF'  : '#4DAFFF',
              border:       `1px solid ${isActive ? '#007BFF' : '#024B9A'}`,
              borderRadius: '10px',
              padding:      '10px 22px',
              fontSize:     '14px',
              fontWeight:   isActive ? 600 : 400,
              fontFamily:   'inherit',
              cursor:       'pointer',
              letterSpacing: '-0.1px',
              transition:   'all 0.15s',
            }}
          >
            {uc.label}
          </button>
        );
      })}
    </div>
  );
}
