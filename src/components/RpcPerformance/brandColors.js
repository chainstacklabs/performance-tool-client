export const BRAND = {
  Ethereum:    { r: 98,  g: 126, b: 234 },
  Arbitrum:    { r: 40,  g: 160, b: 240 },
  Base:        { r: 0,   g: 82,  b: 255 },
  BNB:         { r: 240, g: 185, b: 11  },
  Hyperliquid: { r: 0,   g: 212, b: 170 },
  Monad:       { r: 131, g: 110, b: 249 },
  Solana:      { r: 153, g: 69,  b: 255 },
  TON:         { r: 0,   g: 152, b: 234 },
};

export function brandRgba(chain, alpha) {
  const c = BRAND[chain];
  if (!c) return null;
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

export function brandHex(chain) {
  const c = BRAND[chain];
  if (!c) return '#4DAFFF';
  return `rgb(${c.r},${c.g},${c.b})`;
}
