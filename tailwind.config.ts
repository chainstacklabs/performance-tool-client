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
  theme: {},
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
