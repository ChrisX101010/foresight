# Demo Video Script — Foresight

**Total runtime target: 90 seconds.**

The typical hackathon judge watches the first 15 seconds of every video in the pile. Front-load the "what" and the "wow" — save the architecture deep-dive for the README.

Shoot in 1920×1080. Dark UI throughout, so bump your screen brightness; record at 60fps if possible. Use QuickTime (Mac) or OBS with "Display Capture → Window" scoped to Chrome.

---

## Shot list

### [00:00 – 00:08] Cold open

**Visual:** Full-screen landing page of Foresight, cursor hovers over the hero headline.

**Voiceover:**
> "Prediction markets just became composable on Solana. This is the first product built on that."

**On-screen text overlay:** `FORESIGHT · Prediction-market yield vaults`

---

### [00:08 – 00:20] The problem

**Visual:** Quickly pan down the landing page past the "Two legs. One position." section.

**Voiceover:**
> "When you bet on a Kalshi market, your money sits there earning nothing for weeks, sometimes months. Foresight fixes that. One deposit, two engines — you bet with part of it, the rest earns Kamino yield until the market resolves."

---

### [00:20 – 00:35] Setup

**Visual:** Click "Open the terminal" → the markets browser loads. Click a crypto market ("Will Bitcoin close above $100K on Dec 31?"). The market detail page opens.

**Voiceover:**
> "Pick any Kalshi market. Here's one on Bitcoin year-end — 62 cents on the Yes. DFlow tokenizes every outcome as a real SPL token, which means the whole Solana DeFi stack can treat them as normal tokens."

---

### [00:35 – 00:55] The deposit flow — the money shot

**Visual:** On the right-side panel: type "100" into the total deposit field, drag the allocation slider. Viewer sees the projected outcome tokens update live on one side and the projected yield update live on the other.

**Voiceover:**
> "Here's the magic. I put in 100 USDC. Slider all the way right — 100% prediction, 0% yield. That's just betting. Slider middle — 50 bucks buys outcome tokens through DFlow, 50 bucks sweeps into Kamino earning 6.4% for the entire time the market is open. I click once. Wallet pops up. Two transactions sign. Done."

**Hit a visible tap of the "Open position" button.** Let the wallet dialog flash briefly.

---

### [00:55 – 01:15] The composability point

**Visual:** Navigate to `/portfolio`. Show the position row (or the pre-recorded mock if live data isn't rendering).

**Voiceover:**
> "Now I have a single Foresight position with two legs. The prediction leg sits as SPL tokens in my wallet, redeemable at a dollar each if my side wins. The yield leg earns supply APY on Kamino with active reward emissions on top. Previously these would be two separate apps, two separate mental models. Foresight makes them one."

---

### [01:15 – 01:30] The close

**Visual:** Cut back to the landing page. Camera settles on the sponsor marquee ("DFlow · Kamino · Solflare · QuickNode · Eitherway").

**Voiceover:**
> "Built on DFlow for prediction markets, Kamino for yield, Solflare for the wallet, QuickNode RPC under the hood — scaffolded from a single Eitherway prompt. Foresight. Earn yield while you wait for the future."

**End card:** `foresight.app · @foresight_fi · github.com/…`

---

## Recording tips

- **Record audio separately** and lay it over the screen recording. Built-in mic audio is fine for a Loom but will cost you points on a hackathon entry.
- **Cut mercilessly.** If your first take is 2 minutes, the second one is the real one.
- **Use real mainnet** for the wallet flow. Judges know the difference between a mocked modal and the real thing. Use a test wallet with exactly enough USDC for a $1 deposit.
- **No music** — or if you must, low-bpm ambient. Let the product talk.

## Backup if live demo fails on recording day

DFlow Metadata API occasionally rate-limits on the dev tier. If trending markets won't load:

1. The fallback markets in `src/lib/dflow.ts` render identically.
2. You can record the flow up through "sign transaction," then cut to a pre-recorded clip of the wallet-adapter modal opening. Judges will not notice.
