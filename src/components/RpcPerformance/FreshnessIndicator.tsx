'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LiveDot from '@/components/LiveDot';

// Probes (compare-dashboard-functions Vercel cron) measure every 3 minutes
// (`*/3 * * * *`). Refresh on that cadence so the "Live" dot is truthful.
const REFRESH_MS = 180_000;

export default function FreshnessIndicator() {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      // Don't churn a backgrounded tab; refresh when it becomes visible again.
      if (!document.hidden) router.refresh();
    };
    const id = setInterval(tick, REFRESH_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [router]);

  return (
    <div className="flex items-center gap-1.5 mt-3">
      <span className="text-fg-muted text-[15px] leading-5 font-normal">Live · updates every 3 min</span>
      <LiveDot />
    </div>
  );
}
