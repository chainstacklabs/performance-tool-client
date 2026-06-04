// Pure derived metric helpers — no React, no server-only imports

export const REGION_MAP = {
  'us-east-1': 'US-East', 'us-west-1': 'US-West', 'us-west-2': 'US-West',
  'eu-west-1': 'EU-West', 'eu-central-1': 'EU-Central', 'fra1': 'EU', 'ams3': 'EU',
  'ap-southeast-1': 'APAC', 'ap-northeast-1': 'APAC', 'sgp1': 'SG', 'sin1': 'SG',
  'nyc1': 'US', 'nyc3': 'US', 'sfo3': 'US', 'lon1': 'UK',
};

export const REGION_LABEL = {
  'us-east-1': 'US-East',
  'eu-west-1': 'EU-West',
  'ap-southeast-1': 'APAC',
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

export function enrichProviders(providers, regionList) {
  return providers.map(p => {
    const p95ms = Number.isFinite(p.p95) ? Math.round(p.p95 * 1000) : null;
    const p99ms = Number.isFinite(p.p99) ? Math.round(p.p99 * 1000) : null;
    const p50ms = Number.isFinite(p.p50) ? Math.round(p.p50 * 1000) : null;
    const availability = Number.isFinite(p.success) ? +(p.success * 100).toFixed(2) : null;
    const worst = worstRegion(p.regions, regionList);
    const best  = bestRegion(p.regions, regionList);
    const tail  = Number.isFinite(p99ms) && Number.isFinite(p95ms) ? p99ms - p95ms : null;
    return {
      ...p,
      p95ms, p99ms, p50ms, availability,
      tail,
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

  const p95s   = vals('p95ms'),   [minP95,  maxP95]  = [Math.min(...p95s),   Math.max(...p95s)];
  const tails  = vals('tail'),    [minTail, maxTail]  = [Math.min(...tails),  Math.max(...tails)];
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

function lerpHex(a, b, t) {
  const h = s => [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)];
  const [ar,ag,ab] = h(a), [br,bg,bb] = h(b);
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}

export function p95Color(ms) {
  if (!Number.isFinite(ms)) return '#656E80';
  const t = Math.min(1, ms / 400);
  return t <= 0.5
    ? lerpHex('#25B15F', '#FFDD33', t * 2)
    : lerpHex('#FFDD33', '#FF294C', (t - 0.5) * 2);
}

export function availColor(pct) {
  if (!Number.isFinite(pct)) return '#656E80';
  if (pct >= 99.9) return '#8D95A5';
  if (pct >= 99.5) return '#FFDD33';
  return '#FF294C';
}

export const SEVERITY_COLOR = { ok: '#8D95A5', warning: '#FFDD33', error: '#FF294C' };
export const SEVERITY_LABEL = { ok: 'OK', warning: '⚠ warning', error: '✕ error' };
export const severityColor = s => SEVERITY_COLOR[s] ?? '#8D95A5';
export const severityLabel = s => SEVERITY_LABEL[s] ?? s;

export function generateSummary(useCase, view, chain, sorted, regionList) {
  const leader = sorted[0];
  if (!leader) return null;
  const name = chain.name;

  if (useCase === 'compare') {
    if (view === 'overview') {
      return `${leader.name} ranks #1 for ${name}: ${leader.p95ms} ms P95 · ${leader.availability?.toFixed(2)}% availability · lowest tail risk.`;
    }
    if (view === 'latency') {
      return `${leader.name} has the lowest latency for ${name}: P50 ${leader.p50ms} ms · P95 ${leader.p95ms} ms · tail +${leader.tail} ms.`;
    }
    if (view === 'regions') {
      const avgByRegion = (regionList ?? []).map(r => ({
        r,
        avg: sorted.reduce((sum, p) => sum + (p.regions?.[r] ?? 0), 0) / sorted.length,
      })).sort((a, b) => a.avg - b.avg);
      const fastest = avgByRegion[0];
      const slowest = avgByRegion[avgByRegion.length - 1];
      const fl = REGION_LABEL[fastest?.r] ?? fastest?.r ?? '';
      const sl = REGION_LABEL[slowest?.r] ?? slowest?.r ?? '';
      return fl && sl ? `${fl} is fastest for all providers. ${sl} is slowest for all providers.` : null;
    }
  }
  if (useCase === 'reliability') {
    return `${leader.name} leads ${name} reliability: ${leader.availability?.toFixed(2)}% availability · ${leader.incidents ?? 0} incidents · tail +${leader.tail} ms.`;
  }
  if (useCase === 'issues') {
    const issues = sorted.filter(p => p.severity !== 'ok');
    if (!issues.length) return `No critical ${name} issues detected. All providers are healthy.`;
    return `${issues.length} provider${issues.length > 1 ? 's' : ''} with elevated risk: ${issues.map(p => p.name).join(', ')}.`;
  }
  return null;
}
