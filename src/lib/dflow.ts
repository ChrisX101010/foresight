// ────────────────────────────────────────────────────────────────────────
// DFlow Prediction Markets client — VERIFIED against canonical SDK sources.
//
// Sources this file was audited against:
//   - https://pond.dflow.net/build/endpoints
//   - https://pond.dflow.net/build/introduction
//   - https://www.quicknode.com/guides/solana-development/3rd-party-integrations/kalshi-prediction-markets-with-dflow
//
// Key facts that shape this file:
//   - Dev endpoints are key-less and open:
//       Metadata: https://dev-prediction-markets-api.dflow.net
//       Trade:    https://dev-quote-api.dflow.net
//     Production requires x-api-key header from DFlow.
//   - Data is hierarchical: Series → Event → Market.
//   - Each Market has an `accounts` map keyed by settlement mint.
//     The yesMint/noMint live INSIDE accounts[USDC_MINT], not at market root.
//   - Prices are strings: "0.7700". Needs Number() casting.
//   - /order is a single GET call with query params. It does quote AND
//     tx-build in one shot — no separate /quote call.
//   - /order-status requires BOTH signature and lastValidBlockHeight.
//   - KYC via DFlow Proof is mandatory before real trading works.
// ────────────────────────────────────────────────────────────────────────

import { jsonFetch } from './utils';
import { USDC_MINT } from './constants';
import type { PredictionMarket, MarketCategory } from '@/types';

// ─── Endpoint resolution ─────────────────────────────────────────────────
// Metadata goes through /api/dflow proxy so x-api-key stays server-side.
// Trade API goes direct from the browser — /order quotes are cheap and
// key-less on dev.

export const DFLOW_METADATA_PATH = '/api/dflow';
export const DFLOW_TRADE_BASE =
  process.env.NEXT_PUBLIC_DFLOW_TRADE_BASE ?? 'https://dev-quote-api.dflow.net';

// ─── Raw response shapes ─────────────────────────────────────────────────

interface RawMarketAccountInfo {
  yesMint: string;
  noMint: string;
  marketLedger?: string;
  isInitialized?: boolean;
  redemptionStatus: 'open' | 'pending' | null;
  scalarOutcomePercent?: number | null;
}

interface RawDflowMarket {
  ticker: string;
  eventTicker: string;
  title: string;
  yesSubTitle?: string;
  noSubTitle?: string;
  status: 'active' | 'determined' | 'finalized' | 'suspended' | string;
  result?: 'yes' | 'no' | '' | null;
  openTime?: number;
  closeTime?: number;
  yesBid?: string | null;
  yesAsk?: string | null;
  noBid?: string | null;
  noAsk?: string | null;
  accounts: Record<string, RawMarketAccountInfo>;
}

interface RawDflowEvent {
  ticker: string;
  seriesTicker?: string;
  title: string;
  subtitle?: string | null;
  status?: string;
  markets: RawDflowMarket[];
}

interface RawEventsResponse {
  events: RawDflowEvent[];
  cursor?: number | null;
}

export interface DflowOrderResponse {
  outAmount: string;
  executionMode: 'sync' | 'async';
  transaction: string;       // base64 VersionedTransaction
  lastValidBlockHeight: number;
  revertMint?: string;
}

export interface DflowOrderStatus {
  status: 'pending' | 'expired' | 'failed' | 'open' | 'pendingClose' | 'closed';
  outAmount: number;
  reverts?: { signature: string }[];
}

// ─── Category inference from series ticker ──────────────────────────────

function inferCategoryFromTicker(ticker: string): MarketCategory {
  const t = ticker.toUpperCase();
  if (t.startsWith('KXEPL') || t.startsWith('KXNFL') || t.startsWith('KXNBA') ||
      t.startsWith('KXMLB') || t.startsWith('KXNHL')) return 'sports';
  if (t.startsWith('KXBTC') || t.startsWith('KXETH') || t.startsWith('KXSOL') ||
      t.includes('CRYPTO')) return 'crypto';
  if (t.startsWith('KXFED') || t.startsWith('KXCPI') || t.startsWith('KXGDP')) return 'economics';
  if (t.startsWith('KXPRES') || t.startsWith('KXELEC') || t.includes('POLI')) return 'politics';
  if (t.includes('WEATHER') || t.includes('SNOW') || t.includes('TEMP')) return 'weather';
  if (t.includes('OSCAR') || t.includes('EMMY') || t.includes('GRAMMY')) return 'entertainment';
  return 'other';
}

// ─── Raw → domain mapping ────────────────────────────────────────────────

