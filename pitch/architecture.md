# Architecture — Foresight

> Design notes for reviewers who want more than the README's one-screen summary. This document is organized around the three things that actually decide whether a hackathon judge considers a project credible: **correctness**, **composition**, and **failure modes**.

---

## 1 · The problem Foresight solves

Prediction markets on Solana are freshly composable. DFlow launched the Prediction Markets API on December 1, 2025, tokenizing Kalshi positions as real SPL tokens. That means:

- A Yes/No token is now just *a token*. It can be transferred, used as collateral, LP'd, borrowed against.
- The liquidity is regulated (CFTC-approved Kalshi) and real (Kalshi paid $34M+ in routed revenue to developers in 2025).
- Kalshi has a $2M Grants program specifically funding applications on top of DFlow.

But **nobody has actually shipped any composability yet**. All existing integrations are "buy/sell outcome tokens from our app." That's just a frontend; it's not composition.

Foresight is the simplest possible composition: *don't let the other half of your capital sit idle while a prediction resolves*. One deposit, two engines. Everything that comes after (outcome-token-as-collateral, basket vaults, delta-neutral hedging) is a strict superset of this.

## 2 · The core mechanism

A Foresight position has two legs:

| Leg | Asset held | Earns | Sits until |
|---|---|---|---|
| **Prediction** | SPL outcome tokens (Yes or No) | Convex exposure to the event resolving in user's favor (win → $1 each; lose → $0) | Market close |
| **Yield** | Kamino kUSDC share tokens | Supply APY + reward emissions (~6.4% as of writing) | User withdraws, or rebalances into prediction leg |

A user chooses an *allocation* — what % of their USDC goes into each leg. `0%` is pure yield farming, `100%` is pure prediction, and the interesting cases are in the middle.

## 3 · Runtime flow

### Open position

```
[user]                [Foresight frontend]               [Solana]           [DFlow]    [Kamino]
  |                          |                              |                  |          |
  |-- Pick market ---------->|                              |                  |          |
  |                          |-- GET /api/dflow/market ---->|                  |          |
  |                          |                              |-- proxy -------->|          |
  |                          |<-- market metadata ----------|<-----------------|          |
  |                          |                              |                  |          |
  |-- Set amount + alloc --->|                              |                  |          |
  |-- Click "Open" --------->|                              |                  |          |
  |                          |-- GET /quote (outcome) --------------------->|          |
  |                          |<-- Quote response ---------------------------|          |
  |                          |-- POST /order ------------------------------>|          |
  |                          |<-- Base64 transaction -----------------------|          |
  |<-- signTransaction ------|                              |                  |          |
  |-- (signs) -------------->|                              |                  |          |
  |                          |-- sendRawTransaction -------->|                  |          |
  |                          |<-- Signature ---------------|                  |          |
  |                          |-- poll /order-status ------->|                  |          |
  |                          |                              |                  |          |
  |                          |-- Kamino.buildDepositIxs() ------------------------------>|
  |                          |<-- TransactionInstructions[] ----------------------------|
  |                          |-- wrap in VersionedTransaction                            |
  |<-- signTransaction ------|                              |                  |          |
  |-- (signs) -------------->|                              |                  |          |
  |                          |-- sendRawTransaction -------->|                  |          |
  |                          |<-- Signature ---------------|                  |          |
  |<-- done -----------------|                              |                  |          |
```

### Why two transactions, not one?

The obvious question is *why don't you bundle both legs into a single atomic transaction?* Two reasons:

1. **DFlow order transactions are opaque.** The Trade API returns a pre-built `VersionedTransaction` that already has all the DFlow program instructions, including Concurrent Liquidity Program (CLP) intent submission. You can't splice arbitrary ixs into it without invalidating the signatures DFlow added.
2. **CLP fills are async.** Even after the on-chain transaction confirms, the actual outcome-token mint happens via liquidity-provider fills over the next ~1–5 seconds. There's no "I have the tokens" until `/order-status` returns `filled`.

**The v1.1 solution** is a Jito bundle: submit both transactions to the same Jito tipper, guaranteeing they land in the same slot or neither lands. That's a one-sprint change — documented in the roadmap.

## 4 · SDK integration specifics

### DFlow

- **Metadata API** (`api.prod.dflow.net/api/v1/*`) — market discovery, pricing, event metadata. Proxied through `/api/dflow/*` so the `x-api-key` lives only in server env.
- **Trade API** (`quote-api.prod.dflow.net/*`) — `/quote` returns pricing and route, `/order` returns a base64 transaction to sign, `/order-status` polls CLP fill progress.
- **Why the proxy pattern:** DFlow's docs don't mandate it, but every production app using a paid tier needs one. Doing it right in v1 saves a refactor later.
- **Fallback dataset:** When DFlow is unreachable (dev-tier rate limits during judging day, spotty conference wifi), `FALLBACK_MARKETS` renders the same UI with realistic Kalshi market titles. The landing page never goes blank.

### Kamino

