/**
 * Type guard for real, finite numbers — narrows `number | null` (and `unknown`)
 * down to `number`, excluding null and NaN. Lets call sites drop the
 * `Number.isFinite(x) ? (x as number) : …` cast dance.
 */
export const isNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
