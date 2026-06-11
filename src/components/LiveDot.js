'use client';

export default function LiveDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 9, height: 9, flexShrink: 0 }}>
      <span style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: '#25B15F',
        opacity: 0.6,
        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{
        position: 'relative',
        display: 'inline-flex',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#25B15F',
      }} />
    </span>
  );
}
