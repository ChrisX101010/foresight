'use client';

import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Coins,
  Zap,
  Vote,
  Trophy,
  CloudRain,
  Film,
  HelpCircle,
  LineChart,
} from 'lucide-react';
import type { PredictionMarket } from '@/types';
import { usePriceFlash } from '@/hooks/usePriceFlash';
import { formatCompactUsd, formatImpliedProb, timeUntil, cn } from '@/lib/utils';

const CATEGORY_ICON: Record<PredictionMarket['category'], typeof Coins> = {
  politics: Vote,
  sports: Trophy,
  economics: LineChart,
  crypto: Coins,
  weather: CloudRain,
  entertainment: Film,
  other: HelpCircle,
};

const CATEGORY_COLOR: Record<PredictionMarket['category'], string> = {
  politics: 'text-amber-400',
  sports: 'text-emerald-400',
  economics: 'text-sky-400',
  crypto: 'text-plasma',
  weather: 'text-blue-300',
  entertainment: 'text-pink-400',
  other: 'text-fog',
};

interface Props {
  market: PredictionMarket;
  yieldApy?: number;    // if passed, shows the "earn X% while this resolves" pill
  mountDelayMs?: number;  // stagger index × delay — animates in at T+N ms
}

export function MarketCard({ market, yieldApy, mountDelayMs = 0 }: Props) {
  const Icon = CATEGORY_ICON[market.category];
  const colorClass = CATEGORY_COLOR[market.category];
  const yesFlash = usePriceFlash(market.yesPrice);
  const noFlash = usePriceFlash(market.noPrice);

  return (
    <Link
      href={`/markets/${encodeURIComponent(market.ticker)}`}
      className="group relative block bg-ink-800 border border-ink-600 rounded-2xl p-5 hover:border-plasma/40 transition-all hover:-translate-y-0.5 animate-market-card-in"
      style={{ animationDelay: `${mountDelayMs}ms` }}
    >
      {/* Category row */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn('flex items-center gap-1.5 text-xs mono uppercase tracking-wider', colorClass)}>
          <Icon className="w-3.5 h-3.5" />
          {market.category}
        </div>
        <div className="flex items-center gap-1 text-xs text-fog mono">
          <Clock className="w-3 h-3" />
          {timeUntil(market.closeTime)}
        </div>
      </div>

      {/* Question */}
      <h3 className="display text-lg leading-tight text-chalk min-h-[2.5em] mb-4">
        {market.title}
      </h3>

      {/* Yes / No pricing */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-ink-700 rounded-lg px-3 py-2.5 border border-transparent group-hover:border-emerald-500/30 transition-colors">
          <div className="text-[10px] text-fog mono uppercase tracking-wider">Yes</div>
          <div
            className={cn(
              'display text-2xl text-emerald-400 transition-colors duration-200',
              yesFlash === 'up' && 'text-emerald-200',
              yesFlash === 'down' && 'text-rose-400',
            )}
          >
            {formatImpliedProb(market.yesPrice)}
          </div>
        </div>
        <div className="bg-ink-700 rounded-lg px-3 py-2.5 border border-transparent group-hover:border-rose-500/30 transition-colors">
          <div className="text-[10px] text-fog mono uppercase tracking-wider">No</div>
          <div
            className={cn(
              'display text-2xl text-rose-400 transition-colors duration-200',
              noFlash === 'up' && 'text-rose-200',
              noFlash === 'down' && 'text-emerald-400',
            )}
          >
            {formatImpliedProb(market.noPrice)}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t border-ink-600 text-xs mono text-fog">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {formatCompactUsd(market.volume24h)} 24h
        </span>
        {yieldApy !== undefined ? (
          <span className="flex items-center gap-1 text-plasma">
            <Zap className="w-3 h-3" />
            +{(yieldApy * 100).toFixed(1)}% APY idle
          </span>
        ) : null}
      </div>
    </Link>
  );
}
