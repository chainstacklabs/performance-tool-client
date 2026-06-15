'use client';

import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TimeRange } from '@/lib/types';

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d',  label: '7d'  },
];

interface TimeRangeSwitcherProps {
  current: TimeRange;
  onLoadingChange?: (loading: boolean) => void;
}

export default function TimeRangeSwitcher({ current, onLoadingChange }: TimeRangeSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<TimeRange>(current);

  // Sync back if server overrides (e.g. on back/forward navigation)
  useEffect(() => { setOptimistic(current); }, [current]);

  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(value: TimeRange) {
    setOptimistic(value); // instant visual switch
    const cur = new URLSearchParams(window.location.search);
    const ordered = new URLSearchParams();
    const protocol = cur.get('protocol');
    if (protocol) ordered.set('protocol', protocol);
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
