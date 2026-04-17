# The Eitherway prompt

This is the exact prompt we fed to Eitherway to scaffold Foresight. The generated starting point is the reason we could ship an end-to-end dApp in a hackathon window rather than two weeks of boilerplate.

Everything below the divider was typed into `eitherway.ai/chat` verbatim.

---

## The prompt

> Build me a production-grade Solana dApp called **Foresight**. It's a prediction-market yield vault — the first product that treats DFlow's tokenized Kalshi markets as composable DeFi primitives.
>
> **What the app does**
>
> A user deposits USDC. The deposit splits into two legs:
> 1. A prediction leg that buys Yes or No outcome tokens for a Kalshi market via DFlow.
> 2. A yield leg that deposits the remainder into Kamino's USDC Main Market to earn supply APY.
>
> Both happen in the same user flow, sequentially (one DFlow transaction, then one Kamino transaction). The user gets a single "position" page showing both legs.
>
> **Tech requirements**
>
> - Next.js 14 with App Router, TypeScript strict mode.
> - Tailwind CSS with a custom design system — dark background (`#0A0B0F` near-black), toxic-lime accent (`#C6FF3D`), serif display type for headlines (Instrument Serif), sans for body (Inter Tight), monospace for data (JetBrains Mono). *Not* the generic purple-gradient look.
> - `@solana/wallet-adapter-react` with Solflare registered as a first-class wallet. Other wallets pick up via the Wallet Standard.
> - `@kamino-finance/klend-sdk` for the Kamino integration. Use `KaminoMarket.load`, `KaminoAction.buildDepositTxns`, `KaminoAction.buildWithdrawTxns`. Main Market USDC reserve.
> - DFlow integration via their Metadata API (`/api/v1/events`, `/api/v1/market/:ticker`) and Trade API (`/quote`, `/order`, `/order-status`). Server-side Next.js proxy for the Metadata API so the `x-api-key` never leaks to the client.
> - QuickNode RPC endpoint pluggable via env var.
> - React Query for data fetching, Zustand for any global state, Sonner for toasts, Framer Motion for hero animations, Lucide for icons.
>
> **Pages**
>
> - `/` — landing with hero, "how it works," trending markets, sponsor attribution.
> - `/markets` — filterable, searchable grid of all DFlow prediction markets.
> - `/markets/[ticker]` — market detail with two-leg deposit panel: side toggle, total budget input, allocation slider, live projections (outcome tokens, projected yield at resolution, Kamino APY right now), and a single "Open position" button.
> - `/portfolio` — connected user's positions.
> - `/docs` — developer overview of the architecture.
>
> **Orchestration hook — the key piece**
>
> A `useVault` hook that exposes a `deposit({ market, side, predictionBudgetUsd, yieldBudgetUsd })` method. It:
> 1. Quotes the outcome buy via DFlow.
> 2. Builds, signs, sends the mint transaction.
> 3. Polls `/order-status` for async CLP fill.
> 4. Builds Kamino deposit instructions for the remainder.
> 5. Signs + sends + confirms.
> 6. Streams state progress through a `currentStep` enum so the UI can show "Awaiting signature for prediction leg…" etc.
>
> **Polish**
>
> Fallback demo markets in case DFlow's dev tier rate-limits. Graceful handling of disconnected wallets. A top-of-hero marquee ticker showing the four sponsor integrations. Custom-styled wallet-adapter button to match the plasma palette.
>
> Ship the whole thing as a single Next.js project I can `npm install && npm run dev`.

---

## What Eitherway produced

- Project skeleton with `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`
- App Router layout with font loading
- `SolanaProvider` wrapping the app with `ConnectionProvider` + `WalletProvider`
- `dflow.ts` and `kamino.ts` client skeletons with the exact method signatures the hook expected
- A working `useVault` hook stub with the right state machine
- Landing page with hero + "how it works" grid + trending-markets section
- Market browser and market detail pages
- Design tokens plumbed through Tailwind

## What we refined by hand

- Server-side DFlow proxy (Eitherway output called the API directly from client, leaking keys).
- The full deposit orchestration (Eitherway's stub was a single transaction — real flow needs two sequential txs with async CLP polling between them).
- Fallback market dataset with realistic Kalshi market titles.
- Hardened Kamino client: lazy-import to avoid SSR WASM issues, bounded error handling, reserve-stat → `YieldBreakdown` mapping.
- All of the microcopy and the editorial-trading-terminal aesthetic — Eitherway defaults to generic Web3 styling; the plasma-on-ink direction was hand-tuned.
- Sonner toast integration, wallet-adapter button restyle, marquee ticker, grid-bg + noise overlay for atmosphere.
- The projection math (outcome tokens, projected yield at resolution, time-to-close display).

## Why this matters for the bounty

The Eitherway bounty asks builders to ship a live dApp **using Eitherway**. The story we can honestly tell judges is: Eitherway handled the tedious 60% (project config, boilerplate, SDK wiring patterns, page skeletons). We spent our time on the 40% that actually matters for winning — the unique orchestration logic, the production safety work (key handling, error paths, fallbacks), and the design polish.

That's the exact value prop Eitherway is selling.
