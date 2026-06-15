import 'server-only';

const GRAFANA_URL = 'https://chainstack.grafana.net';
const PROM_DS_UID = 'grafanacloud-prom';

/** A single result row from a Prometheus instant query. */
export interface PromInstantResult {
  metric: Record<string, string>;
  value: [number, string];
}

/** A single result row from a Prometheus range query. */
export interface PromRangeResult {
  metric: Record<string, string>;
  values: [number, string][];
}

interface PromResponse<T> {
  status: string;
  data: { result: T };
}

interface FetchPromOpts {
  revalidate?: number;
}

function authHeaders(): Record<string, string> {
  const token = process.env.GRAFANA_API_TOKEN;
  if (!token) {
    throw new Error('GRAFANA_API_TOKEN env var is not set');
  }
  return { Authorization: `Bearer ${token}` };
}

async function fetchProm<T>(
  path: string,
  params: Record<string, string | number>,
  { revalidate = 60 }: FetchPromOpts = {},
): Promise<T> {
  const url = new URL(`${GRAFANA_URL}/api/datasources/proxy/uid/${PROM_DS_UID}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: authHeaders(),
      next: { revalidate },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Grafana ${path} HTTP ${res.status}: ${res.statusText}`);
  }
  const json = (await res.json()) as PromResponse<T>;
  if (json.status !== 'success') {
    throw new Error(`Grafana ${path} error: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json.data.result;
}

export function runPromQuery(promql: string, opts: FetchPromOpts = {}): Promise<PromInstantResult[]> {
  return fetchProm<PromInstantResult[]>('/api/v1/query', { query: promql }, opts);
}

interface RangeOpts extends FetchPromOpts {
  start: number;
  end: number;
  step: number;
}

export function runPromRangeQuery(
  promql: string,
  { start, end, step, ...opts }: RangeOpts,
): Promise<PromRangeResult[]> {
  if (![start, end, step].every(Number.isFinite)) {
    throw new Error('runPromRangeQuery requires numeric start, end, and step');
  }
  return fetchProm<PromRangeResult[]>('/api/v1/query_range', { query: promql, start, end, step }, opts);
}
