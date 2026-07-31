// Flat config: Next.js 16 removed `next lint`, and ESLint 9+ reads flat config by default.
// `eslint-config-next/core-web-vitals` already exports a flat config array.
import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  {
    rules: {
      // eslint-plugin-react-hooks 6 (new in eslint-config-next 16) added this rule.
      // Two pre-existing prop->state sync effects trip it; downgraded to a warning so
      // the dependency upgrade stays separate from refactoring those effects.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default config;
