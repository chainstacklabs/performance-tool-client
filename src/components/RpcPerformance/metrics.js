// Pure derived metric helpers — no React, no server-only imports

export const REGION_MAP = {
  'us-east-1': 'US-East', 'us-west-1': 'US-West', 'us-west-2': 'US-West',
  'eu-west-1': 'EU-West', 'eu-central-1': 'EU-Central', 'fra1': 'EU', 'ams3': 'EU',
  'ap-southeast-1': 'APAC', 'ap-northeast-1': 'APAC', 'sgp1': 'SG', 'sin1': 'SG',
  'nyc1': 'US', 'nyc3': 'US', 'sfo3': 'US', 'lon1': 'UK',
};

export const REGION_LABEL = {
  'us-east-1':      '🇺🇸 US',
  'eu-west-1':      '🇩🇪 DE',
  'ap-southeast-1': '🇸🇬 SG',
};

export const regionShort = code => REGION_MAP[code] ?? code.split(/[-_]/)[0].toUpperCase();

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
  high:   '#FFDD33',
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

export function computeScores(enriched) {
  const vals = key => enriched.map(p => p[key]).filter(Number.isFinite);
  const norm = (v, lo, hi) => hi === lo ? 1 : Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

  const p95s   = vals('p95ms'),        [minP95,   maxP95]   = [Math.min(...p95s),   Math.max(...p95s)];
  const tails  = vals('tail'),         [minTail,  maxTail]  = [Math.min(...tails),  Math.max(...tails)];
  const avails = vals('availability'), [minAvail, maxAvail] = [Math.min(...avails), Math.max(...avails)];

  return enriched.map(p => ({
    ...p,
    score: Math.round(
      (1 - norm(p.p95ms ?? maxP95,   minP95,  maxP95))  * 40 +
      norm(p.availability ?? minAvail, minAvail, maxAvail) * 40 +
      (1 - norm(p.tail ?? maxTail,   minTail, maxTail))  * 20
    ),
  }));
}

export function availColor(pct) {
  if (!Number.isFinite(pct)) return '#656E80';
  if (pct >= 99) return '#25B15F';
  if (pct >= 97) return '#FFDD33';
  return '#FF294C';
}

export const SEVERITY_COLOR = { ok: '#25B15F', warning: '#FFDD33', error: '#FF294C' };
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
    return {
      headline: `${leader.name} ranks #1 for ${name}`,
      detail:   `${leader.p95ms} ms P95 · ${leader.availability?.toFixed(2)}% availability · lowest tail risk among tracked providers`,
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

export function regionInsight(sorted, regionList) {
  const avgByRegion = (regionList ?? []).map(r => ({
    r,
    avg: sorted.reduce((sum, p) => sum + (p.regions?.[r] ?? 0), 0) / sorted.length,
  })).sort((a, b) => a.avg - b.avg);
  const fastest = avgByRegion[0];
  const slowest = avgByRegion[avgByRegion.length - 1];
  const fl = REGION_LABEL[fastest?.r] ?? '';
  const sl = REGION_LABEL[slowest?.r] ?? '';
  return fl && sl && fl !== sl ? `${fl} fastest · ${sl} slowest` : null;
}
