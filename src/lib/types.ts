// Shared domain types for the RPC performance app.

export interface Chain {
  name: string;
  promName: string;
  publicToken: string;
}

/** A provider as produced by the data layer (latencies in seconds). */
export interface Provider {
  name: string;
  p50: number | null;
  p95: number | null;
  p99: number | null;
  /** region code → p95 latency in seconds */
  regions: Record<string, number>;
  /** region code → success rate 0–1 */
  regionSuccess: Record<string, number>;
  /** p95 trend points in seconds */
  trend: number[];
  /** mean success rate 0–1 across regions, or null when unknown (display only) */
  success: number | null;
}

export interface ChainData {
  chain: Chain;
  providers: Provider[];
  regions: string[];
  leader: Provider | null;
  /** true when there are no providers AND at least one query failed */
  error: boolean;
  /** true when providers exist but some query failed (data incomplete) */
  partial: boolean;
  /** names of the queries that failed (p50/p95/p99/success/trend) */
  degradedMetrics: string[];
}

export type TimeRange = '24h' | '7d';

export type AvailTier = 'healthy' | 'acceptable' | 'degraded' | 'unhealthy' | 'unknown';

/** Provider after enrichProviders() — latencies in ms. */
export interface EnrichedProvider extends Provider {
  /** brand name for display (raw `name` stays the identity/key) */
  displayName: string;
  p95ms: number | null;
  p99ms: number | null;
  p50ms: number | null;
  /** availability as a percentage (0–100), or null when unknown */
  availability: number | null;
}

/** Provider after computeScores(). */
export interface ScoredProvider extends EnrichedProvider {
  availTier: AvailTier;
  grafanaScore: number;
}

export interface Summary {
  headline: string;
  detail: string;
}
