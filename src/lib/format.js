export function formatLatency(seconds) {
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  return `${seconds.toFixed(2)} s`;
}

export function formatPercent(x, digits = 1) {
  if (!Number.isFinite(x)) return '—';
  return `${(x * 100).toFixed(digits)}%`;
}

// Anchor id for in-page jumps from the TOC.
export function chainAnchor(promName) {
  return `chain-${promName.toLowerCase()}`;
}
