interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface ChainBrand {
  rgb: Rgb;
  /** logo asset slug — resolves to /logos/{logo}.svg */
  logo: string;
}

// Single source of per-chain display metadata, keyed by promName. Adding a
// chain means one entry here (plus the data entry in lib/queries.ts).
const CHAIN_BRAND: Record<string, ChainBrand> = {
  Ethereum:    { rgb: { r: 98,  g: 126, b: 234 }, logo: 'ethereum'    },
  Arbitrum:    { rgb: { r: 40,  g: 160, b: 240 }, logo: 'arbitrum'    },
  // Arc publishes four primaries. This is validator-blue; arc.svg's tile uses
  // protocol-navy (#1B3158), which is too dark to double as the accent — at 23%
  // lightness the active chip is hard to tell from the inactive ones. Same
  // split as Arbitrum, whose tile is dark navy and whose accent is not.
  Arc:         { rgb: { r: 47,  g: 87,  b: 140 }, logo: 'arc'         },
  Base:        { rgb: { r: 0,   g: 82,  b: 255 }, logo: 'base'        },
  BNB:         { rgb: { r: 240, g: 185, b: 11  }, logo: 'bnb'         },
  Hyperliquid: { rgb: { r: 0,   g: 212, b: 170 }, logo: 'hyperliquid' },
  Robinhood:   { rgb: { r: 204, g: 255, b: 0   }, logo: 'robinhood'   },
  Solana:      { rgb: { r: 153, g: 69,  b: 255 }, logo: 'solana'      },
};

export function chainLogo(chain: string): string | null {
  return CHAIN_BRAND[chain]?.logo ?? null;
}

export function brandRgba(chain: string, alpha: number): string | null {
  const c = CHAIN_BRAND[chain]?.rgb;
  if (!c) return null;
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

/** CSS color for a chain's accent — `rgb()` when known, the accent hex otherwise. */
export function brandColor(chain: string): string {
  const c = CHAIN_BRAND[chain]?.rgb;
  if (!c) return '#4DAFFF';
  return `rgb(${c.r},${c.g},${c.b})`;
}
