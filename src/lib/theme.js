// Shared UI color tokens — single source of truth for the hex literals
// that were previously scattered across components. Pure, no imports.

// Text / foreground
export const TEXT = {
  primary: '#F6F9FD', // headings, provider names
  muted:   '#8D95A5', // secondary copy
  dim:     '#656E80', // tertiary copy
  faint:   '#606772', // table headers, axis labels
  ghost:   '#4A5260', // disabled / em-dash placeholders
};

// Status by availability tier (see metrics.js availTier())
export const TIER_COLOR = {
  healthy:    '#25B15F',
  acceptable: '#6FC784',
  degraded:   '#FFDD33',
  unhealthy:  '#FF294C',
  unknown:    '#4A5260',
};

// Generic severity / signal colors
export const SIGNAL = {
  ok:   '#25B15F',
  warn: '#FFDD33',
  bad:  '#FF294C',
};

export const ACCENT = '#4DAFFF';
