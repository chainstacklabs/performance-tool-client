// promName matches the `blockchain` label in Prometheus.
// publicToken is the access token for the chain's public Grafana dashboard,
// audited from the dashboards themselves on 2026-05-22.
export const CHAINS = [
  { name: 'Ethereum',    promName: 'Ethereum',    publicToken: '65c0fcb02f994faf845d4ec095771bd0' },
  { name: 'Arbitrum',    promName: 'Arbitrum',    publicToken: 'b8f98de094e84c17becb38a1b318e2f2' },
  { name: 'Base',        promName: 'Base',        publicToken: '11861148d82247128307025fac628b6e' },
  { name: 'BNB Chain',   promName: 'BNB',         publicToken: '059a680a502a4d8782e93fcc1f2f1be9' },
  { name: 'Hyperliquid', promName: 'Hyperliquid', publicToken: '5f957bbcc3ae4c9d8d9669a299a24676' },
  { name: 'Monad',       promName: 'Monad',       publicToken: 'ae4e8ccc089b460f95d5d2f29dd0d022' },
  { name: 'Solana',      promName: 'Solana',      publicToken: '254601572d9a4b7a90122e46248f82b0' },
  { name: 'TON',         promName: 'TON',         publicToken: 'deeaf524ea264f42a12718f675511b13' },
];

const baseSelector = (chain) =>
  `response_latency_seconds{metric_type="response_time",blockchain="${chain}",response_status="success",provider!~"TEST_.*"}`;

// Per-provider, per-region quantile latency over 24h. Aggregating by
// `avg by (provider)` on the result gives the global per-provider number
// (matches the source dashboard's regional p95 panel aggregation).
export const providerByRegionQuery = (chain, q) => `
avg by (provider, source_region) (
  quantile_over_time(${q},
    (${baseSelector(chain)} > 0)[24h:1m]
  )
)`.trim();

// Per-provider success rate over 24h (successful samples / all samples).
export const providerSuccessQuery = (chain) => `
sum by (provider) (count_over_time(response_latency_seconds{
  metric_type="response_time",
  blockchain="${chain}",
  response_status="success",
  provider!~"TEST_.*"
}[24h]))
/
sum by (provider) (count_over_time(response_latency_seconds{
  metric_type="response_time",
  blockchain="${chain}",
  provider!~"TEST_.*"
}[24h]))`.trim();

// Per-provider p95 latency, evaluated at each step over a time range.
// Used for inline sparklines — each point is p95 over a trailing 1h window;
// the 24h range at a 1h step yields ~24 points.
export const providerTrendQuery = (chain) => `
avg by (provider) (
  quantile_over_time(0.95,
    (${baseSelector(chain)} > 0)[1h:1m]
  )
)`.trim();
