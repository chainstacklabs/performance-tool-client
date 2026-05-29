/** @type {import('next').NextConfig} */
const GRAFANA_DASHBOARD_URL =
  'https://chainstack.grafana.net/public-dashboards/65c0fcb02f994faf845d4ec095771bd0?orgId=1';

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.segment.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "frame-src https://chainstack.grafana.net",
  "connect-src 'self' https://api.segment.io https://*.segment.io https://www.google-analytics.com",
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
  reactStrictMode: false,
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
  },
});

module.exports = withMDX(nextConfig);
