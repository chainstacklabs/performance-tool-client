'use client';

import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RANGES = [
  { value: '24h', label: '24h' },
  { value: '7d',  label: '7d'  },
];

export default function TimeRangeSwitcher({ current, onLoadingChange }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(current);

  // Sync back if server overrides (e.g. on back/forward navigation)
  useEffect(() => { setOptimistic(current); }, [current]);

  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(value) {
    setOptimistic(value); // instant visual switch
    const cur = new URLSearchParams(window.location.search);
    const ordered = new URLSearchParams();
    if (cur.get('protocol')) ordered.set('protocol', cur.get('protocol'));
    ordered.set('range', value);
    startTransition(() => {
      router.replace(`?${ordered.toString()}`, { scroll: false });
    });
  }

  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 3,
      background: '#0E1115',
      border: '1px solid #252A30',
      borderRadius: 10,
    }}>
      {RANGES.map(({ value, label }) => {
        const isActive = optimistic === value;
        return (
          <button
            key={value}
            onClick={() => handleChange(value)}
            style={{
              height: 28,
              padding: '0 14px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              fontFamily: 'inherit',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: isActive ? '#F6F9FD' : '#8D95A5',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#C0C8D4'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#8D95A5'; e.currentTarget.style.background = 'transparent'; } }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
