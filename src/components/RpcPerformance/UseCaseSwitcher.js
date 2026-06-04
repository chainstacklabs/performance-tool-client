'use client';

export const USE_CASES = [
  { id: 'best-overall', label: 'Best overall' },
  { id: 'fastest',      label: 'Fastest' },
  { id: 'most-stable',  label: 'Most stable' },
  { id: 'by-region',    label: 'By region' },
  { id: 'issues',       label: 'Issues' },
];

export default function UseCaseSwitcher({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {USE_CASES.map(uc => {
        const isActive = uc.id === active;
        return (
          <button
            key={uc.id}
            onClick={() => onChange(uc.id)}
            style={{
              background:   isActive ? '#007BFF' : '#03264F',
              color:        isActive ? '#FFFFFF'  : '#007BFF',
              border:       `1px solid ${isActive ? '#007BFF' : '#03264F'}`,
              borderRadius: '8px',
              padding:      '8px 18px',
              fontSize:     '14px',
              fontWeight:   isActive ? 500 : 400,
              fontFamily:   'inherit',
              cursor:       'pointer',
              transition:   'all 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = '#007BFF'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#03264F'; }}
          >
            {uc.label}
          </button>
        );
      })}
    </div>
  );
}
