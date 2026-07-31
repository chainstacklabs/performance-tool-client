// Flat config: Next.js 16 removed `next lint`, and ESLint 9+ reads flat config by default.
// `eslint-config-next/core-web-vitals` already exports a flat config array.
import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...coreWebVitals,
];

export default config;
