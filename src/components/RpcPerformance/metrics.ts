// Pure derived metric helpers — no React, no server-only imports
import type {
  Chain,
  Provider,
  EnrichedProvider,
  ScoredProvider,
  AvailTier,
  Summary,
} from '@/lib/types';

export function enrichProviders(providers: Provider[]): EnrichedProvider[] {
  return providers.map((p) => ({
    ...p,
    p95ms: Number.isFinite(p.p95) ? Math.round((p.p95 as number) * 1000) : null,
    p99ms: Number.isFinite(p.p99) ? Math.round((p.p99 as number) * 1000) : null,
    p50ms: Number.isFinite(p.p50) ? Math.round((p.p50 as number) * 1000) : null,
    availability: Number.isFinite(p.success) ? +((p.success as number) * 100).toFixed(2) : null,
  }));
}

/**
 * Availability tiers — DISPLAY ONLY (color the availability %, and add a uptime
 * caveat to the summary). They do NOT gate ranking: ordering is purely by
 * grafanaScore, matching the compare dashboard's score panel.
 *
 *  healthy     >= 99.9%
 *  acceptable  99.0–99.9%
 *  degraded    95.0–99.0%
 *  unhealthy   < 95.0%
 */
export function availTier(pct: number | null): AvailTier {
  if (!Number.isFinite(pct)) return 'unknown';
  if ((pct as number) >= 99.9) return 'healthy';
  if ((pct as number) >= 99.0) return 'acceptable';
  if ((pct as number) >= 95.0) return 'degraded';
  return 'unhealthy';
}

/**
 * Ranking score — matches the compare dashboard's "Provider score" panel:
 *
 *   score = 1 / mean_over_regions( (1 / p95_region) × successRate_region³ )
 *
 * The speed×reliability term is computed PER REGION, then averaged, then
 * inverted. Lower score = better. SuccessRate³ makes even small reliability
 * drops (99% vs 97%) move the score noticeably. Single-region case reduces to
 * the displayed formula `1 / ((1/rt) × sr³)` = `rt / sr³`.
 *
 * If a provider has no region with both a p95 and a success rate, it is
 * unscoreable and returns Infinity (ranks last). We do NOT substitute a
 * latency-only number — that would silently change the ranking. A wholesale
 * success-query failure surfaces via the partial-data banner instead.
 */
function grafanaScore(p: Provider): number {
  const terms: number[] = [];
  for (const [region, p95r] of Object.entries(p.regions)) {
    const srr = p.regionSuccess[region];
    if (!Number.isFinite(p95r) || p95r <= 0) continue;
    if (!Number.isFinite(srr)) continue; // no reliability data for this region
    terms.push((1 / p95r) * Math.pow(srr, 3));
  }
  if (terms.length === 0) return Infinity;
  const mean = terms.reduce((a, b) => a + b, 0) / terms.length;
  return mean > 0 ? 1 / mean : Infinity;
}

export function computeScores(enriched: EnrichedProvider[]): ScoredProvider[] {
  return enriched.map((p) => ({
    ...p,
    availTier:    availTier(p.availability),
    grafanaScore: grafanaScore(p),
  }));
}

export function sortByScore(providers: ScoredProvider[]): ScoredProvider[] {
  return [...providers].sort((a, b) => (a.grafanaScore ?? Infinity) - (b.grafanaScore ?? Infinity));
}

export function generateSummary(chain: Chain, sorted: ScoredProvider[]): Summary | null {
  const leader = sorted[0];
  if (!leader) return null;
  const name = chain.name;

  // The headline always names the actual #1 row (sorted[0]) — no swapping in a
  // different provider. Tier only adds a uptime caveat to the detail line.
  const tier   = leader.availTier ?? availTier(leader.availability);
  const avPct  = Number.isFinite(leader.availability) ? `${(leader.availability as number).toFixed(2)}%` : null;
  const p95str = leader.p95ms != null ? `${leader.p95ms} ms P95` : null;

  const detail = [
    avPct  ? `${avPct} availability` : null,
    p95str,
    tier === 'unhealthy' ? 'low uptime — check availability' :
    tier === 'degraded'  ? 'degraded uptime' : null,
  ].filter(Boolean).join(' · ');

  return {
    headline: `${leader.name} ranks #1 for ${name}`,
    detail,
  };
}
