'use client';

import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowLeft, Zap, TrendingUp, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { useMarket } from '@/hooks/useMarkets';
import { useVault, stepLabel } from '@/hooks/useVault';
import {
  formatImpliedProb,
  formatPct,
  formatUsd,
  timeUntil,
  cn,
} from '@/lib/utils';
import type { PositionSide } from '@/types';

export default function MarketDetail({
  params,
}: {
  params: { ticker: string };
}) {
  const decodedTicker = decodeURIComponent(params.ticker);  
  const { data: market, isLoading } = useMarket(decodedTicker);
  const { connected } = useWallet();
  const { state, deposit } = useVault();

  const [side, setSide] = useState<PositionSide>('yes');
  const [totalBudget, setTotalBudget] = useState<number>(100);
  const [allocation, setAllocation] = useState<number>(0.5); // 0..1, share on prediction leg

  const predictionBudget = useMemo(() => totalBudget * allocation, [totalBudget, allocation]);
  const yieldBudget = useMemo(() => totalBudget * (1 - allocation), [totalBudget, allocation]);

  // Projected outcome-token count if market fills at shown price
  const projectedTokens = useMemo(() => {
    if (!market) return 0;
    const price = side === 'yes' ? market.yesPrice : market.noPrice;
    if (price <= 0) return 0;
    return predictionBudget / price;
  }, [market, side, predictionBudget]);

  // Rough projected yield at close — simple linear APY approximation
  const daysToClose = useMemo(() => {
    if (!market) return 0;
    return Math.max(0, (new Date(market.closeTime).getTime() - Date.now()) / 86_400_000);
  }, [market]);

  const projectedYield = useMemo(
    () => yieldBudget * state.yieldInfo.totalApy * (daysToClose / 365),
    [yieldBudget, state.yieldInfo.totalApy, daysToClose]
  );

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Nav />
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="h-10 bg-ink-700 rounded w-64 animate-pulse mb-4" />
          <div className="h-20 bg-ink-700 rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (!market) {
    return (
      <main className="min-h-screen">
        <Nav />
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="display text-3xl italic text-fog">Market not found.</p>
          <Link href="/markets" className="mono text-xs text-plasma mt-4 inline-block">
            ← browse markets
          </Link>
        </div>
      </main>
    );
  }

  const selectedPrice = side === 'yes' ? market.yesPrice : market.noPrice;

  const handleDeposit = async () => {
    await deposit({
      market,
      side,
      predictionBudgetUsd: predictionBudget,
      yieldBudgetUsd: yieldBudget,
    });
  };

  return (
    <main className="min-h-screen">
      <Nav />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/markets"
          className="inline-flex items-center gap-1 mono text-xs text-fog hover:text-plasma transition-colors mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          ALL MARKETS
        </Link>

        <div className="grid lg:grid-cols-[1fr,420px] gap-10">
          {/* ─── Left: Market content ─────────────────────────────── */}
          <div>
            <div className="mono text-xs text-fog uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-plasma">{market.category}</span>
              <span>·</span>
              <span>{market.ticker}</span>
              <span>·</span>
              <span>resolves in {timeUntil(market.closeTime)}</span>
            </div>

            <h1 className="display text-4xl md:text-5xl text-chalk leading-tight mb-3">
              {market.title}
            </h1>
            {market.subtitle ? (
              <p className="text-fog text-lg mb-6">{market.subtitle}</p>
            ) : null}

            {/* Probability split bar */}
            <div className="bg-ink-800 border border-ink-600 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between text-xs mono uppercase text-fog mb-3">
                <span>Implied probability</span>
                <span>market snapshot · refreshes 30s</span>
              </div>
              <div className="flex h-14 rounded-lg overflow-hidden">
                <div
                  className="bg-emerald-500/20 border-r border-emerald-500/40 flex items-center px-4 gap-2"
                  style={{ width: `${market.yesPrice * 100}%` }}
                >
                  <div className="display text-2xl text-emerald-400">
                    {formatImpliedProb(market.yesPrice)}
                  </div>
                  <span className="mono text-[10px] text-emerald-300 uppercase">Yes</span>
                </div>
                <div
                  className="bg-rose-500/20 flex items-center justify-end px-4 gap-2"
                  style={{ width: `${market.noPrice * 100}%` }}
                >
                  <span className="mono text-[10px] text-rose-300 uppercase">No</span>
                  <div className="display text-2xl text-rose-400">
                    {formatImpliedProb(market.noPrice)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-ink-600">
                <div>
                  <div className="mono text-[10px] uppercase text-fog mb-1">24h Volume</div>
                  <div className="display text-xl text-chalk">
                    {formatUsd(market.volume24h)}
                  </div>
                </div>
                <div>
                  <div className="mono text-[10px] uppercase text-fog mb-1">Open Interest</div>
                  <div className="display text-xl text-chalk">
                    {formatUsd(market.openInterest)}
                  </div>
                </div>
              </div>
            </div>

            {/* Mint addresses — for the curious + auditors */}
            <div className="bg-ink-800/50 border border-ink-600 rounded-xl p-4 mono text-xs text-fog">
              <div className="mb-2 flex items-center gap-2 text-chalk">
                <Sparkles className="w-3 h-3 text-plasma" />
                <span className="uppercase">On-chain components</span>
              </div>
              <div className="space-y-1">
                <div>YES mint · <span className="text-chalk break-all">{market.yesMint}</span></div>
                <div>NO mint &nbsp;· <span className="text-chalk break-all">{market.noMint}</span></div>
                <div>Settle &nbsp;&nbsp;· <span className="text-chalk break-all">{market.settlementMint}</span></div>
              </div>
            </div>
          </div>

          {/* ─── Right: Deposit panel ─────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-ink-800 border border-ink-600 rounded-2xl p-6 space-y-5">
              <div>
                <p className="mono text-xs text-fog uppercase tracking-wider mb-1">
                  Open a Foresight position
                </p>
                <h3 className="display text-2xl text-chalk">Two-leg deposit</h3>
              </div>

              {/* Side toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide('yes')}
                  className={cn(
                    'py-3 rounded-lg border transition-colors display text-xl',
                    side === 'yes'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-ink-500 text-fog hover:text-chalk'
                  )}
                >
                  Yes · {formatImpliedProb(market.yesPrice)}
                </button>
                <button
                  onClick={() => setSide('no')}
                  className={cn(
                    'py-3 rounded-lg border transition-colors display text-xl',
                    side === 'no'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                      : 'border-ink-500 text-fog hover:text-chalk'
                  )}
                >
                  No · {formatImpliedProb(market.noPrice)}
                </button>
              </div>

              {/* Total budget */}
              <div>
                <label className="mono text-[10px] uppercase tracking-wider text-fog block mb-1">
                  Total deposit (USDC)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-ink-700 border border-ink-500 rounded-lg px-3 py-2 text-chalk display text-2xl focus:outline-none focus:border-plasma/40"
                />
              </div>

              {/* Allocation slider */}
              <div>
                <div className="flex justify-between text-xs mono uppercase text-fog mb-2">
                  <span>Prediction leg</span>
                  <span>Yield leg · Kamino</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(allocation * 100)}
                  onChange={(e) => setAllocation(Number(e.target.value) / 100)}
                  className="w-full accent-plasma"
                />
                <div className="flex justify-between mt-1 mono text-sm">
                  <span className="text-chalk">{formatUsd(predictionBudget)}</span>
                  <span className="text-plasma">{formatUsd(yieldBudget)}</span>
                </div>
              </div>

              {/* Projections */}
              <div className="border-t border-ink-600 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-fog flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Outcome tokens
                  </span>
                  <span className="mono text-chalk">
                    ~{projectedTokens.toFixed(2)} {side.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fog flex items-center gap-1">
                    <Zap className="w-3 h-3 text-plasma" />
                    Projected yield at resolution
                  </span>
                  <span className="mono text-plasma">+{formatUsd(projectedYield)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fog">If YES wins, you get</span>
                  <span className="mono text-chalk">
                    {formatUsd(projectedTokens * 1)} {/* outcome tokens redeem at $1 each */}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fog">Kamino APY right now</span>
                  <span className="mono text-plasma">{formatPct(state.yieldInfo.totalApy)}</span>
                </div>
              </div>

              {/* Action button */}
              {!connected ? (
                <div className="text-center py-4 border border-dashed border-ink-500 rounded-lg">
                  <p className="text-sm text-fog flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Connect a wallet to open a position
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleDeposit}
                  disabled={state.isDepositing || totalBudget <= 0}
                  className="w-full bg-plasma hover:bg-plasma-dim disabled:bg-ink-600 disabled:text-fog text-ink-900 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  {state.isDepositing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {stepLabel(state.currentStep)}
                    </>
                  ) : (
                    <>Open position · {formatUsd(totalBudget)}</>
                  )}
                </button>
              )}

              {state.error ? (
                <p className="text-xs text-rose-400 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {state.error}
                </p>
              ) : null}

              <p className="mono text-[10px] text-fog leading-relaxed">
                Two transactions are required: one DFlow mint + one Kamino
                deposit. A v2 with Jito bundles will collapse these into a single
                bundle. Slippage set to 0.5% · priority fee 50k μLamports.
              </p>

              {/* Proof KYC notice — DFlow requires this per Kalshi regulation */}
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-3 mt-3">
                <p className="mono text-[10px] text-amber-400 uppercase tracking-wider mb-1">
                  Kalshi KYC required
                </p>
                <p className="text-xs text-fog leading-relaxed">
                  DFlow uses CFTC-regulated Kalshi liquidity. First-time traders
                  must verify their wallet with{' '}
                  <a
                    href="https://dflow.net/proof"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    DFlow Proof
                  </a>{' '}
                  before buying outcome tokens. One-time step.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
