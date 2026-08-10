# Repository guide for AI agents

`AGENTS.md` symlinks here. Edit this file.

Single-page Next.js app showing RPC provider performance. One route `/`, rendered `force-dynamic`, with `?protocol=` and `?range=` (`24h` or `7d`). Data comes from the Grafana that [compare-dashboard-functions](https://github.com/chainstacklabs/compare-dashboard-functions) feeds; this app only reads.

## Checks

`npm run lint` and `npm run build`. There is no test suite, so these are the only automated checks — run both before calling work done. For interactive changes, also load the page and click through it; the build passes on plenty that is broken at runtime.

Needs `GRAFANA_API_TOKEN` in `.env.local` or every metric reads as unavailable.

## Constraints

Each one is deliberate, looks like something to tidy up, and breaks if you do.

**Never compute or display the ranking score.** `src/lib/score.ts` reads it from a Grafana stat panel. An earlier JavaScript reimplementation drifted and disagreed on the Hyperliquid winner. The score orders rows only — showing the raw number invites questions the UI cannot answer. Any improvement to the formula belongs in the Grafana panel, not here.

**`activeProtocol` in `RpcPerformancePage.tsx` must stay React state**, not derived from `useSearchParams`. Chip clicks use `history.replaceState` to bypass the router on purpose; the page is `force-dynamic`, so routing each click would cost a server round trip.

**`loading.tsx` gets no `searchParams`** — Next passes none to a Suspense fallback. It must not guess the active protocol; guessing paints the wrong chip on every deep link.

**Keep `server-only` on anything reading `GRAFANA_API_TOKEN`.** It marks `grafana.ts`, `chain-data.ts`, and `score.ts`. The rest of `src/lib/` is shared with client components by design.

**The three `package.json` overrides are load-bearing.** `postcss` because Next pins `8.4.31` internally, `minimatch` as the only route to a patched `brace-expansion`, `sharp` because Next's optional range has an open advisory. Removing any reintroduces a Dependabot alert.

**ESLint stays on 9.x.** `eslint-plugin-react` peers at `^9.7` and nothing higher, and no override fixes a peer range.

## Conventions

Latencies are seconds in `src/lib/`, milliseconds after `metrics.ts`. `next.config.ts` owns the CSP, so new third-party scripts need their origin added there. Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Tailwind 4 is configured CSS-first: design tokens (colors, fonts, keyframes) live in the `@theme` block in `src/app/globals.css`. There is no `tailwind.config.ts`.

**Do not reintroduce `@lemonsqueezy/wedges`.** It was removed because it pinned React 18 (peer dependency) and Tailwind 3 (its `wedgesTW` plugin) while contributing nothing — no component was ever rendered, and no wedges utility class was used. The dark-page defaults its plugin injected on `<html>` (`color`, `color-scheme`) now live in `globals.css`.

**Do not add a `.vercelignore`.** Vercel deploys `main` through the Git integration, which clones the repository, so there is no upload step for `.vercelignore` to filter — it does nothing here, and one was removed after it appeared to work but did not. Vercel's docs describe the ignore list as "only relevant when using Vercel CLI". Docs and `LICENSE` therefore show up in the deployment source inspector; that is cosmetic, because only `public/` and the build output are served and `/README.md` returns 404. The sibling `compare-dashboard-functions` repo does deploy by CLI (`vercel --prod` per region), which is why its `.vercelignore` is meaningful and copying it here was not.
