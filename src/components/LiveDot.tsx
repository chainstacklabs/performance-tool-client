'use client';

export default function LiveDot() {
  return (
    <span className="relative inline-flex items-center justify-center w-[9px] h-[9px] shrink-0">
      <span className="absolute inset-0 rounded-full bg-signal-ok opacity-60 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-signal-ok" />
    </span>
  );
}
