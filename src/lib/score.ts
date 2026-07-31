import 'server-only';
import { unstable_cache } from 'next/cache';
import { GRAFANA_URL } from './grafana';
import { isNum } from './num';
import type { TimeRange } from './types';

/**
 * Provider score, read from the compare dashboard's "Provider score (lower is
 * better)" stat panel.
 *
 * The scoring formula lives in Grafana and only in Grafana. This app used to
 * re-implement it in JS, and the two drifted: on Hyperliquid the dashboard puts
 * Alchemy first while the JS re-implementation put dRPC first. Nothing in this
 * file computes a score — it fetches one and parses it. Keep it that way; if the
 * formula needs to change, change the panel.
 *
 * Reads the public-dashboard API using the same per-chain tokens as the
 * "open in Grafana" links, so this path needs no service-account token.
 */

const RANGE_FROM: Record<TimeRange, string> = { '24h': 'now-24h', '7d': 'now-7d' };

interface DashPanel {
  id: number;
  type?: string;
  panels?: DashPanel[];
}
interface PublicDashboard {
  dashboard?: { panels?: DashPanel[] };
  panels?: DashPanel[];
}
interface QueryFrame {
  schema: { fields: { name: string; labels?: Record<string, string> }[] };
  data: { values: (number | null)[][] };
}
interface QueryResponse {
  results?: Record<string, { frames?: QueryFrame[]; error?: string }>;
}

/**
 * No `next: { revalidate }` here on purpose: both calls run inside
 * unstable_cache, which pins nested fetches to `force-no-store` and zeroes any
 * explicit revalidate. The outer cache is the only caching in this path.
 */
async function publicDashFetch<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${GRAFANA_URL}/api/public/dashboards/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`public dashboard ${path} HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * The score panel carries no title of its own (the heading above it is a
 * separate text panel) and its id differs per dashboard — 95 on Ethereum, 98 on
 * Solana, 86 on Base. `stat` is the only stable handle, and every compare
 * dashboard has exactly one. If that stops holding we throw rather than rank on
 * a panel we guessed at; the caller degrades to no score.
 */
function findScorePanelId(dash: PublicDashboard): number {
  const flatten = (panels: DashPanel[] | undefined): DashPanel[] =>
    (panels ?? []).flatMap((p) => [p, ...flatten(p.panels)]);

  const stats = flatten(dash.dashboard?.panels ?? dash.panels).filter((p) => p.type === 'stat');
  if (stats.length !== 1) {
    throw new Error(`expected exactly 1 stat panel, found ${stats.length}`);
  }
  return stats[0].id;
}

/**
 * provider label → score. The panel is an instant query, so each series carries
 * a single point; `data.values` columns are positionally parallel to
 * `schema.fields`, so the index of the `Value` field indexes its own column.
 *
 * Throws on an empty result: HTTP 200 with no series means the panel answered but
 * told us nothing, and returning `{}` would rank every provider last in silence
 * instead of raising the partial-data banner.
 */
function parseScores(json: QueryResponse): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const result of Object.values(json.results ?? {})) {
    if (result.error) throw new Error(result.error.slice(0, 200));
    for (const frame of result.frames ?? []) {
      const i = frame.schema.fields.findIndex((f) => f.name === 'Value');
      if (i < 0) continue;
      const provider = frame.schema.fields[i]?.labels?.provider;
      if (!provider) continue;
      const series = frame.data.values[i] ?? [];
      const latest = series[series.length - 1];
      if (isNum(latest)) scores[provider] = latest;
    }
  }
  if (Object.keys(scores).length === 0) {
    throw new Error('score panel returned no provider series');
  }
  return scores;
}

/**
 * Keyed on (publicToken, range) by unstable_cache. The panel query is a POST, so
 * Next's fetch cache skips it — the wrapper is what keeps us to one Grafana hit
 * per chain per 180s (the probes' measurement interval).
 */
export const fetchProviderScores = unstable_cache(
  async (publicToken: string, range: TimeRange): Promise<Record<string, number>> => {
    const dash = await publicDashFetch<PublicDashboard>(publicToken);
    const panelId = findScorePanelId(dash);
    const json = await publicDashFetch<QueryResponse>(
      `${publicToken}/panels/${panelId}/query`,
      {
        intervalMs: 60_000,
        maxDataPoints: 200,
        timeRange: { from: RANGE_FROM[range], to: 'now', timezone: 'utc' },
      },
    );
    return parseScores(json);
  },
  ['grafana-provider-scores'],
  { revalidate: 180 },
);
