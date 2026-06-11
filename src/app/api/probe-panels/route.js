// Temporary probe route — tests public Grafana dashboard query API
// DELETE after investigation

const GRAFANA_URL = 'https://chainstack.grafana.net';
const ETH_TOKEN   = '65c0fcb02f994faf845d4ec095771bd0';

// Panels we care about:
// 56  — P95 response time by provider+region (bar chart)
// 33  — Success rate by provider+region (table)
// 95  — Provider score (stat)
const PROBE_PANELS = [84, 85, 67, 3];

const now   = () => Math.floor(Date.now() / 1000);
const from  = () => now() - 24 * 3600;

async function getDashboardMeta(accessToken) {
  const url = `${GRAFANA_URL}/api/public/dashboards/${accessToken}`;
  const res = await fetch(url, { cache: 'no-store' });
  return { status: res.status, body: tryJson(await res.text()) };
}

async function queryPanel(accessToken, panelId) {
  const url = `${GRAFANA_URL}/api/public/dashboards/${accessToken}/panels/${panelId}/query`;
  const toMs   = Date.now();
  const fromMs = toMs - 7 * 24 * 3600 * 1000;
  const body = JSON.stringify({
    timeRange: {
      from: String(fromMs),
      to:   String(toMs),
    },
    intervalMs:    3_600_000,
    maxDataPoints: 168,
    timezone:      'browser',
  });
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  return { panelId, status: res.status, body: tryJson(text) };
}

function tryJson(s) {
  try { return JSON.parse(s); } catch { return s; }
}

export async function GET() {
  const meta = await getDashboardMeta(ETH_TOKEN);
  const results = await Promise.all(PROBE_PANELS.map(id => queryPanel(ETH_TOKEN, id)));
  return Response.json({ meta, panels: results }, { status: 200 });
}
