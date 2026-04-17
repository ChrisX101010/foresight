'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Nav } from '@/components/Nav';
import { MarketCard } from '@/components/MarketCard';
import { useTrendingMarkets } from '@/hooks/useMarkets';
import { useVault } from '@/hooks/useVault';
import type { MarketCategory } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES: Array<{ value: MarketCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'economics', label: 'Economics' },
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'weather', label: 'Weather' },
  { value: 'entertainment', label: 'Culture' },
];

export default function MarketsPage() {
  const { data: markets = [], isLoading } = useTrendingMarkets(48);
  const { state } = useVault();

  const [q, setQ] = useState('');
  const [cat, setCat] = useState<MarketCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return markets.filter((m) => {
      if (cat !== 'all' && m.category !== cat) return false;
      if (q && !m.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [markets, cat, q]);

  return (
    <main className="min-h-screen">
      <Nav />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="mono text-xs text-fog uppercase tracking-wider mb-3">
            The terminal
          </p>
          <h1 className="display text-5xl md:text-6xl text-chalk mb-6">
            Every Kalshi market, <span className="italic text-plasma">live on Solana.</span>
          </h1>

          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search markets…"
                className="w-full bg-ink-800 border border-ink-600 rounded-full pl-10 pr-4 py-2.5 text-chalk placeholder-fog focus:outline-none focus:border-plasma/40 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCat(c.value)}
                  className={cn(
                    'mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors',
                    cat === c.value
                      ? 'border-plasma text-plasma bg-plasma/5'
                      : 'border-ink-500 text-fog hover:text-chalk hover:border-chalk/40'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-ink-800 border border-ink-600 rounded-2xl h-56 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((m) => (
              <MarketCard key={m.ticker} market={m} yieldApy={state.yieldInfo.totalApy} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="display text-3xl italic text-fog">No markets match.</p>
            <p className="mono text-xs text-fog mt-2">Try clearing your filters.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
