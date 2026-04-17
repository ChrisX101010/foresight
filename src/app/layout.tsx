import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { CursorGlow } from '@/components/CursorGlow';

export const metadata: Metadata = {
  title: 'FORESIGHT — Earn while you wait for the future',
  description:
    'Prediction-market yield vaults on Solana. Bet on Kalshi via DFlow. Park idle USDC in Kamino. First composable layer on top of tokenized prediction markets.',
  openGraph: {
    title: 'FORESIGHT',
    description: 'Prediction markets + DeFi yield, combined.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Instrument Serif + Inter Tight + JetBrains Mono — the full
            "editorial trading terminal" combo */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise">
	<CursorGlow />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
