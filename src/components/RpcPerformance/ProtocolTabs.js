'use client';

export default function ProtocolTabs({ chains, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-0 border-b" style={{ borderColor: '#2E3338' }}>
      {chains.map(chain => {
        const isActive = chain.promName === active;
        return (
          <button
            key={chain.promName}
            onClick={() => onChange(chain.promName)}
            style={{
              background:   'transparent',
              color:        isActive ? '#4DAFFF' : '#656E80',
              border:       'none',
              borderBottom: `2px solid ${isActive ? '#4DAFFF' : 'transparent'}`,
              padding:      '6px 16px',
              marginBottom: '-1px',
              fontSize:     '13px',
              fontWeight:   isActive ? 500 : 400,
              fontFamily:   'inherit',
              cursor:       'pointer',
              transition:   'color 0.15s',
            }}
          >
            {chain.name}
          </button>
        );
      })}
    </div>
  );
}