function mapMarket(
  raw: RawDflowMarket,
  parent: RawDflowEvent
): PredictionMarket | null {
  const usdc = USDC_MINT.toBase58();
  const acct = raw.accounts[usdc] ?? Object.values(raw.accounts)[0];
  // Skip markets where the USDC account isn't initialized — users can't trade
  // these, and showing them would produce confusing errors.
  if (!acct || acct.isInitialized === false) return null;

  const yesAsk = raw.yesAsk ? Number(raw.yesAsk) : 0;
  const noAsk = raw.noAsk ? Number(raw.noAsk) : 0;

  return {
    ticker: raw.ticker,
    eventTicker: raw.eventTicker ?? parent.ticker,
    title: parent.title,
    subtitle: parent.subtitle ?? undefined,
    category: inferCategoryFromTicker(parent.seriesTicker ?? raw.ticker),
    closeTime: raw.closeTime
      ? new Date(raw.closeTime * 1000).toISOString()
      : new Date(Date.now() + 86_400_000 * 7).toISOString(),
    yesMint: acct.yesMint,
    noMint: acct.noMint,
    settlementMint: usdc,
    yesPrice: yesAsk,
    noPrice: noAsk || (yesAsk ? 1 - yesAsk : 0),
    volume24h: 0,   // not exposed on /events endpoint
    openInterest: 0,
    status: raw.status === 'finalized' || raw.status === 'determined'
      ? 'resolved'
      : raw.status === 'suspended' || !raw.status
        ? 'closed'
        : 'open',
    winningSide:
      raw.result === 'yes' ? 'yes' :
      raw.result === 'no'  ? 'no'  : undefined,
  };
}

// ─── Market discovery ────────────────────────────────────────────────────

// Featured series give the landing page a curated spread across categories.
// For production you'd fetch this dynamically from user activity.
const FEATURED_SERIES = ['KXEPLGAME', 'KXBTCD', 'KXFED', 'KXNBAGAME'];

export async function fetchTrendingMarkets(limit = 24): Promise<PredictionMarket[]> {
  const results: PredictionMarket[] = [];

  for (const series of FEATURED_SERIES) {
    try {
      const qs = new URLSearchParams({
        seriesTickers: series,
        status: 'active',
        withNestedMarkets: 'true',
      });
      const data = await jsonFetch<RawEventsResponse>(
        `${DFLOW_METADATA_PATH}/events?${qs.toString()}`
      );
      for (const ev of data.events ?? []) {
        for (const m of ev.markets ?? []) {
          const mapped = mapMarket(m, ev);
          if (mapped && mapped.status === 'open') results.push(mapped);
          if (results.length >= limit) break;
        }
        if (results.length >= limit) break;
      }
    } catch (err) {
      console.warn(`[dflow] series ${series} failed:`, err);
    }
    if (results.length >= limit) break;
  }

  if (results.length === 0) {
    console.warn('[dflow] all series failed — using fallback demo data');
    return FALLBACK_MARKETS;
  }
  return results;
}

export async function fetchMarketByTicker(
  ticker: string
): Promise<PredictionMarket | null> {
  // Try multiple lookup strategies: the DFlow Metadata API is hierarchical
  // (Series → Event → Market), and market ticker shapes vary by series.
  // Some have nested segments (KXEPLGAME-26FEB18WOLARS-ARS), others are
  // flat (KXBTCD-26APR17-5PM). Try progressively broader event tickers.
  const candidates: string[] = [ticker];
  const parts = ticker.split('-');
  for (let i = parts.length - 1; i > 0; i--) {
    candidates.push(parts.slice(0, i).join('-'));
  }

  for (const candidate of candidates) {
    try {
      const qs = new URLSearchParams({
        eventTickers: candidate,
        withNestedMarkets: 'true',
      });
      const data = await jsonFetch<RawEventsResponse>(
        `${DFLOW_METADATA_PATH}/events?${qs.toString()}`
      );
      for (const ev of data.events ?? []) {
        for (const m of ev.markets ?? []) {
          if (m.ticker === ticker) return mapMarket(m, ev);
        }
      }
    } catch (err) {
      // Try next candidate silently.
    }
  }

  // Last resort: scan the trending set we already fetched client-side.
  const trending = await fetchTrendingMarkets(48);
  const hit = trending.find((m) => m.ticker === ticker);
  if (hit) return hit;

  console.warn('[dflow] market not found for ticker:', ticker);
  return FALLBACK_MARKETS.find((m) => m.ticker === ticker) ?? null;
}

// ─── Trading ─────────────────────────────────────────────────────────────

