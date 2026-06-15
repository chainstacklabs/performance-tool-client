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
 * Availability tiers — reliability is checked FIRST, latency second.
 *
 *  healthy    >= 99.9% → fully eligible for #1
 *  acceptable  99.0–99.9% → eligible with penalty
 *  degraded    95.0–99.0% → cannot be #1
 *  unhealthy   < 95.0%  → excluded from best-provider ranking
 */
export function availTier(pct: number | null): AvailTier {
  if (!Number.isFinite(pct)) return 'unknown';
  if ((pct as number) >= 99.9) return 'healthy';
  if ((pct as number) >= 99.0) return 'acceptable';
  if ((pct as number) >= 95.0) return 'degraded';
  return 'unhealthy';
}

const TIER_RANK: Record<AvailTier, number> = {
  healthy: 0, acceptable: 1, degraded: 2, unhealthy: 3, unknown: 4,
};

/**
 * Grafana scoring formula:
 *   score = ResponseTime / SuccessRate³
 *
 * Lower score = better (faster + more reliable).
 * A fast but unreliable provider scores worse than a slightly slower but fully reliable one.
 *
 * When success rate is unknown (the success query failed), we rank by latency
 * alone rather than treating it as 0% — a missing metric must not silently sink
 * every provider to Infinity and destroy the ordering. The partial-data state
 * is surfaced separately in the UI.
 */
function grafanaScore(p: Provider): number {
  const rt = p.p95; // response time in seconds
  if (!Number.isFinite(rt) || (rt as number) <= 0) return Infinity;
  const sr = p.success;
  if (sr == null) return rt as number;   // success unknown → latency-only ranking
  if (sr <= 0) return Infinity;           // genuinely 0% success → worst
  return (rt as number) / Math.pow(sr, 3);
}

export function computeScores(enriched: EnrichedProvider[]): ScoredProvider[] {
  return enriched.map((p) => ({
    ...p,
    availTier:    availTier(p.availability),
    grafanaScore: grafanaScore(p),
  }));
}

export function sortByReliabilityThenLatency(providers: ScoredProvider[]): ScoredProvider[] {
  return [...providers].sort((a, b) => (a.grafanaScore ?? Infinity) - (b.grafanaScore ?? Infinity));
}

export function generateSummary(chain: Chain, sorted: ScoredProvider[]): Summary | null {
  const leader = sorted[0];
  if (!leader) return null;
  const name = chain.name;

  const tier   = leader.availTier ?? availTier(leader.availability);
  const avPct  = Number.isFinite(leader.availability) ? `${(leader.availability as number).toFixed(2)}%` : null;
  const p95str = leader.p95ms != null ? `${leader.p95ms} ms P95` : null;

  if (tier === 'unhealthy') {
    const eligible = sorted.find((p) => TIER_RANK[p.availTier ?? 'unknown'] <= 1);
    if (eligible) {
      return {
        headline: `${eligible.name} leads ${name} — reliable & fast`,
        detail:   `${eligible.p95ms} ms P95 · ${eligible.availability?.toFixed(2)}% availability · ${leader.name} has lower latency but only ${avPct} uptime`,
      };
    }
    return {
      headline: `No fully reliable provider for ${name}`,
      detail:   `${leader.name} has ${p95str ?? '—'} but only ${avPct ?? '?'} availability`,
    };
  }

  if (tier === 'degraded') {
    const eligible = sorted.find((p) => TIER_RANK[p.availTier ?? 'unknown'] <= 1);
    if (eligible) {
      return {
        headline: `${eligible.name} ranks #1 for ${name}`,
        detail:   `${eligible.p95ms} ms P95 · ${eligible.availability?.toFixed(2)}% availability · ${leader.name} excluded — degraded uptime (${avPct})`,
      };
    }
  }

  const detail = [
    avPct  ? `${avPct} availability` : null,
    p95str ?? null,
  ].filter(Boolean).join(' · ');

  return {
    headline: `${leader.name} ranks #1 for ${name}`,
    detail,
  };
}
