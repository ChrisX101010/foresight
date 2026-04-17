'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTrendingMarkets, fetchMarketByTicker } from '@/lib/dflow';

export function useTrendingMarkets(limit = 24) {
  return useQuery({
    queryKey: ['markets', 'trending', limit],
    queryFn: () => fetchTrendingMarkets(limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarket(ticker: string | null) {
  return useQuery({
    queryKey: ['market', ticker],
    queryFn: () => (ticker ? fetchMarketByTicker(ticker) : Promise.resolve(null)),
    enabled: !!ticker,
    staleTime: 15_000,
  });
}
