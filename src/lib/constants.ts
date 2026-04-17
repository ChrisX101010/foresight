// ────────────────────────────────────────────────────────────────────────
// On-chain constants. All mainnet. Sourced from:
// • Kamino docs: https://docs.kamino.finance/build-on-kamino/sdk-and-smart-contracts
// • DFlow docs: https://pond.dflow.net
// • SPL token registry
// ────────────────────────────────────────────────────────────────────────

import { PublicKey } from '@solana/web3.js';

// ─── Token mints ─────────────────────────────────────────────────────────
export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

export const SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112'
);

// ─── Kamino ──────────────────────────────────────────────────────────────
// klend program & main market — verified from Kamino docs
export const KAMINO_KLEND_PROGRAM = new PublicKey(
  'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'
);

// Main lending market (USDC, USDT, SOL, mSOL, …)
export const KAMINO_MAIN_MARKET = new PublicKey(
  '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF'
);

// ─── DFlow ───────────────────────────────────────────────────────────────
// Metadata API base (proxied through /api/dflow in next.config.js to hide
// the API key) — pond.dflow.net is the docs host; api.prod.dflow.net is
// the actual metadata endpoint.
export const DFLOW_METADATA_PATH = '/api/dflow';  // client-side
export const DFLOW_QUOTE_BASE = 'https://quote-api.prod.dflow.net';

// ─── App constants ───────────────────────────────────────────────────────
export const DEFAULT_SLIPPAGE_BPS = 50;          // 0.5%
export const PRIORITY_FEE_MICROLAMPORTS = 50_000;

// When idle capital percentage crosses this threshold we surface the
// "sweep to Kamino" CTA in the UI.
export const IDLE_SWEEP_THRESHOLD_USD = 10;
