import 'server-only';

const REGIONS = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];

function makeTrend(base, variance = 0.1) {
  return Array.from({ length: 24 }, (_, i) => {
    const noise = (Math.random() - 0.5) * variance;
    const drift = Math.sin(i / 4) * variance * 0.5;
    return Math.max(0.01, base + noise + drift);
  });
}

// Exact values per spec (converted to seconds for Grafana-compatible format)
const PROVIDERS = [
  {
    name: 'Chainstack',
    p50: 0.045, p95: 0.082, p99: 0.140,
    regions: { 'us-east-1': 0.071, 'eu-west-1': 0.088, 'ap-southeast-1': 0.098 },
    success: 0.9997, trendStatus: 'stable', incidents: 0,
  },
  {
    name: 'Alchemy',
    p50: 0.062, p95: 0.118, p99: 0.210,
    regions: { 'us-east-1': 0.095, 'eu-west-1': 0.130, 'ap-southeast-1': 0.148 },
    success: 0.9991, trendStatus: 'stable', incidents: 0,
  },
  {
    name: 'Infura',
    p50: 0.078, p95: 0.145, p99: 0.260,
    regions: { 'us-east-1': 0.120, 'eu-west-1': 0.158, 'ap-southeast-1': 0.172 },
    success: 0.9985, trendStatus: 'down', incidents: 1,
  },
  {
    name: 'QuickNode',
    p50: 0.091, p95: 0.168, p99: 0.290,
    regions: { 'us-east-1': 0.140, 'eu-west-1': 0.182, 'ap-southeast-1': 0.201 },
    success: 0.9978, trendStatus: 'down', incidents: 1,
  },
  {
    name: 'Ankr',
    p50: 0.110, p95: 0.210, p99: 0.380,
    regions: { 'us-east-1': 0.175, 'eu-west-1': 0.225, 'ap-southeast-1': 0.248 },
    success: 0.9962, trendStatus: 'mixed', incidents: 2,
  },
  {
    name: 'Blast',
    p50: 0.130, p95: 0.250, p99: 0.450,
    regions: { 'us-east-1': 0.210, 'eu-west-1': 0.268, 'ap-southeast-1': 0.292 },
    success: 0.9944, trendStatus: 'spiky', incidents: 3,
  },
];

const CHAIN_SCALE = {
  Ethereum: 1.00, Arbitrum: 0.72, Base: 0.68,
  BNB: 0.85, Hyperliquid: 0.55, Monad: 0.60,
  Solana: 0.48, TON: 0.90,
};

export function getMockChainData(chain) {
  const s = CHAIN_SCALE[chain.promName] ?? 1.0;
  const providers = PROVIDERS.map(p => ({
    ...p,
    p50: p.p50 * s, p95: p.p95 * s, p99: p.p99 * s,
    regions: Object.fromEntries(
      Object.entries(p.regions).map(([k, v]) => [k, v * s])
    ),
    trend: makeTrend(p.p95 * s, 0.015 * s),
  }));
  return {
    chain,
    providers,
    regions: REGIONS,
    leader: providers[0],
    error: false,
  };
}
