// Pure derived metric helpers — no React, no server-only imports
import { SIGNAL } from '@/lib/theme';

export function worstRegion(regionsMap, regionList) {
  let worst = null, worstVal = -Infinity;
  for (const r of regionList ?? []) {
    const v = regionsMap?.[r];
    if (Number.isFinite(v) && v > worstVal) { worst = r; worstVal = v; }
  }
  return worst;
}

export function bestRegion(regionsMap, regionList) {
  let best = null, bestVal = Infinity;
  for (const r of regionList ?? []) {
    const v = regionsMap?.[r];
    if (Number.isFinite(v) && v < bestVal) { best = r; bestVal = v; }
  }
  return best;
}

export function regionalSpread(regionsMap, regionList) {
  const vals = (regionList ?? []).map(r => regionsMap?.[r]).filter(Number.isFinite);
  if (vals.length < 2) return null;
  return Math.round((Math.max(...vals) - Math.min(...vals)) * 1000);
}

export function severity(p) {
  if ((p.incidents ?? 0) >= 3 || p.trendStatus === 'spiky') return 'error';
  if ((p.incidents ?? 0) >= 1 || p.trendStatus === 'down' || p.trendStatus === 'mixed') return 'warning';
  return 'ok';
}

export function tailRiskLevel(tail) {
  if (!Number.isFinite(tail)) return 'low';
  if (tail < 75)  return 'low';
  if (tail < 150) return 'medium';
  return 'high';
}

export const TAIL_RISK_COLOR = {
  low:    '#4A7A5A',
  medium: '#656E80',
  high:   SIGNAL.warn,
};

export function enrichProviders(providers, regionList) {
  return providers.map(p => {
    const p95ms = Number.isFinite(p.p95) ? Math.round(p.p95 * 1000) : null;
    const p99ms = Number.isFinite(p.p99) ? Math.round(p.p99 * 1000) : null;
    const p50ms = Number.isFinite(p.p50) ? Math.round(p.p50 * 1000) : null;
    const availability = Number.isFinite(p.success) ? +(p.success * 100).toFixed(2) : null;
    const worst = worstRegion(p.regions, regionList);
    const best  = bestRegion(p.regions, regionList);
    const tail  = Number.isFinite(p99ms) && Number.isFinite(p95ms) ? p99ms - p95ms : null;
    // delta vs expected baseline (p95 - p50 * 1.4 approximates expected spread)
    const delta = p95ms != null && p50ms != null ? Math.round(p95ms - p50ms * 1.4) : null;
    return {
      ...p,
      p95ms, p99ms, p50ms, availability,
      tail,
      tailLevel: tailRiskLevel(tail),
      delta,
      errorRate: Number.isFinite(availability) ? +(100 - availability).toFixed(4) : null,
      worstRegion: worst,
      bestRegion:  best,
      worstRegionMs: worst ? Math.round((p.regions[worst] ?? 0) * 1000) : null,
      bestRegionMs:  best  ? Math.round((p.regions[best]  ?? 0) * 1000) : null,
      regionalSpread: regionalSpread(p.regions, regionList),
      severity: severity(p),
      score: 0,
    };
  });
}

/**
 * Availability tiers — reliability is checked FIRST, latency second.
 *
 *  healthy    >= 99.9% → fully eligible for #1
 *  acceptable  99.0–99.9% → eligible with penalty
 *  degraded    95.0–99.0% → cannot be #1
 *  unhealthy   < 95.0%  → excluded from best-provider ranking
 */
export function availTier(pct) {
  if (!Number.isFinite(pct)) return 'unknown';
  if (pct >= 99.9) return 'healthy';
  if (pct >= 99.0) return 'acceptable';
  if (pct >= 95.0) return 'degraded';
  return 'unhealthy';
}

const TIER_RANK = { healthy: 0, acceptable: 1, degraded: 2, unhealthy: 3, unknown: 4 };

/**
 * Grafana scoring formula:
 *   score = ResponseTime / SuccessRate³
 *
 * Lower score = better (faster + more reliable).
 * A fast but unreliable provider scores worse than a slightly slower but fully reliable one.
 */
function grafanaScore(p) {
  const rt = p.p95;                          // response time in seconds
  const sr = Number.isFinite(p.success) ? p.success : 0;
  if (!Number.isFinite(rt) || rt <= 0) return Infinity;
  if (sr <= 0) return Infinity;
  return rt / Math.pow(sr, 3);
}

export function computeScores(enriched) {
  return enriched.map(p => ({
    ...p,
    availTier:    availTier(p.availability),
    grafanaScore: grafanaScore(p),
  }));
}

export function sortByReliabilityThenLatency(providers) {
  return [...providers].sort((a, b) => (a.grafanaScore ?? Infinity) - (b.grafanaScore ?? Infinity));
}

export function availColor(pct) {
  if (!Number.isFinite(pct)) return '#656E80';
  if (pct >= 99) return SIGNAL.ok;
  if (pct >= 97) return SIGNAL.warn;
  return SIGNAL.bad;
}

export const SEVERITY_COLOR = { ok: SIGNAL.ok, warning: SIGNAL.warn, error: SIGNAL.bad };
export const severityColor = s => SEVERITY_COLOR[s] ?? '#8D95A5';

export function issueNotes(p) {
  if (p.severity === 'ok') return 'no issues';
  if (p.trendStatus === 'spiky' || p.tailLevel === 'high') return 'high latency tail';
  if ((p.p95ms ?? 0) > 200) return 'elevated latency';
  if (p.trendStatus === 'down') return 'trending down';
  if (p.trendStatus === 'mixed') return 'mixed signals';
  if ((p.incidents ?? 0) > 0) return 'mild degradation';
  return 'no issues';
}

export function generateSummary(view, chain, sorted) {
  const leader = sorted[0];
  if (!leader) return null;
  const name = chain.name;

  if (view === 'overview' || view === 'latency') {
    const tier   = leader.availTier ?? availTier(leader.availability);
    const avPct  = Number.isFinite(leader.availability) ? `${leader.availability.toFixed(2)}%` : null;
    const p95str = leader.p95ms != null ? `${leader.p95ms} ms P95` : null;

    // Find the fastest provider by raw P95 (ignoring tier) to call out if degraded
    const fastestRaw = [...sorted].sort((a, b) => (a.p95ms ?? Infinity) - (b.p95ms ?? Infinity))[0];
    const fastestIsDifferent = fastestRaw && fastestRaw.name !== leader.name;

    if (tier === 'unhealthy') {
      const eligible = sorted.find(p => TIER_RANK[p.availTier ?? 'unknown'] <= 1);
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
      const eligible = sorted.find(p => TIER_RANK[p.availTier ?? 'unknown'] <= 1);
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
  if (view === 'reliability') {
    return {
      headline: `${leader.name} leads ${name} reliability`,
      detail:   `${leader.availability?.toFixed(2)}% availability · ${leader.incidents ?? 0} incidents · tail +${leader.tail} ms`,
    };
  }
  if (view === 'regions') {
    return null; // insight shown instead
  }
  if (view === 'issues') {
    const issues = sorted.filter(p => p.severity !== 'ok');
    if (!issues.length) {
      return { headline: `All providers healthy`, detail: `No critical ${name} issues detected.` };
    }
    return {
      headline: `${issues.length} provider${issues.length > 1 ? 's' : ''} with elevated risk`,
      detail:   issues.map(p => p.name).join(', '),
    };
  }
  return null;
}
