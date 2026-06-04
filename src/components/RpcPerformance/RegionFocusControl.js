'use client';

const REGIONS = [
  { id: 'global',           label: 'Global' },
  { id: 'us-east-1',        label: 'US-East' },
  { id: 'eu-west-1',        label: 'EU-West' },
  { id: 'ap-southeast-1',   label: 'APAC' },
];

export default function RegionFocusControl({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {REGIONS.map(r => {
        const isActive = r.id === active;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            style={{
              background:   isActive ? 'rgba(0,123,255,0.12)' : 'transparent',
              color:        isActive ? '#4DAFFF' : '#8D95A5',
              border:       `1px solid ${isActive ? '#4DAFFF' : '#2E3338'}`,
              borderRadius: '6px',
              padding:      '4px 12px',
              fontSize:     '12px',
              fontFamily:   'inherit',
              cursor:       'pointer',
              transition:   'all 0.15s',
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
