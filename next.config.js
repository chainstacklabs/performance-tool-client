/** @type {import('next').NextConfig} */
const GRAFANA_DASHBOARD_URL =
  'https://chainstack.grafana.net/public-dashboards/65c0fcb02f994faf845d4ec095771bd0?orgId=1';

// Allow the Vercel toolbar (comments/live feedback) on preview deployments only,
// so production stays locked down. The toolbar loads from vercel.live and uses
// Pusher websockets for live feedback.
const isPreview = process.env.VERCEL_ENV === 'preview';

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.segment.com https://www.googletagmanager.com https://www.google-analytics.com${isPreview ? ' https://vercel.live' : ''}`,
  // next/font self-hosts Space Mono, so no Google Fonts origins are needed.
  `style-src 'self' 'unsafe-inline'${isPreview ? ' https://vercel.live' : ''}`,
  `font-src 'self' data:${isPreview ? ' https://vercel.live/fonts' : ''}`,
  "img-src 'self' data: https:",
  // Nothing is iframed in production; Grafana opens via target="_blank" links.
  `frame-src ${isPreview ? 'https://vercel.live' : "'none'"}`,
  `connect-src 'self' https://api.segment.io https://*.segment.io https://www.google-analytics.com${isPreview ? ' https://vercel.live wss://ws-us3.pusher.com https://*.pusher.com' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
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

module.exports = nextConfig;
