import { Inter } from 'next/font/google';
import './globals.css';

import Provider from './context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Wedges - Next.js Template',
  description:
    'Beautiful UI components for React, crafted with the Wedges design system, Radix UI, and Tailwind CSS.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="dark-blue wg-antialiased"
      style={{ background: '#000417' }}
    >
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
