# performance-tool-client

RPC provider performance comparison, as a single-page Next.js app. Chainstack Compare frontend.

Shows P50/P95/P99 latency, availability, and per-region breakdowns for RPC providers across Ethereum, Solana, BNB Chain, Arbitrum, Base, Hyperliquid, and Robinhood, measured from four regions.

This app only renders. The probes and dashboards that produce the data live in [compare-dashboard-functions](https://github.com/chainstacklabs/compare-dashboard-functions); this app queries their Grafana at request time.

## Setup

Needs Node.js 20.9 or later.

```bash
npm install
cp .env.sample .env.local
```

Set `GRAFANA_API_TOKEN` in `.env.local` — a Grafana service account token with the Viewer role. Without it the page renders but every metric shows as unavailable.

To run against your own Grafana, change `GRAFANA_URL` and `PROM_DS_UID` in `src/lib/grafana.ts` and the `CHAINS` list in `src/lib/queries.ts`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | dev server on localhost:3000 |
| `npm run build` | production build, includes type checking |
| `npm start` | serve the production build |
| `npm run lint` | ESLint |

No test suite — lint and build are the checks.

## URL parameters

- `protocol` — `ethereum`, `solana`, `bnb`, `arbitrum`, `base`, `hyperliquid`, `robinhood`. Defaults to `ethereum`.
- `range` — `24h` or `7d`. Defaults to `24h`.

Unrecognized values fall back to the default, so links are safe to share.

## Layout

```
src/app/          # single route, layout, loading fallback
src/components/   # RpcPerformance/ holds the table, chips, range switcher
src/lib/          # PromQL, Grafana client, scoring
```

## Contributing

Fork or branch from `main`, run `npm run lint` and `npm run build`, then open a pull request. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

See `CLAUDE.md` before touching the data layer.

## License

[Apache 2.0](LICENSE).