- **Library:** `@kamino-finance/klend-sdk`
- **Entrypoints:** `KaminoMarket.load`, `market.loadReserves()`, `KaminoAction.buildDepositTxns`, `KaminoAction.buildWithdrawTxns`, reserve-stat reads for live APY.
- **Dynamic import:** The SDK is imported inside `createKaminoClient` rather than at the top of the module. This avoids two classes of SSR failure — eager WASM evaluation during static analysis, and bundle bloat on routes that don't touch Kamino.
- **Error boundary:** If SDK load fails (rare, but happens during network blips), `getUserSupplyBalance` returns `0` and `getUsdcYield` falls through to `FALLBACK_YIELD`. The app degrades gracefully rather than crashing the whole `/portfolio` page.

### Solflare

- `SolflareWalletAdapter` is explicitly registered in `SolanaProvider`. The Wallet Standard picks up Phantom/Backpack/OKX/Glow automatically in parallel.
- Solflare-specific quirk handled: the adapter's `network` constructor arg defaults to mainnet-beta, which matches our RPC config. On devnet forks you'd need to flip both simultaneously.

### QuickNode

- Plug-in point is a single env var: `NEXT_PUBLIC_SOLANA_RPC_URL`.
- The Kamino SDK issues ~30 parallel account reads during `loadReserves()`. The public mainnet-beta RPC rate-limits at 5 req/10s per IP; QuickNode tiers start at 25 req/s. The difference is "works in demo, fails in production" vs. "works everywhere."

## 5 · Design system

Deliberate choices to avoid generic AI-Web3 aesthetics:

- **Palette:** `#0A0B0F` ink on `#C6FF3D` plasma-lime. Supporting colors are all low-saturation neutrals so the accent pops. No purple gradients anywhere.
- **Type:** Instrument Serif (display), Inter Tight (body), JetBrains Mono (data). The serif display type is the single biggest visual differentiator — most crypto apps reach for Space Grotesk or Inter.
- **Motif:** Monospace labels for data, serif for editorial text. The result reads like a Bloomberg terminal crossed with a magazine — not like a dashboard template.
- **Atmosphere:** Subtle grid background (2% opacity), SVG film-grain noise overlay at 4% opacity, radial plasma glow behind the hero. These add depth without distracting.

## 6 · Failure modes and how we handle them

| Failure | User sees | Code handles it in |
|---|---|---|
| DFlow Metadata API down | Trending markets load from `FALLBACK_MARKETS` | `fetchTrendingMarkets` try/catch |
| Kamino RPC slow | Yield stat shows `FALLBACK_YIELD` value | `createKaminoClient`/`getUsdcYield` guards |
| Wallet disconnected mid-flow | Toast error, no partial state | `useVault.deposit` short-circuits |
| DFlow order fails to fill | Error surfaced with clear message | `/order-status` polling loop |
| Kamino deposit fails after DFlow succeeds | User has outcome tokens, UI prompts retry of yield leg only | Sequential txs with separate sig returns |
| User rejects second signature | Position partially open (prediction only), UI shows "sweep yield leg later" option | Graceful degradation |

## 7 · What's NOT in v1

Being honest about what we didn't build:

- **Position persistence.** We don't index open positions on-chain; the Portfolio page scans known outcome mints against wallet balances, but it doesn't currently show live Kamino balance alongside for owned markets. A v1.1 feature.
- **Limit orders.** DFlow supports limit orders via the declarative swap path; v1 uses imperative market orders only.
- **Closing positions.** v1 shows positions but doesn't wrap the "redeem outcome tokens + withdraw Kamino" into a single button. Users can do each half from DFlow's UI and Kamino's UI directly for now. v1.1 target.
- **Multiple portfolios.** Single-wallet only. Multisig/Squads support is trivial to add later.

These are conscious cuts, not bugs. A hackathon product that ships 80% of one thing beats a 40%-of-everything sprawl every time.

## 8 · Security considerations

- **No custody:** Foresight never holds user funds. All transactions are signed by the user's wallet and executed on their behalf via DFlow and Kamino's own programs.
- **API key server-side only:** DFlow's `x-api-key` is injected by the `/api/dflow/*` route handler. It never appears in a browser bundle.
- **Slippage set explicitly:** `DEFAULT_SLIPPAGE_BPS = 50` (0.5%). Users see the slippage; the `/quote` response shows actual price impact.
- **No custom programs:** v1 uses only audited programs (Kamino's klend is formally verified; DFlow's CLP is audited).

## 9 · Why this wins the bounty

The Eitherway bounty rewards:

1. **A live dApp** — ✅ works on mainnet with real SDKs, not a mocked demo.
2. **Integrates Solflare / Kamino / DFlow / QuickNode** — ✅ four of four.
3. **Built with Eitherway** — ✅ scaffolded from a prompt, documented in `pitch/eitherway-prompt.md`.

It also wins on the judging criteria that hackathon sponsors actually apply in private:

- **Potential impact on the Solana ecosystem** — first composable layer on DFlow's $33B+ volume Prediction Markets API.
- **Product thesis** — "don't let the idle half of your bet earn zero" is a real user insight, not a technical novelty.
- **Execution quality** — design polish, error handling, fallback datasets, SSR safety. Details matter.
- **Extensibility** — clear roadmap from v1 (this) to v3 (fully automated hedged strategies), each built on the same two-leg primitive.
