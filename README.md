# FORESIGHT

> **Earn yield while you wait for the future.**
> Prediction-market yield vaults on Solana. The first composable layer on top of tokenized prediction markets.

<p align="center">
  <em>Solana Frontier Hackathon · Eitherway bounty submission</em>
</p>

---

## What it does

Foresight is a two-leg vault that sits on top of DFlow's tokenized Kalshi markets and Kamino's lending market.

When a user opens a position, their USDC deposit is split into:

1. **Prediction leg** — buys real SPL outcome tokens (Yes / No) via the DFlow Trade API. These are federally-regulated Kalshi positions, tokenized as standard SPL tokens.
2. **Yield leg** — deposits the remainder into Kamino's USDC Main Market reserve, earning supply APY + reward emissions the entire time the prediction is outstanding.

At market resolution, outcome tokens redeem for USDC and the Kamino position is withdrawn. The user gets: *prediction payoff* + *accrued yield on the idle half*.

It's the first working product that treats prediction markets as composable DeFi primitives — exactly the thesis DFlow stated when they launched the Prediction Markets API in December 2025.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                       Foresight frontend                        │
│                      (Next.js 14, TypeScript)                   │
└────────────┬─────────────────────────────────────┬─────────────┘
             │                                     │
             ▼                                     ▼
    ┌────────────────┐                    ┌────────────────┐
    │  useVault hook │                    │  wallet-adapter │
    │ (orchestration)│                    │ (Solflare + WS) │
    └───┬─────────┬──┘                    └───────┬─────────┘
        │         │                                │
        ▼         ▼                                │
  ┌──────────┐ ┌──────────┐                        │
  │  DFlow   │ │  Kamino  │                        │
  │  client  │ │  client  │                        │
  └───┬──────┘ └────┬─────┘                        │
      │             │                               │
      ▼             ▼                               ▼
┌─────────────┐  ┌──────────────┐        ┌──────────────────┐
│ Metadata API│  │klend-sdk     │        │  Solana mainnet   │
│ Trade API   │  │(vault + lend)│        │  (QuickNode RPC)  │
│ /quote /order│ │              │        │                    │
└──────┬──────┘  └──────┬───────┘        └──────────────────┘
       │                │
       ▼                ▼
  DFlow CLP       Kamino Main Market
 (async fills)    (USDC reserve, ~6.4% APY)
       │
       ▼
  Kalshi (offchain, CFTC-regulated)
```

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind, custom "plasma on ink" design tokens |
| Wallet | `@solana/wallet-adapter-react` with Solflare featured |
| RPC | QuickNode mainnet (swap in via env) |
| Prediction markets | DFlow Metadata + Trade APIs |
| Yield | `@kamino-finance/klend-sdk` |
| State | Zustand + React Query |
| Notifications | Sonner |

---

## Running it

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in:
#   NEXT_PUBLIC_SOLANA_RPC_URL   (QuickNode endpoint strongly recommended)
#   DFLOW_API_KEY                (optional for dev; required for production)
```

### DFlow endpoints (verified)

All DFlow integration uses the canonical endpoints published at https://pond.dflow.net/build/endpoints:

- **Metadata API:** `https://dev-prediction-markets-api.dflow.net` (dev tier, no key needed for discovery/pricing calls)
- **Trade API:** `https://dev-quote-api.dflow.net` (dev tier, key-less)

The dev tier is rate-limited and is **not Solana devnet** — it runs against Solana mainnet-beta with real USDC. Use a dedicated wallet funded with ~0.01 SOL and a small amount of USDC for testing.

### Mandatory: DFlow Proof KYC

DFlow's prediction markets are backed by **CFTC-regulated Kalshi liquidity**. Every wallet that buys an outcome token must first be verified at **https://dflow.net/proof**. This is a one-time step per wallet. Unverified wallets are blocked from `/order` calls.

### Run

```bash
npm run dev
```

Open http://localhost:3000 — connect a KYC-verified wallet with USDC to test a deposit.

---

## Sponsor integrations — what, where, why

### DFlow (primary)

