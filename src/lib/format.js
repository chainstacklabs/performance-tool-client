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

// source_region codes are DigitalOcean slugs. `short` is the column header,
// `country`/`city` feed the header tooltip.
const REGIONS = {
  fra1: { short: 'DE', country: 'Germany', city: 'Frankfurt' },
  sfo1: { short: 'US', country: 'United States', city: 'San Francisco' },
  sfo2: { short: 'US', country: 'United States', city: 'San Francisco' },
  sfo3: { short: 'US', country: 'United States', city: 'San Francisco' },
  nyc1: { short: 'US', country: 'United States', city: 'New York' },
  nyc2: { short: 'US', country: 'United States', city: 'New York' },
  nyc3: { short: 'US', country: 'United States', city: 'New York' },
  ams2: { short: 'NL', country: 'Netherlands', city: 'Amsterdam' },
  ams3: { short: 'NL', country: 'Netherlands', city: 'Amsterdam' },
  sgp1: { short: 'SG', country: 'Singapore', city: 'Singapore' },
  lon1: { short: 'UK', country: 'United Kingdom', city: 'London' },
  tor1: { short: 'CA', country: 'Canada', city: 'Toronto' },
  blr1: { short: 'IN', country: 'India', city: 'Bangalore' },
  syd1: { short: 'AU', country: 'Australia', city: 'Sydney' },
};

function regionInfo(code) {
  const up = code.toUpperCase();
  return REGIONS[code] ?? { short: up, country: up, city: up };
}

// Full name for the header tooltip, e.g. "United States, San Francisco".
export function regionTitle(code) {
  const { country, city } = regionInfo(code);
  return city && city !== country ? `${country}, ${city}` : country;
}

// Short column labels (DE, US, SG …), qualified with the city only when two
// codes in the set share a short code (e.g. US San Francisco vs US New York).
export function regionLabels(codes) {
  const seen = new Map();
  for (const c of codes) {
    const { short } = regionInfo(c);
    seen.set(short, (seen.get(short) ?? 0) + 1);
  }
  const out = {};
  for (const c of codes) {
    const { short, city } = regionInfo(c);
    out[c] = seen.get(short) > 1 ? `${short} ${city}` : short;
  }
  return out;
}
