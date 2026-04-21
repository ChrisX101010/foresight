'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTrendingMarkets, fetchMarketByTicker } from '@/lib/dflow';

export function useTrendingMarkets(limit = 24) {
  return useQuery({
    queryKey: ['markets', 'trending', limit],
    queryFn: () => fetchTrendingMarkets(limit),
    // 5s feels "live" to a user without pounding DFlow's dev tier.
    // Anything under 2s needs WebSockets, not polling.
    staleTime: 3_000,
    refetchInterval: 5_000,
    // Pause when the tab isn't visible — respects rate limits and doesn't
    // burn RPC credits on idle tabs.
    refetchIntervalInBackground: false,
    // Refetch when the user returns to the tab — critical for "looks live"
    refetchOnWindowFocus: true,
    // Don't flash an empty state during refetch; keep the last data shown.
    placeholderData: (prev) => prev,
  });
}

export function useMarket(ticker: string | null) {
  return useQuery({
    queryKey: ['market', ticker],
    queryFn: () => (ticker ? fetchMarketByTicker(ticker) : Promise.resolve(null)),
    enabled: !!ticker,
    // Individual market page — user is actively looking at this one card,
    // so we refresh faster.
    staleTime: 2_000,
    refetchInterval: 3_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
}
