const ROW_H = 68;
const HEADER_H = 44;
const S = { borderRadius: 4, background: 'rgba(255,255,255,0.07)', animation: 'skeletonPulse 1.6s ease-in-out infinite', flexShrink: 0 };

const LEFT_COLS  = [
  { w: 160, hh: 10, dh: 12, dw: '75%' },
  { w: 130, hh: 10, dh: 12, dw: '65%' },
  { w: 220, hh: 10, dh: 8,  dw: '80%' },
  { w: 140, hh: 10, dh: 24, dw: '100%' },
];
const RIGHT_COLS = [
  { w: 80, hh: 10, dh: 12, dw: '65%' },
  { w: 80, hh: 10, dh: 12, dw: '65%' },
  { w: 80, hh: 10, dh: 12, dw: '65%' },
];

function Row({ isHeader, delay, borderBottom }) {
  return (
    <div style={{
      height: isHeader ? HEADER_H : ROW_H,
      padding: '0 16px',
      display: 'flex', alignItems: 'center',
      borderBottom,
      animation: delay != null ? `skeletonPulse 1.6s ease-in-out ${delay}s infinite` : undefined,
    }}>
      {LEFT_COLS.map((col, i) => (
        <div key={i} style={{ width: col.w, flexShrink: 0, paddingRight: 16 }}>
          <div style={{ ...S, height: isHeader ? col.hh : col.dh, width: isHeader ? '55%' : col.dw, animation: 'none' }} />
        </div>
      ))}
      <div style={{ flex: 1 }} />
      {RIGHT_COLS.map((col, i) => (
        <div key={i} style={{ width: col.w, flexShrink: 0, paddingLeft: 16 }}>
          <div style={{ ...S, height: isHeader ? col.hh : col.dh, width: isHeader ? '55%' : col.dw, animation: 'none' }} />
        </div>
      ))}
    </div>
  );
}

export default function TableSkeleton({ rowCount = 5 }) {
  return (
    <>
      <style>{`@keyframes skeletonPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ background: '#161A1E', border: '1px solid #252A30', borderRadius: 10, overflow: 'hidden' }}>
        <Row isHeader borderBottom="1px solid #252A30" />
        {Array.from({ length: rowCount }).map((_, i) => (
          <Row key={i} delay={i * 0.1} borderBottom={i < rowCount - 1 ? '1px solid #1E2228' : 'none'} />
        ))}
      </div>
    </>
  );
}
