import 'server-only';

// Realistic mock latency data for UI development without a Grafana token.
// Values are in seconds (same unit as real Prometheus data).

const REGIONS = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];

function makeTrend(base, variance = 0.1) {
  return Array.from({ length: 24 }, (_, i) => {
    const noise = (Math.random() - 0.5) * variance;
    const drift = Math.sin(i / 4) * variance * 0.5;
    return Math.max(0.01, base + noise + drift);
  });
}

function makeProviders(chainSeed) {
  const s = chainSeed;
  return [
    {
      name: 'Chainstack',
      p50: 0.045 * s, p95: 0.082 * s, p99: 0.140 * s,
      regions: { 'us-east-1': 0.071 * s, 'eu-west-1': 0.088 * s, 'ap-southeast-1': 0.098 * s },
      trend: makeTrend(0.082 * s, 0.015 * s),
      success: 0.9997,
    },
    {
      name: 'Alchemy',
      p50: 0.062 * s, p95: 0.118 * s, p99: 0.210 * s,
      regions: { 'us-east-1': 0.095 * s, 'eu-west-1': 0.130 * s, 'ap-southeast-1': 0.148 * s },
      trend: makeTrend(0.118 * s, 0.022 * s),
      success: 0.9991,
    },
    {
      name: 'Infura',
      p50: 0.078 * s, p95: 0.145 * s, p99: 0.260 * s,
      regions: { 'us-east-1': 0.120 * s, 'eu-west-1': 0.158 * s, 'ap-southeast-1': 0.172 * s },
      trend: makeTrend(0.145 * s, 0.030 * s),
      success: 0.9985,
    },
    {
      name: 'QuickNode',
      p50: 0.091 * s, p95: 0.168 * s, p99: 0.290 * s,
      regions: { 'us-east-1': 0.140 * s, 'eu-west-1': 0.182 * s, 'ap-southeast-1': 0.201 * s },
      trend: makeTrend(0.168 * s, 0.035 * s),
      success: 0.9978,
    },
    {
      name: 'Ankr',
      p50: 0.110 * s, p95: 0.210 * s, p99: 0.380 * s,
      regions: { 'us-east-1': 0.175 * s, 'eu-west-1': 0.225 * s, 'ap-southeast-1': 0.248 * s },
      trend: makeTrend(0.210 * s, 0.045 * s),
      success: 0.9962,
    },
    {
      name: 'Blast',
      p50: 0.130 * s, p95: 0.250 * s, p99: 0.450 * s,
      regions: { 'us-east-1': 0.210 * s, 'eu-west-1': 0.268 * s, 'ap-southeast-1': 0.292 * s },
      trend: makeTrend(0.250 * s, 0.055 * s),
      success: 0.9944,
    },
  ];
}

const CHAIN_SEEDS = {
  Ethereum: 1.00,
  Arbitrum: 0.72,
  Base: 0.68,
  BNB: 0.85,
  Hyperliquid: 0.55,
  Monad: 0.60,
  Solana: 0.48,
  TON: 0.90,
};

export function getMockChainData(chain) {
  const seed = CHAIN_SEEDS[chain.promName] ?? 1.0;
  const providers = makeProviders(seed);
  return {
    chain,
    providers,
    regions: REGIONS,
    leader: providers[0],
    error: false,
  };
}
