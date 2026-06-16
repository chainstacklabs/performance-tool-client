import { wedgesTW } from '@lemonsqueezy/wedges';

const primaryBlue = {
  100: '#CCEEFF',
  200: '#99D9FF',
  300: '#66BEFF',
  400: '#3FA5FF',
  500: '#007BFF',
  600: '#005FDB',
  700: '#0046B7',
  800: '#003193',
  900: '#00237A',
  DEFAULT: '#007BFF', // 500
};

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',

    // Include Wedges components
    'node_modules/@lemonsqueezy/wedges/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        // Foreground / text scale
        fg: {
          primary: '#F6F9FD',
          muted:   '#8D95A5',
          dim:     '#656E80',
          faint:   '#606772',
          ghost:   '#4A5260',
        },
        // Availability tier colors (see metrics.js availTier())
        tier: {
          healthy:    '#25B15F',
          acceptable: '#6FC784',
          degraded:   '#FFDD33',
          unhealthy:  '#FF294C',
          unknown:    '#4A5260',
        },
        // Generic signal colors
        signal: {
          ok:   '#25B15F',
          warn: '#FFDD33',
          bad:  '#FF294C',
        },
        accent: '#4DAFFF',
        // Surface / structural (named 'panel' to avoid colliding with Wedges' 'surface')
        panel: {
          DEFAULT: '#161A1E',
          head:    '#0E1115',
          border:  '#252A30',
          row:     '#1E2328',
        },
      },
      keyframes: {
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        tooltipIn: {
          from: { opacity: '0', transform: 'translateX(-50%) translateY(4px)' },
          to:   { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
      },
      animation: {
        skeletonPulse: 'skeletonPulse 1.6s ease-in-out infinite',
        tooltipIn:     'tooltipIn 0.15s ease',
      },
    },
  },
  plugins: [
    wedgesTW({
      themes: {
        'dark-blue': {
          extend: 'dark',
          colors: {
            primary: primaryBlue,
          },
        },
      },
    }),
  ],
};

export default config;
