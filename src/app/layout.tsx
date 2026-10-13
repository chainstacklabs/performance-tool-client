import { Space_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_CLIENT_DOMAIN || 'https://compare.chainstack.com';
const title = 'RPC provider performance comparison | Chainstack';
const description =
  'Live RPC provider benchmarks across Ethereum, Solana, BNB Chain, Base and more: availability and P50/P95/P99 latency, updated every 3 minutes.';

export const metadata = {
  // Resolves relative URLs below (OG image, og:url, canonical).
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title,
    description,
    images: [{
      url: '/og-image.png',
      width: 1200, height: 630,
      alt: title,
    }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`antialiased ${spaceMono.variable}`}
      style={{ background: '#03070d' }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            !function(){var i="analytics",analytics=window[i]=window[i]||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){if(window[i].initialized)return window[i][e].apply(window[i],arguments);var n=Array.prototype.slice.call(arguments);if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){var c=document.querySelector("link[rel='canonical']");n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})}n.unshift(e);analytics.push(n);return analytics}};for(var n=0;n<analytics.methods.length;n++){var key=analytics.methods[n];analytics[key]=analytics.factory(key)}analytics.load=function(key,n){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute("data-global-segment-analytics-key",i);t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);analytics._loadOptions=n};analytics._writeKey="xw9NjQHIjjsQqraOBvmLWolYBjUojTJk";;analytics.SNIPPET_VERSION="5.2.0";
            analytics.load("xw9NjQHIjjsQqraOBvmLWolYBjUojTJk");
            analytics.page();
            }}();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
