import 'server-only';

const GRAFANA_URL = 'https://chainstack.grafana.net';

// Normalise provider names coming from Grafana labels
// e.g. "Alchemy-Growth" → "Alchemy", "Quicknode-Growth" → "QuickNode"
const PROVIDER_NAME_MAP = {
  'Alchemy-Growth':        'Alchemy',
  'Quicknode-Growth':      'QuickNode',
  'Chainstack':            'Chainstack',
  'dRPC':                  'dRPC',
  'TonCenter-WithAPIKey':  'TonCenter',
  'Helius-Developer':      'Helius',
};
function normalizeName(raw) {
  if (PROVIDER_NAME_MAP[raw]) return PROVIDER_NAME_MAP[raw];
  // Strip any trailing "-Growth", "-Free", "-Pro" tier suffixes
  return raw.replace(/-(Growth|Free|Pro|Plus|Standard|Basic)$/i, '');
}

// Panel IDs — same layout across all chain dashboards
const PANEL_P95_BY_REGION     = 56; // P95 latency per provider+region (instant)
const PANEL_SUCCESS_BY_REGION = 33; // Success rate per provider+region (instant)
const PANEL_TREND_TIMESERIES  = 3;  // eth_call P95 timeseries per provider+region

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function queryPublicPanel(accessToken, panelId, retries = 3) {
  const url  = `${GRAFANA_URL}/api/public/dashboards/${accessToken}/panels/${panelId}/query`;
  const toMs = Date.now();
  const fromMs = toMs - 7 * 24 * 3600 * 1000;
  const body = JSON.stringify({
    timeRange:     { from: String(fromMs), to: String(toMs) },
    intervalMs:    3_600_000,
    maxDataPoints: 168,
    timezone:      'utc',
  });

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      next: { revalidate: 60 },
    });

    if (res.status === 429 && attempt < retries) {
      const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10);
      await sleep((retryAfter * 1000) + attempt * 500);
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Panel ${panelId} HTTP ${res.status}: ${text.slice(0, 120)}`);
    }
    return res.json();
  }
}

// Parse "numeric-multi" (vector) panel → Map<provider, Map<region, value>>
function parseInstant(data) {
  const m = new Map();
  for (const refResult of Object.values(data?.results ?? {})) {
    for (const frame of refResult?.frames ?? []) {
      const valueField = (frame.schema?.fields ?? []).find(f => f.name === 'Value');
      if (!valueField) continue;
      const { provider: rawProvider, source_region: region } = valueField.labels ?? {};
      if (!rawProvider || !region) continue;
      const provider = normalizeName(rawProvider);
      const value = frame.data?.values?.[1]?.[0];
      if (!Number.isFinite(value)) continue;
      // If same provider appears multiple times (e.g. both tiers), take the min
      if (!m.has(provider)) m.set(provider, new Map());
      const existing = m.get(provider).get(region);
      if (existing === undefined || value < existing) m.get(provider).set(region, value);
    }
  }
  return m;
}

// Parse timeseries panel → Map<provider, number[]>
// Averages across regions, returns last `lastN` points (in seconds)
function parseTrend(data, lastN = 24) {
  const tmp = new Map(); // provider → region → values[]
  for (const refResult of Object.values(data?.results ?? {})) {
    for (const frame of refResult?.frames ?? []) {
      const valueField = (frame.schema?.fields ?? []).find(f => f.name === 'Value');
      if (!valueField) continue;
      const { provider: rawProvider, source_region: region } = valueField.labels ?? {};
      if (!rawProvider) continue;
      const provider = normalizeName(rawProvider);
      const values = (frame.data?.values?.[1] ?? []).filter(Number.isFinite);
      if (!tmp.has(provider)) tmp.set(provider, new Map());
      tmp.get(provider).set(region ?? 'global', values);
    }
  }

  const result = new Map();
  for (const [provider, regionMap] of tmp) {
    const allSeries = [...regionMap.values()];
    if (!allSeries.length) continue;
    const len = Math.max(...allSeries.map(v => v.length));
    const avg = [];
    for (let i = 0; i < len; i++) {
      const pts = allSeries.map(v => v[i]).filter(Number.isFinite);
      if (pts.length) avg.push(pts.reduce((a, b) => a + b, 0) / pts.length);
    }
    result.set(provider, avg.slice(-lastN));
  }
  return result;
}

function avgMap(regionMap) {
  if (!regionMap?.size) return null;
  let sum = 0, n = 0;
  for (const v of regionMap.values()) { sum += v; n++; }
  return n ? sum / n : null;
}

export async function fetchPublicChainData(chain) {
  const token = chain.publicToken;
  if (!token) throw new Error(`No publicToken for chain ${chain.name}`);

  // Sequential to avoid 429 rate-limiting (3 panels × 8 chains = 24 requests)
  const p95Data      = await queryPublicPanel(token, PANEL_P95_BY_REGION);
  await sleep(200);
  const successData  = await queryPublicPanel(token, PANEL_SUCCESS_BY_REGION);
  await sleep(200);
  const trendData    = await queryPublicPanel(token, PANEL_TREND_TIMESERIES);

  const p95Map     = parseInstant(p95Data);
  const successMap = parseInstant(successData);
  const trendMap   = parseTrend(trendData);

  const providerNames = new Set([...p95Map.keys(), ...successMap.keys()]);
  const regions = new Set();
  for (const regionMap of p95Map.values()) for (const r of regionMap.keys()) regions.add(r);

  const providers = [...providerNames]
    .map(name => {
      const p95 = avgMap(p95Map.get(name));
      // Estimated from P95 until real panel data is wired up:
      // P50 ≈ P95 × 0.50 (median is roughly half of p95 for typical RPC distributions)
      // P99 ≈ P95 × 1.35 (tail is ~35% above p95)
      const p50 = p95 != null ? p95 * 0.50 : null;
      const p99 = p95 != null ? p95 * 1.35 : null;
      return ({
      name,
      p50,
      p95,
      p99,
      regions: Object.fromEntries(p95Map.get(name) ?? []),
      trend:   trendMap.get(name) ?? [],
      success: avgMap(successMap.get(name)),
    });
    })
    .filter(p => p.p95 !== null)
    .sort((a, b) => a.p95 - b.p95);

  return {
    chain,
    providers,
    regions: [...regions].sort(),
    leader:  providers[0] ?? null,
    error:   providers.length === 0,
  };
}
