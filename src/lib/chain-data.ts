import 'server-only';
import { cache } from 'react';
import { runPromQuery, runPromRangeQuery } from './grafana';
import type { PromInstantResult, PromRangeResult } from './grafana';
import { providerByRegionQuery, providerTrendQuery, providerSuccessQuery } from './queries';
import type { Chain, ChainData, Provider, TimeRange } from './types';

// Trend (sparkline) span per range. Step is sized to keep ~168 points either way.
const TREND_RANGE: Record<TimeRange, { windowSeconds: number; stepSeconds: number }> = {
  '24h': { windowSeconds: 24 * 3600,     stepSeconds: 3600 },
  '7d':  { windowSeconds: 7 * 24 * 3600, stepSeconds: 3600 },
};

function minuteAlignedEnd(): number {
  return Math.floor(Date.now() / 60000) * 60;
}

type SafeResult<T> = { ok: true; value: T } | { ok: false };

async function safe<T>(label: string, promise: Promise<T>): Promise<SafeResult<T>> {
  try {
    return { ok: true, value: await promise };
  } catch (err) {
    console.error(`[grafana] ${label}: ${(err as Error).message}`);
    return { ok: false };
  }
}

type RegionMap = Map<string, Map<string, number>>;

function quantileByRegionToMap(rows: PromInstantResult[] | undefined): RegionMap {
  const m: RegionMap = new Map();
  for (const r of rows ?? []) {
    const provider = r.metric.provider;
    const region = r.metric.source_region ?? 'unknown';
    const v = parseFloat(r.value[1]);
    if (!Number.isFinite(v)) continue;
    if (!m.has(provider)) m.set(provider, new Map());
    m.get(provider)!.set(region, v);
  }
  return m;
}

function avgOfMap(regionMap: Map<string, number> | undefined): number | null {
  if (!regionMap?.size) return null;
  let sum = 0;
  let n = 0;
  for (const v of regionMap.values()) {
    sum += v;
    n += 1;
  }
  return n ? sum / n : null;
}

function trendToMap(rows: PromRangeResult[] | undefined): Map<string, number[]> {
  const m = new Map<string, number[]>();
  for (const r of rows ?? []) {
    const provider = r.metric.provider;
    const values = (r.values ?? [])
      .map(([, v]) => parseFloat(v))
      .filter((v) => Number.isFinite(v));
    m.set(provider, values);
  }
  return m;
}

export const fetchChainData = cache(async (chain: Chain, timeRange: TimeRange = '24h'): Promise<ChainData> => {
  const { windowSeconds, stepSeconds } = TREND_RANGE[timeRange];
  const end = minuteAlignedEnd();
  const start = end - windowSeconds;

  const [p50, p95, p99, success, trend] = await Promise.all([
    safe('p50', runPromQuery(providerByRegionQuery(chain.promName, 0.5, timeRange))),
    safe('p95', runPromQuery(providerByRegionQuery(chain.promName, 0.95, timeRange))),
    safe('p99', runPromQuery(providerByRegionQuery(chain.promName, 0.99, timeRange))),
    safe('success', runPromQuery(providerSuccessQuery(chain.promName, timeRange))),
    safe(
      'trend',
      runPromRangeQuery(providerTrendQuery(chain.promName), {
        start,
        end,
        step: stepSeconds,
      }),
    ),
  ]);

  const degradedMetrics = Object.entries({ p50, p95, p99, success, trend })
    .filter(([, r]) => !r.ok)
    .map(([name]) => name);
  const hadError = degradedMetrics.length > 0;

  const p50Map = p50.ok ? quantileByRegionToMap(p50.value) : new Map();
  const p95Map = p95.ok ? quantileByRegionToMap(p95.value) : new Map();
  const p99Map = p99.ok ? quantileByRegionToMap(p99.value) : new Map();
  const trendMap = trend.ok ? trendToMap(trend.value) : new Map<string, number[]>();
  const successMap: RegionMap = success.ok ? quantileByRegionToMap(success.value) : new Map();

  const providerNames = new Set<string>([
    ...p50Map.keys(),
    ...p95Map.keys(),
    ...p99Map.keys(),
  ]);

  const regions = new Set<string>();
  for (const m of [p50Map, p95Map, p99Map]) {
    for (const regionMap of m.values()) {
      for (const r of regionMap.keys()) regions.add(r);
    }
  }

  const providers: Provider[] = [...providerNames]
    .map((name) => ({
      name,
      p50: avgOfMap(p50Map.get(name)),
      p95: avgOfMap(p95Map.get(name)),
      p99: avgOfMap(p99Map.get(name)),
      regions: Object.fromEntries(p95Map.get(name) ?? []) as Record<string, number>,
      regionSuccess: Object.fromEntries(successMap.get(name) ?? []) as Record<string, number>,
      trend: trendMap.get(name) ?? [],
      success: avgOfMap(successMap.get(name)),
    }))
    .filter((p) => p.p95 !== null)
    .sort((a, b) => (a.p95 as number) - (b.p95 as number));

  return {
    chain,
    providers,
    regions: [...regions].sort(),
    leader: providers[0] ?? null,
    error: providers.length === 0 && hadError,
    // Some queries failed but we still have providers — data is incomplete and
    // the ranking may be affected. Surfaced in the UI rather than hidden.
    partial: providers.length > 0 && hadError,
    degradedMetrics,
  };
});