- **What we use:** Metadata API (market discovery), Trade API (`/quote` + `/order`), order status polling.
- **Files:** `src/lib/dflow.ts`, `src/app/api/dflow/[...path]/route.ts`
- **Why:** The whole prediction leg runs on DFlow. We also built a server-side proxy (`/api/dflow/*`) to keep the API key off the client — a pattern DFlow docs don't document but every production app needs.

### Kamino (primary)

- **What we use:** `@kamino-finance/klend-sdk` — `KaminoMarket.load`, `KaminoAction.buildDepositTxns`, `KaminoAction.buildWithdrawTxns`, and reserve-stat reads for live APY display.
- **Files:** `src/lib/kamino.ts`
- **Why:** Yield on idle capital is the entire unlock. Kamino's USDC reserve is the deepest, safest Solana USDC yield source — perfect match.

### Solflare (wallet)

- **What we use:** `SolflareWalletAdapter` explicitly registered in the wallet-adapter config.
- **Files:** `src/components/SolanaProvider.tsx`
- **Why:** Solflare is a bounty sponsor; pinning it as the named first-party adapter makes the wallet flow recognizable to its users while still letting Phantom/Backpack/OKX connect via the Wallet Standard.

### QuickNode (infrastructure)

- **What we use:** `NEXT_PUBLIC_SOLANA_RPC_URL` — plug in a QuickNode endpoint.
- **Files:** `.env.example`, referenced in `src/components/SolanaProvider.tsx`.
- **Why:** Kamino SDK issues dozens of parallel account reads. Stock mainnet-beta RPC rate-limits within a minute. QuickNode's Solana endpoints are built exactly for this shape of load.

---

## The Eitherway angle

The initial scaffolding was generated from a single Eitherway prompt, which produced:

- File tree + `package.json`
- Next.js 14 App Router layout
- Tailwind config + design tokens
- Wallet provider wiring
- DFlow client skeleton
- Kamino client skeleton

We then refined the generated code into a production-grade app: adding the server-side proxy, writing the `useVault` orchestration hook, hand-tuning the UI, and integrating real SDK calls.

**The full prompt and the Eitherway-generated output are in [`pitch/eitherway-prompt.md`](pitch/eitherway-prompt.md).**

This matters for the bounty because it demonstrates Eitherway's core value proposition: natural-language-to-production Solana apps, with non-trivial sponsor integrations, shipped live.

---

## Repository map

```
foresight/
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Landing
│   │   ├── markets/page.tsx           # Market browser
│   │   ├── markets/[ticker]/page.tsx  # Deposit flow
│   │   ├── portfolio/page.tsx         # User positions
│   │   ├── docs/page.tsx              # Developer overview
│   │   ├── vault/page.tsx             # Alias redirect
│   │   └── api/dflow/[...path]/route.ts  # DFlow proxy
│   ├── components/                    # UI
│   ├── hooks/
│   │   ├── useVault.ts                # 🎯 core orchestration hook
│   │   └── useMarkets.ts              # market queries
│   ├── lib/
│   │   ├── dflow.ts                   # DFlow client
│   │   ├── kamino.ts                  # Kamino client
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── types/index.ts
├── pitch/                             # Submission materials
│   ├── eitherway-prompt.md
│   ├── demo-script.md
│   ├── architecture.md
│   └── pitch-deck.pptx
└── README.md
```

---

## Roadmap

1. **Jito bundles** — collapse the two legs into a single atomic bundle (currently two sequential txs).
2. **Outcome tokens as Kamino collateral** — borrow USDC against an open prediction. This is the first step toward leveraged prediction positions.
3. **Basket vaults** — "long all 2026 FOMC cut markets + earn idle yield" as a single deposit.
4. **Automated strategies** — delta-neutral prediction LPing, hedged pairs across correlated markets.

---

## Team

Solo-built for the Solana Frontier Hackathon, Eitherway bounty track.

---

## Links

- Live app: https://foresight-beryl.vercel.app/_
- Demo video: https://www.loom.com/share/739951a3863c4c149830c41ec87bd3b0
- Superteam Earn listing: https://superteam.fun/earn/listing/build-a-live-dapp-with-solflare-kamino-dflow-or-quicknode-with-eitherway-app
- DFlow docs: https://pond.dflow.net
- Kamino docs: https://docs.kamino.finance

## License

MIT
