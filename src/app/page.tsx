'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Coins,
  GitBranch,
  Sparkles,
  Clock3,
} from 'lucide-react';
import { Nav } from '@/components/Nav';
import { MarketCard } from '@/components/MarketCard';
import { useTrendingMarkets } from '@/hooks/useMarkets';
import { useVault } from '@/hooks/useVault';
import { formatPct } from '@/lib/utils';

export default function Landing() {
  const { data: markets = [] } = useTrendingMarkets(6);
  const { state } = useVault();

  return (
    <main className="min-h-screen">
      <Nav />

      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden plasma-glow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-20 md:pt-32 md:pb-36 relative">
          {/* top marquee — feels like a bloomberg ticker */}
          <div className="absolute top-4 left-0 right-0 overflow-hidden border-y border-ink-600 bg-ink-900/50 py-2">
            {/*
              Seamless marquee: render the list TWICE as two separate flex
              groups. CSS animates the outer container by -50% (exact width
              of one group), so group-2 slides in pixel-perfect where
              group-1 started. pr-10 on each matches the internal gap-10,
              making the seam between copies identical to the spacing
              within a copy — no visible snap-back.
            */}
            <div className="flex animate-marquee whitespace-nowrap text-xs mono text-fog">
              {([0, 1] as const).map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0"
                >
                  {[
                    'LIVE ⚡ DFlow prediction markets',
                    'LIVE ⚡ Kamino USDC yield',
                    'LIVE ⚡ Solflare wallet',
                    'LIVE ⚡ QuickNode RPC',
                  ].map((t, i) => (
                    <span key={i} className="mr-10">{t}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl pt-12"
          >
            <div className="mono text-xs text-plasma uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Built with Eitherway · Solana Frontier Hackathon
            </div>
            <h1 className="display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-chalk mb-6">
              Earn yield
              <br />
              <span className="italic text-plasma">while you wait</span>
              <br />
              for the future.
            </h1>
            <p className="text-xl md:text-2xl text-fog max-w-2xl leading-relaxed mb-10">
              Foresight is a <span className="text-chalk">prediction-market yield vault</span>.
              Bet on Kalshi events via DFlow. Idle USDC auto-earns on Kamino
              until the market resolves. Two engines, one position.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/markets"
                className="inline-flex items-center gap-2 bg-plasma hover:bg-plasma-dim text-ink-900 font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Open the terminal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-chalk border border-ink-500 hover:border-chalk px-6 py-3 rounded-full transition-colors"
              >
                How it works
              </Link>
            </div>
          </motion.div>

          {/* Live APY stat card — floats bottom right of hero */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl"
          >
            {[
              {
                label: 'Live Kamino APY',
                value: formatPct(state.yieldInfo.totalApy),
                accent: true,
              },
              { label: 'Markets available', value: '4,200+' },
              { label: 'Settlement asset', value: 'USDC' },
              { label: 'Outcome tokens', value: 'Real SPL' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-ink-800/60 border border-ink-600 rounded-xl p-4"
              >
                <div className="mono text-[10px] uppercase tracking-wider text-fog mb-1">
                  {s.label}
                </div>
                <div
                  className={`display text-3xl ${
                    s.accent ? 'text-plasma' : 'text-chalk'
                  }`}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="border-t border-ink-600 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-baseline justify-between mb-12 flex-wrap gap-4">
            <h2 className="display text-4xl md:text-5xl text-chalk">
              Two legs. <span className="italic text-plasma">One position.</span>
            </h2>
            <p className="mono text-xs text-fog uppercase tracking-wider">
              /01 The mechanism
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GitBranch,
                num: '01',
                title: 'Pick a market',
                body: 'Browse thousands of Kalshi prediction markets — sports, politics, crypto, weather. Every Yes/No outcome is a real SPL token on Solana, tokenized by DFlow.',
                tag: 'DFlow',
              },
              {
                icon: Coins,
                num: '02',
                title: 'Split your deposit',
                body: 'Allocate part of your USDC to buy outcome tokens. The rest sweeps directly into Kamino Lending to earn supply APY — automatically, same transaction flow.',
                tag: 'Kamino',
              },
              {
                icon: Clock3,
                num: '03',
                title: 'Wait and win',
                body: 'While the event resolves, your idle capital compounds. When the market closes you redeem outcome tokens for USDC and withdraw your yielded balance.',
                tag: 'Composable',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="relative bg-ink-800 border border-ink-600 rounded-2xl p-6 hover:border-plasma/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-6">
                    <Icon className="w-7 h-7 text-plasma" strokeWidth={1.5} />
                    <span className="mono text-xs text-fog">{s.num}</span>
                  </div>
                  <h3 className="display text-2xl text-chalk mb-2">{s.title}</h3>
                  <p className="text-fog leading-relaxed mb-4">{s.body}</p>
                  <span className="mono text-[10px] uppercase tracking-wider bg-plasma/10 text-plasma rounded px-2 py-1">
                    {s.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TRENDING MARKETS ─────────────────────────────────────────── */}
      <section className="border-t border-ink-600 py-20 md:py-28 bg-ink-800/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-baseline justify-between mb-12 flex-wrap gap-4">
            <h2 className="display text-4xl md:text-5xl text-chalk">
              Trending <span className="italic text-plasma">now.</span>
            </h2>
            <Link
              href="/markets"
              className="mono text-xs text-fog uppercase tracking-wider hover:text-plasma transition-colors flex items-center gap-1"
            >
              View all markets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((m) => (
              <MarketCard key={m.ticker} market={m} yieldApy={state.yieldInfo.totalApy} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE THESIS ──────────────────────────────────────────────── */}
      <section className="border-t border-ink-600 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mono text-xs text-fog uppercase tracking-wider mb-6">
            /02 The thesis
          </p>
          <h2 className="display text-3xl md:text-5xl text-chalk leading-tight mb-8">
            DFlow tokenized Kalshi on Solana in December.{' '}
            <span className="italic text-plasma">
              Nobody has built composability on top of it yet.
            </span>{' '}
            Foresight is the first.
          </h2>
          <p className="text-lg text-fog leading-relaxed max-w-3xl">
            When a prediction becomes a real SPL token, it inherits every DeFi
            primitive on Solana. That means it can be lent, borrowed, used as
            collateral, LP'd. Foresight starts with the simplest version of that
            composability: put the <em>other half</em> of your capital to work.
            The same engine extends to borrowing against positions, basket
            vaults, and fully automated hedged strategies.
          </p>
        </div>
      </section>

      {/* ─── SPONSOR ATTRIBUTION ─────────────────────────────────────── */}
      <section className="border-t border-ink-600 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mono text-xs text-fog uppercase tracking-wider mb-6 text-center">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-chalk">
            {['DFlow', 'Kamino', 'Solflare', 'QuickNode', 'Eitherway'].map((s) => (
              <div key={s} className="display text-2xl italic opacity-80 hover:opacity-100 transition-opacity">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-ink-600 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4 mono text-xs text-fog">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-plasma" />
            Foresight · Solana Frontier Hackathon · 2026
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/ChrisX101010/foresight" target="_blank" rel="noopener noreferrer" className="hover:text-chalk transition-colors">GitHub</a>
            <a href="/docs" className="hover:text-chalk transition-colors">Docs</a>
            <a href="https://superteam.fun/earn/listing/build-a-live-dapp-with-solflare-kamino-dflow-or-quicknode-with-eitherway-app" target="_blank" rel="noopener noreferrer" className="hover:text-chalk transition-colors">Bounty</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
