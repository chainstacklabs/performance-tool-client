// Probe-region identity for the regional P95 columns. Display only — ranking is
// Grafana's score, which does its own region aggregation.
//
// Two probe fleets name the same four regions differently (DigitalOcean-style
// `fra1`, AWS-style `eu-west-1`), so raw codes are collapsed to one entry per
// real region. Live data currently only ever uses one fleet's codes, making the
// aliasing a guard rather than an active correction.
import { isNum } from '@/lib/num';

const REGION_LABEL: Record<string, string> = {
  fra1: 'DE', sfo1: 'US', sin1: 'SG', hnd1: 'JP',
  'eu-west-1': 'DE', 'us-east-1': 'US', 'ap-southeast-1': 'SG', 'ap-northeast-1': 'JP',
};

export const REGION_ORDER: string[] = ['DE', 'US', 'SG', 'JP'];
export const REGION_EMOJI: Record<string, string> = { DE: '🇩🇪', US: '🇺🇸', SG: '🇸🇬', JP: '🇯🇵' };

/**
 * Collapse `region code → value` into `region → value`, taking the MEAN of
 * codes that resolve to the same region. Mean, not min — picking the better of
 * two probe locations would flatter whichever providers happen to be probed
 * twice from one region.
 *
 * Unmapped codes pass through under their raw code rather than being dropped, so
 * a new probe location shows up as missing-from-REGION_ORDER rather than
 * vanishing into an existing region's average. Callers filter to REGION_ORDER.
 */
export function groupByRegion(raw: Record<string, number> | undefined): Record<string, number> {
  const acc = new Map<string, { sum: number; n: number }>();
  for (const [code, val] of Object.entries(raw ?? {})) {
    if (!isNum(val)) continue;
    const region = REGION_LABEL[code] ?? code;
    const cur = acc.get(region) ?? { sum: 0, n: 0 };
    acc.set(region, { sum: cur.sum + val, n: cur.n + 1 });
  }
  return Object.fromEntries([...acc].map(([region, { sum, n }]) => [region, sum / n]));
}
