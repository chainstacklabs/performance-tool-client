import type { NextConfig } from 'next';
import { CHAINS } from './src/lib/queries';

// /dashboard lands on Ethereum's public compare dashboard. The token comes from
// CHAINS so it stays in step with the app's own "open in Grafana" links rather
// than being a second copy that can drift. Fail the build if it is missing — a
// broken redirect target is worse than a loud error.
const ethereumToken = CHAINS.find((c) => c.promName === 'Ethereum')?.publicToken;
if (!ethereumToken) throw new Error('No Ethereum entry in CHAINS to build the /dashboard redirect from');

const GRAFANA_DASHBOARD_URL =
  `https://chainstack.grafana.net/public-dashboards/${ethereumToken}?orgId=1`;

// Allow the Vercel toolbar (comments/live feedback) on preview deployments only,
// so production stays locked down. The toolbar loads from vercel.live and uses
// Pusher websockets for live feedback.
const isPreview = process.env.VERCEL_ENV === 'preview';

const cspDirectives = [
  "default-src 'self'",
  // cdn.segment.com serves the analytics.js bundle loaded in layout.tsx. Adding a
  // browser-side (device-mode) Segment destination means adding its origin here.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.segment.com${isPreview ? ' https://vercel.live' : ''}`,
  // next/font self-hosts Space Mono, so no Google Fonts origins are needed.
  `style-src 'self' 'unsafe-inline'${isPreview ? ' https://vercel.live' : ''}`,
  `font-src 'self' data:${isPreview ? ' https://vercel.live/fonts' : ''}`,
  "img-src 'self' data: https:",
  // Nothing is iframed in production; Grafana opens via target="_blank" links.
  `frame-src ${isPreview ? 'https://vercel.live' : "'none'"}`,
  `connect-src 'self' https://api.segment.io https://*.segment.io${isPreview ? ' https://vercel.live wss://ws-us3.pusher.com https://*.pusher.com' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/compare-single', destination: '/', permanent: true },
      { source: '/compare-double', destination: '/', permanent: true },
      { source: '/dashboard', destination: GRAFANA_DASHBOARD_URL, permanent: true },
    ];
  },
  reactStrictMode: true,
};

export default nextConfig;
