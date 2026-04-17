'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, TrendingUp, Zap } from 'lucide-react';
import { Nav } from '@/components/Nav';
import { useVault } from '@/hooks/useVault';
import { formatPct, formatUsd, shortAddr } from '@/lib/utils';

export default function PortfolioPage() {
  const { publicKey, connected } = useWallet();
  const { state } = useVault();

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="mono text-xs text-fog uppercase tracking-wider mb-3">Portfolio</p>
        <h1 className="display text-5xl md:text-6xl text-chalk mb-10">
          Your <span className="italic text-plasma">open positions.</span>
        </h1>

        {!connected ? (
          <div className="bg-ink-800 border border-dashed border-ink-500 rounded-2xl p-12 text-center">
            <Wallet className="w-10 h-10 text-fog mx-auto mb-4" />
            <p className="display text-2xl italic text-fog">Connect a wallet</p>
            <p className="text-sm text-fog mt-2">to view your Foresight positions</p>
          </div>
        ) : (
          <>
            {/* Wallet summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <Stat label="Connected" value={publicKey ? shortAddr(publicKey.toBase58(), 6) : '—'} mono />
              <Stat label="Live Kamino APY" value={formatPct(state.yieldInfo.totalApy)} accent />
              <Stat label="Reserve utilization" value={formatPct(state.yieldInfo.utilization)} />
            </div>

            {/* Empty positions state — a real app reads positions from
                chain by scanning SPL balances of known outcome mints. This
                stub encourages first deposit. */}
            <div className="bg-ink-800 border border-ink-600 rounded-2xl p-12 text-center">
              <p className="mono text-xs text-fog uppercase tracking-wider mb-2">No positions yet</p>
              <p className="display text-3xl italic text-chalk mb-6">
                Go pick a future worth <span className="text-plasma not-italic">+yield</span>.
              </p>
              <Link
                href="/markets"
                className="inline-flex items-center gap-2 bg-plasma hover:bg-plasma-dim text-ink-900 font-semibold px-6 py-3 rounded-full"
              >
                Browse markets
              </Link>
            </div>

            {/* Explanatory footer */}
            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <InfoCard
                icon={TrendingUp}
                title="Prediction leg"
                body="Positions are held as real SPL tokens (Yes / No) tokenized by DFlow. They can be transferred, sold, or redeemed at resolution for $1 per winning token."
              />
              <InfoCard
                icon={Zap}
                title="Yield leg"
                body={`Idle USDC is deposited into Kamino Main Market. Currently earning ${formatPct(state.yieldInfo.totalApy)} supply APY plus active reward emissions.`}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
      <div className="mono text-[10px] uppercase tracking-wider text-fog mb-1">{label}</div>
      <div
        className={`${mono ? 'mono' : 'display'} text-2xl ${
          accent ? 'text-plasma' : 'text-chalk'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Wallet;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
      <Icon className="w-5 h-5 text-plasma mb-3" strokeWidth={1.5} />
      <h3 className="display text-xl text-chalk mb-2">{title}</h3>
      <p className="text-sm text-fog leading-relaxed">{body}</p>
    </div>
  );
}
