// Prometheus `provider` labels carry a pricing tier, e.g. "Alchemy-Growth",
// "Helius-Developer", "TonCenter-WithAPIKey". We present the brand only.
//
// Tier-stripping is generic: the brand is everything before the first hyphen,
// so NEW tiers never require a code change. The map below only corrects brand
// CASING for labels whose casing differs from how we display them — it is not
// a tier list and does not rot.
const DISPLAY_CASING: Record<string, string> = {
  quicknode: 'QuickNode',
  drpc:      'dRPC',
};

export function providerDisplayName(rawLabel: string): string {
  if (!rawLabel) return rawLabel;
  const brand = rawLabel.split('-')[0].trim();
  return DISPLAY_CASING[brand.toLowerCase()] ?? brand;
}
