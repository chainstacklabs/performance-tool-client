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
    <div className="inline-flex gap-0.5 p-[3px] bg-panel-head border border-panel-border rounded-[10px]">
      {RANGES.map(({ value, label }) => {
        const isActive = optimistic === value;
        return (
          <button
            key={value}
            onClick={() => handleChange(value)}
            className={`h-7 px-3.5 rounded-[7px] border-none cursor-pointer text-sm font-[inherit] transition-colors ${
              isActive
                ? 'font-medium bg-white/[0.12] text-fg-primary'
                : 'font-normal bg-transparent text-fg-muted hover:text-[#C0C8D4] hover:bg-white/[0.05]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
