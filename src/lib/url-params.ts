// URL state helpers shared by the page, the protocol chips, and the time-range
// switcher. The app keeps two query params — `protocol` and `range` — and
// always writes them in that order so the URL bar reads consistently.
import type { Chain } from './types';

/**
 * Resolve a raw `?protocol=` value (case-insensitive) to a canonical promName,
 * falling back to the first chain when it's missing or unrecognized.
 */
export function resolveProtocol(chains: Chain[], param: string | null): string {
  const fallback = chains[0]?.promName ?? '';
  return (
    chains.find((c) => c.promName.toLowerCase() === param?.toLowerCase())?.promName ?? fallback
  );
}

/**
 * Build a `protocol`/`range` query string in canonical order. `protocol` is
 * omitted when falsy, matching how each call site guards it today.
 */
export function rangeQuery(params: { protocol?: string | null; range: string }): string {
  const sp = new URLSearchParams();
  if (params.protocol) sp.set('protocol', params.protocol);
  sp.set('range', params.range);
  return sp.toString();
}
