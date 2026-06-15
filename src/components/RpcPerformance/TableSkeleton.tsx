const ROW_H = 68;
const HEADER_H = 44;

interface ColSpec {
  w: number;
  hh: number;
  dh: number;
  dw: string;
}

const LEFT_COLS: ColSpec[] = [
  { w: 160, hh: 10, dh: 12, dw: '75%' },
  { w: 130, hh: 10, dh: 12, dw: '65%' },
  { w: 220, hh: 10, dh: 8,  dw: '80%' },
  { w: 140, hh: 10, dh: 24, dw: '100%' },
];
const RIGHT_COLS: ColSpec[] = [
  { w: 80, hh: 10, dh: 12, dw: '65%' },
  { w: 80, hh: 10, dh: 12, dw: '65%' },
  { w: 80, hh: 10, dh: 12, dw: '65%' },
];

const Bar = ({ h, w }: { h: number | string; w: number | string }) => (
  <div className="rounded bg-white/[0.07] shrink-0" style={{ height: h, width: w }} />
);

function Row({ isHeader, delay, lastRow }: { isHeader?: boolean; delay?: number; lastRow?: boolean }) {
  return (
    <div
      className={`flex items-center px-4 ${isHeader ? '' : 'animate-skeletonPulse'} ${
        isHeader ? 'border-b border-panel-border' : lastRow ? '' : 'border-b border-panel-row'
      }`}
      style={{ height: isHeader ? HEADER_H : ROW_H, animationDelay: delay != null ? `${delay}s` : undefined }}
    >
      {LEFT_COLS.map((col, i) => (
        <div key={i} className="shrink-0 pr-4" style={{ width: col.w }}>
          <Bar h={isHeader ? col.hh : col.dh} w={isHeader ? '55%' : col.dw} />
        </div>
      ))}
      <div className="flex-1" />
      {RIGHT_COLS.map((col, i) => (
        <div key={i} className="shrink-0 pl-4" style={{ width: col.w }}>
          <Bar h={isHeader ? col.hh : col.dh} w={isHeader ? '55%' : col.dw} />
        </div>
      ))}
    </div>
  );
}

export default function TableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="bg-panel border border-panel-border rounded-[10px] overflow-hidden">
      <Row isHeader />
      {Array.from({ length: rowCount }).map((_, i) => (
        <Row key={i} delay={i * 0.1} lastRow={i === rowCount - 1} />
      ))}
    </div>
  );
}
