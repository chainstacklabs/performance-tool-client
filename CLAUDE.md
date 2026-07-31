# Repository guide for AI agents

`AGENTS.md` symlinks here. Edit this file.

Single-page Next.js app showing RPC provider performance. One route `/`, rendered `force-dynamic`, with `?protocol=` and `?range=` (`24h` or `7d`). Data comes from the Grafana that [compare-dashboard-functions](https://github.com/chainstacklabs/compare-dashboard-functions) feeds; this app only reads.

## Checks

`npm run lint` and `npm run build`. There is no test suite, so these are the only automated checks — run both before calling work done. For interactive changes, also load the page and click through it; the build passes on plenty that is broken at runtime.

Needs `GRAFANA_API_TOKEN` in `.env.local` or every metric reads as unavailable.

## Constraints

Each one is deliberate, looks like something to tidy up, and breaks if you do.

**Never compute or display the ranking score.** `src/lib/score.ts` reads it from a Grafana stat panel. An earlier JavaScript reimplementation drifted and disagreed on the Hyperliquid winner. The score orders rows only — it has known flaws, so showing the number invites questions the UI cannot answer. If the formula is wrong, fix the Grafana panel.

**`activeProtocol` in `RpcPerformancePage.tsx` must stay React state**, not derived from `useSearchParams`. Chip clicks use `history.replaceState` to bypass the router on purpose; the page is `force-dynamic`, so routing each click would cost a server round trip.

**`loading.tsx` gets no `searchParams`** — Next passes none to a Suspense fallback. It must not guess the active protocol; guessing paints the wrong chip on every deep link.

**Keep `server-only` on anything reading `GRAFANA_API_TOKEN`.** It marks `grafana.ts`, `chain-data.ts`, and `score.ts`. The rest of `src/lib/` is shared with client components by design.

**The three `package.json` overrides are load-bearing.** `postcss` because Next pins `8.4.31` internally, `minimatch` as the only route to a patched `brace-expansion`, `sharp` because Next's optional range has an open advisory. Removing any reintroduces a Dependabot alert.

**ESLint stays on 9.x.** ESLint 10 breaks two ways — `eslint-plugin-react` supports nothing above 9.7, and `eslint-config-next`'s parser is vendored inside `next`. Neither is fixable with an override.

**`@lemonsqueezy/wedges` is a devDependency on purpose** — only used by the Tailwind plugin in `tailwind.config.ts`. Its `react@^18` peer pins React 18; moving it back to `dependencies` does not change that.

## Conventions

Latencies are seconds in `src/lib/`, milliseconds after `metrics.ts`. `next.config.js` owns the CSP, so new third-party scripts need their origin added there. Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Vercel deploys `main`.
