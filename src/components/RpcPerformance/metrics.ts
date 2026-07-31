// Pure derived metric helpers — no React, no server-only imports
import { providerDisplayName } from './providerName';
import { isNum } from '@/lib/num';
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
    displayName: providerDisplayName(p.name),
    p95ms: isNum(p.p95) ? Math.round(p.p95 * 1000) : null,
    p99ms: isNum(p.p99) ? Math.round(p.p99 * 1000) : null,
    p50ms: isNum(p.p50) ? Math.round(p.p50 * 1000) : null,
    // Truncated, not rounded, so the displayed figure can never contradict the
    // tier colour: rounding 99.897% up to "99.90%" reads as a threshold bug when
    // availTier (correctly, on the raw value) calls it `acceptable`, not
    // `healthy`. Truncation only ever moves the number away from the boundary.
    availability: isNum(p.success) ? Math.floor(p.success * 10000) / 100 : null,
  }));
}

/**
 * Availability tiers — DISPLAY ONLY (color the availability %, and add a uptime
 * caveat to the summary). They do NOT gate ranking: ordering is purely Grafana's
 * score, which already folds reliability in.
 *
 * Takes a percentage (0–100) and must be given the UNROUNDED value — rounding
 * first lets 99.895% cross into `healthy`.
 *
 *  healthy     >= 99.9%
 *  acceptable  [99.0, 99.9)
 *  degraded    [95.0, 99.0)
 *  unhealthy   < 95.0%
 */
export function availTier(pct: number | null): AvailTier {
  if (!isNum(pct)) return 'unknown';
  if (pct >= 99.9) return 'healthy';
  if (pct >= 99.0) return 'acceptable';
  if (pct >= 95.0) return 'degraded';
  return 'unhealthy';
}

/**
 * Attach the ranking score. This app deliberately does NOT compute one: the
 * formula lives in Grafana's "Provider score" panel and is fetched in
 * lib/score.ts, so the site and the dashboard it links to can never disagree.
 * A re-implementation used to live here and did drift out of sync.
 *
 * Providers with no score from Grafana get Infinity and rank last, keeping their
 * incoming p95 order. We do NOT substitute a locally derived number — inventing
 * a ranking is worse than not having one, and the partial-data banner already
 * tells the user the score is missing.
 */
export function computeScores(enriched: EnrichedProvider[]): ScoredProvider[] {
  return enriched.map((p) => ({
    ...p,
    // Tier off the raw success rate, not the 2dp-rounded display value, so
    // 99.895% doesn't get rounded up into `healthy`.
    availTier:    availTier(isNum(p.success) ? p.success * 100 : null),
    grafanaScore: isNum(p.score) ? p.score : Infinity,
  }));
}

/**
 * Ties (notably several unscoreable Infinity providers) keep their incoming
 * order, which fetchChainData sets to ascending p95 — a sane fallback. Relies on
 * Array#sort being stable and on an Infinity−Infinity=NaN comparator result
 * being treated as 0, both of which the spec guarantees.
 */
export function sortByScore(providers: ScoredProvider[]): ScoredProvider[] {
  return [...providers].sort((a, b) => a.grafanaScore - b.grafanaScore);
}

export function generateSummary(chain: Chain, sorted: ScoredProvider[]): Summary | null {
  const leader = sorted[0];
  if (!leader) return null;
  const name = chain.name;

  // The headline always names the actual top row (sorted[0]) — no swapping in a
  // different provider. Tier only adds a uptime caveat to the detail line.
  const tier   = leader.availTier;
  // Without a score from Grafana there is no ranking, and sortByScore has fallen
  // back to p95 order. Describe what we can actually see instead of claiming a
  // rank we didn't compute.
  const ranked = Number.isFinite(leader.grafanaScore);
  const avPct  = isNum(leader.availability) ? `${leader.availability.toFixed(2)}%` : null;
  const p95str = leader.p95ms != null ? `${leader.p95ms} ms P95` : null;

  const detail = [
    avPct  ? `${avPct} availability` : null,
    p95str,
    tier === 'unhealthy' ? 'low uptime — check availability' :
    tier === 'degraded'  ? 'degraded uptime' : null,
  ].filter(Boolean).join(' · ');

  return {
    headline: ranked
      ? `${leader.displayName} ranks #1 for ${name}`
      : `${leader.displayName} has the lowest P95 for ${name}`,
    detail,
  };
}
