import { CHAINS } from '@/lib/queries';

export default function ChainTOCSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
      {CHAINS.map((c) => (
        <div
          key={c.promName}
          className="border border-gray-800 rounded-lg p-3"
          style={{ background: '#0a0d18' }}
        >
          <div className="h-4 w-20 bg-gray-800 rounded mb-2" />
          <div className="h-6 bg-gray-800/70 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}
