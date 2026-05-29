import 'server-only';

const GRAFANA_URL = 'https://chainstack.grafana.net';
const PROM_DS_UID = 'grafanacloud-prom';

function authHeaders() {
  const token = process.env.GRAFANA_API_TOKEN;
  if (!token) {
    throw new Error('GRAFANA_API_TOKEN env var is not set');
  }
  return { Authorization: `Bearer ${token}` };
}

async function fetchProm(path, params, { revalidate = 60 } = {}) {
  const url = new URL(`${GRAFANA_URL}/api/datasources/proxy/uid/${PROM_DS_UID}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res;
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
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(`Grafana ${path} error: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json.data.result;
}

export function runPromQuery(promql, opts = {}) {
  return fetchProm('/api/v1/query', { query: promql }, opts);
}

export function runPromRangeQuery(promql, { start, end, step, ...opts } = {}) {
  if (![start, end, step].every(Number.isFinite)) {
    throw new Error('runPromRangeQuery requires numeric start, end, and step');
  }
  return fetchProm(
    '/api/v1/query_range',
    { query: promql, start, end, step },
    opts
  );
}
