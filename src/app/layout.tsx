// 'use client';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chainstack Node performance tool',
  description:
    'Test RPC node with various methods and get transparent preformance results.',
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_CLIENT_DOMAIN,
    title: 'Chainstack Node performance tool',
    description:
      'Test RPC node with various methods and get transparent preformance results.',
    images: [
      {
        url: process.env.NEXT_PUBLIC_CLIENT_DOMAIN + '/' + 'og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chainstack Node performance tool',
      },
    ],
  },
};

export default function RootLayout({ children }: any) {
  return (
    <html
      lang="en"
      className="dark-blue wg-antialiased"
      style={{ background: '#000417' }}
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}
