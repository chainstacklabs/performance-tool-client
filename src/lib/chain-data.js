import 'server-only';
import { cache } from 'react';
import { runPromQuery, runPromRangeQuery } from './grafana';
import { getMockChainData } from './mock-data';
import {
  providerByRegionQuery,
  providerTrendQuery,
  providerSuccessQuery,
} from './queries';

const TREND_STEP_SECONDS = 3600;
const TREND_WINDOW_SECONDS = 24 * 3600;

function minuteAlignedEnd() {
  return Math.floor(Date.now() / 60000) * 60;
}

async function safe(label, promise) {
  try {
    return { ok: true, value: await promise };
  } catch (err) {
    console.error(`[grafana] ${label}: ${err.message}`);
    return { ok: false };
  }
}

function quantileByRegionToMap(rows) {
  const m = new Map();
  for (const r of rows ?? []) {
    const provider = r.metric.provider;
    const region = r.metric.source_region ?? 'unknown';
    const v = parseFloat(r.value[1]);
    if (!Number.isFinite(v)) continue;
    if (!m.has(provider)) m.set(provider, new Map());
    m.get(provider).set(region, v);
  }
  return m;
}

function avgOfMap(regionMap) {
  if (!regionMap?.size) return null;
  let sum = 0;
  let n = 0;
  for (const v of regionMap.values()) {
    sum += v;
    n += 1;
  }
  return n ? sum / n : null;
}

function successByProviderToMap(rows) {
  const m = new Map();
  for (const r of rows ?? []) {
    const v = parseFloat(r.value[1]);
    if (Number.isFinite(v)) m.set(r.metric.provider, v);
  }
  return m;
}

function trendToMap(rows) {
  const m = new Map();
  for (const r of rows ?? []) {
    const provider = r.metric.provider;
    const values = (r.values ?? [])
      .map(([, v]) => parseFloat(v))
      .filter((v) => Number.isFinite(v));
    m.set(provider, values);
  }
  return m;
}

export const fetchChainData = cache(async (chain) => {
  if (!process.env.GRAFANA_API_TOKEN) {
    return getMockChainData(chain);
  }

  const end = minuteAlignedEnd();
  const start = end - TREND_WINDOW_SECONDS;

  const [p50, p95, p99, success, trend] = await Promise.all([
    safe('p50', runPromQuery(providerByRegionQuery(chain.promName, 0.5))),
    safe('p95', runPromQuery(providerByRegionQuery(chain.promName, 0.95))),
    safe('p99', runPromQuery(providerByRegionQuery(chain.promName, 0.99))),
    safe('success', runPromQuery(providerSuccessQuery(chain.promName))),
    safe(
      'trend',
      runPromRangeQuery(providerTrendQuery(chain.promName), {
        start,
        end,
        step: TREND_STEP_SECONDS,
      })
    ),
  ]);

  const hadError = [p50, p95, p99, success, trend].some((r) => !r.ok);

  const p50Map = p50.ok ? quantileByRegionToMap(p50.value) : new Map();
  const p95Map = p95.ok ? quantileByRegionToMap(p95.value) : new Map();
  const p99Map = p99.ok ? quantileByRegionToMap(p99.value) : new Map();
  const trendMap = trend.ok ? trendToMap(trend.value) : new Map();
  const successMap = success.ok ? successByProviderToMap(success.value) : new Map();

  const providerNames = new Set([
    ...p50Map.keys(),
    ...p95Map.keys(),
    ...p99Map.keys(),
  ]);

  const regions = new Set();
  for (const m of [p50Map, p95Map, p99Map]) {
    for (const regionMap of m.values()) {
      for (const r of regionMap.keys()) regions.add(r);
    }
  }

  const providers = [...providerNames]
    .map((name) => ({
      name,
      p50: avgOfMap(p50Map.get(name)),
      p95: avgOfMap(p95Map.get(name)),
      p99: avgOfMap(p99Map.get(name)),
      regions: Object.fromEntries(p95Map.get(name) ?? []),
      trend: trendMap.get(name) ?? [],
      success: successMap.get(name) ?? null,
    }))
    .filter((p) => p.p95 !== null)
    .sort((a, b) => a.p95 - b.p95);

  return {
    chain,
    providers,
    regions: [...regions].sort(),
    leader: providers[0] ?? null,
    error: providers.length === 0 && hadError,
  };
});