/**
 * Request an order from DFlow Trade API.
 * Single GET call returns base64 tx + expected out amount. No separate
 * quote step needed.
 *
 * amountUsdc → USDC to spend (UI-facing units, e.g. 1.0 = $1.00).
 */
export async function requestBuyOrder(params: {
  outcomeMint: string;
  amountUsdc: number;
  userPublicKey: string;
  slippageBps?: number | 'auto';
  priorityFeeLamports?: number;
}): Promise<DflowOrderResponse> {
  const amountBaseUnits = Math.floor(params.amountUsdc * 1_000_000); // USDC has 6 decimals

  const qs = new URLSearchParams({
    inputMint: USDC_MINT.toBase58(),
    outputMint: params.outcomeMint,
    amount: String(amountBaseUnits),
    userPublicKey: params.userPublicKey,
    slippageBps: String(params.slippageBps ?? 'auto'),
    dynamicComputeUnitLimit: 'true',
    prioritizationFeeLamports: String(params.priorityFeeLamports ?? 5000),
  });

  return jsonFetch<DflowOrderResponse>(
    `${DFLOW_TRADE_BASE}/order?${qs.toString()}`
  );
}

/**
 * Poll DFlow for fill status. Async CLP orders confirm on-chain fast but
 * the actual outcome-token mint happens when LPs fill the intent — usually
 * 1–5 seconds after confirmation.
 */
export async function getOrderStatus(
  signature: string,
  lastValidBlockHeight: number
): Promise<DflowOrderStatus> {
  const qs = new URLSearchParams({
    signature,
    lastValidBlockHeight: String(lastValidBlockHeight),
  });
  return jsonFetch<DflowOrderStatus>(
    `${DFLOW_TRADE_BASE}/order-status?${qs.toString()}`
  );
}

// ─── Fallback demo data ──────────────────────────────────────────────────
// These mints are placeholders. Buy attempts will fail at /order, which is
// correct — we never want to silently create invalid SPL tokens.

export const FALLBACK_MARKETS: PredictionMarket[] = [
  {
    ticker: 'DEMO-KXEPL-MCIARS',
    eventTicker: 'DEMO-KXEPL-MCIARS',
    title: 'Man City vs Arsenal — who wins?',
    subtitle: 'Demo market · live DFlow data unavailable',
    category: 'sports',
    closeTime: new Date(Date.now() + 86_400_000 * 3).toISOString(),
    yesMint: 'DEMO_ONLY_NOT_A_REAL_MINT_XXXXXXXXXXXXXXXX1',
    noMint:  'DEMO_ONLY_NOT_A_REAL_MINT_XXXXXXXXXXXXXXXX2',
    settlementMint: USDC_MINT.toBase58(),
    yesPrice: 0.48,
    noPrice: 0.52,
    volume24h: 290_000,
    openInterest: 1_100_000,
    status: 'open',
  },
  {
    ticker: 'DEMO-KXBTC-100K',
    eventTicker: 'DEMO-KXBTC-100K',
    title: 'Will Bitcoin close above $100,000 this year?',
    subtitle: 'Demo market · live DFlow data unavailable',
    category: 'crypto',
    closeTime: new Date(Date.now() + 86_400_000 * 30).toISOString(),
    yesMint: 'DEMO_ONLY_NOT_A_REAL_MINT_XXXXXXXXXXXXXXXX3',
    noMint:  'DEMO_ONLY_NOT_A_REAL_MINT_XXXXXXXXXXXXXXXX4',
    settlementMint: USDC_MINT.toBase58(),
    yesPrice: 0.62,
    noPrice: 0.38,
    volume24h: 840_000,
    openInterest: 4_200_000,
    status: 'open',
  },
  {
    ticker: 'DEMO-KXFED-25CUT',
    eventTicker: 'DEMO-KXFED-25CUT',
    title: 'Will the Fed cut rates by 25+ bps next meeting?',
    subtitle: 'Demo market · live DFlow data unavailable',
    category: 'economics',
    closeTime: new Date(Date.now() + 86_400_000 * 45).toISOString(),
    yesMint: 'DEMO_ONLY_NOT_A_REAL_MINT_XXXXXXXXXXXXXXXX5',
    noMint:  'DEMO_ONLY_NOT_A_REAL_MINT_XXXXXXXXXXXXXXXX6',
    settlementMint: USDC_MINT.toBase58(),
    yesPrice: 0.41,
    noPrice: 0.59,
    volume24h: 1_200_000,
    openInterest: 6_800_000,
    status: 'open',
  },
];
