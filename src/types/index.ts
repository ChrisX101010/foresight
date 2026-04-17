// ────────────────────────────────────────────────────────────────────────
// Domain types for FORESIGHT.
// Kept deliberately small and decoupled from SDK internal types — the
// clients in src/lib/* map SDK shapes onto these.
// ────────────────────────────────────────────────────────────────────────

export type MarketCategory =
  | 'politics'
  | 'sports'
  | 'economics'
  | 'crypto'
  | 'weather'
  | 'entertainment'
  | 'other';

/**
 * A tradeable Kalshi market exposed through DFlow. Each market has two
 * outcome tokens (Yes / No), both of which are real SPL mints on Solana.
 */
export interface PredictionMarket {
  ticker: string;                 // e.g. "KXBTC-25DEC31-T100000"
  eventTicker: string;            // parent event ticker
  title: string;                  // human question: "Will BTC close > $100K on Dec 31?"
  subtitle?: string;
  category: MarketCategory;
  closeTime: string;              // ISO timestamp
  resolutionSource?: string;

  yesMint: string;                // SPL mint of YES outcome token
  noMint: string;                 // SPL mint of NO outcome token
  settlementMint: string;         // usually USDC

  yesPrice: number;               // 0..1 implied probability
  noPrice: number;                // 0..1 implied probability, yesPrice + noPrice ≈ 1
  volume24h: number;              // USD
  openInterest: number;           // USD

  status: 'open' | 'closed' | 'resolved';
  winningSide?: 'yes' | 'no';
}

export type PositionSide = 'yes' | 'no';

/**
 * A FORESIGHT vault position. Combines (1) outcome tokens held, and
 * (2) idle USDC deposited into Kamino while the prediction is open.
 */
export interface VaultPosition {
  id: string;                     // deterministic from wallet + market ticker
  owner: string;                  // wallet address
  market: PredictionMarket;
  side: PositionSide;

  // Prediction leg
  outcomeTokensHeld: number;      // # of YES or NO SPL tokens
  entryPrice: number;             // avg fill price in USDC
  costBasisUsd: number;

  // Yield leg (Kamino)
  kaminoSharesHeld: number;       // kToken share amount
  kaminoUnderlyingUsdc: number;   // shares * exchangeRate
  kaminoApy: number;              // 0..1, live reserve APY

  // Aggregates
  createdAt: number;              // unix ms
  lastUpdated: number;
}

/**
 * Quote returned by the DFlow /quote endpoint for building the mint tx.
 */
export interface DflowQuote {
  inputMint: string;
  outputMint: string;             // the outcome token mint
  inAmount: string;               // lamports
  outAmount: string;
  priceImpactPct: number;
  slippageBps: number;
  routePlan: unknown[];           // opaque — we just pass to /swap
  quoteId: string;
}

/**
 * Human-friendly APY breakdown — computed once and displayed everywhere.
 */
export interface YieldBreakdown {
  reserveApy: number;             // supply APY on Kamino
  rewardApy: number;              // KMNO + other reward emissions
  totalApy: number;
  utilization: number;
}
