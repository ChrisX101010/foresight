# Foresight — Setup guide (WSL / Ubuntu)

Tailored for a Windows machine with WSL installed. Assumes the project zip is in your Windows `Downloads` folder.

---

## 1 · Move the project into WSL

Open your WSL terminal (Ubuntu). Do **not** run the project from inside `/mnt/c/Users/...` — the file watcher that Next.js uses is dramatically slower on mounted Windows drives and you will hit weird permission issues with npm.

Copy the zip into your WSL home directory and unzip it:

```bash
# Replace "Hristos" with your Windows username if different
cp /mnt/c/Users/Hristos/Downloads/foresight.zip ~/foresight.zip
cd ~
unzip foresight.zip
cd foresight
```

You should now see the project files when you run `ls`.

---

## 2 · Install Node.js 20+ (if you don't have it)

DFlow's reference implementation uses Node 20+, and Next.js 14 requires at least Node 18.17. Check your version:

```bash
node --version
```

If it prints anything below `v20`, install Node Version Manager and grab Node 20:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Reload your shell so nvm is on PATH
source ~/.bashrc

# Install and activate Node 20
nvm install 20
nvm use 20
node --version   # should print v20.x
```

---

## 3 · Install the project dependencies

From inside the `~/foresight` directory:

```bash
npm install
```

This will take a minute or two. You may see a few warnings about peer dependencies — those are normal. If you see an actual error, paste it back to me.

---

## 4 · Get a QuickNode RPC endpoint (2 minutes)

QuickNode is one of the four bounty sponsors, so using their RPC serves double duty. The Kamino SDK makes dozens of parallel account reads during `loadReserves()` — the public `api.mainnet-beta.solana.com` will rate-limit you in under a minute. QuickNode's free tier handles it fine.

1. Go to **https://www.quicknode.com/signup**
2. Create an account. No credit card needed for the free tier.
3. On the dashboard, click **"Create an endpoint"**.
4. Choose network: **Solana**. Choose subnet: **Mainnet**.
5. Pick the free plan. Click **Create**.
6. On the endpoint page, copy the **HTTP Provider URL**. It looks like:
   `https://red-cold-silence.solana-mainnet.quiknode.pro/abc123.../`

That's your RPC URL.

---

## 5 · Configure `.env.local`

Still in `~/foresight`:

```bash
cp .env.example .env.local
nano .env.local
```

Edit just this one line (leave everything else alone — DFlow dev endpoints are key-less):

```
NEXT_PUBLIC_SOLANA_RPC_URL="PASTE_YOUR_QUICKNODE_URL_HERE"
```

Paste your QuickNode URL between the quotes. Save with **Ctrl+O**, **Enter**, then **Ctrl+X** to exit nano.

---

## 6 · Run the dev server

```bash
npm run dev
```

You should see something like:

```
▲ Next.js 14.2.15
- Local:        http://localhost:3000
✓ Ready in 3.2s
```

Open **http://localhost:3000** in your Windows browser. It works even though the server is in WSL — Windows forwards localhost automatically.

Things to check:

- The landing page loads with the "plasma on ink" dark design
- The hero shows a live Kamino APY percentage (not `0.0%`)
- "Trending now" section shows 6 market cards
- Clicking **"Open the terminal"** takes you to `/markets` which loads a 4×6 grid of markets
- Clicking any market opens the deposit flow page with Yes/No pricing

If the Kamino APY stays at 6.4% (the fallback) and never updates with a live number, your RPC URL isn't right — double-check `.env.local`.

---

## 7 · Test the full flow on mainnet

**Important context:** DFlow prediction markets run on Solana mainnet-beta only. The "dev" tier just means the API is key-less — the blockchain side is real. Real USDC, real transactions, real gas fees.

### 7.1 · Set up a dedicated test wallet

Do **not** use your main wallet. Create a brand-new one:

- Open a **fresh browser profile** (Chrome / Brave / Firefox) — important, because wallet installations share their seed phrase across all accounts
- Install **Solflare** (https://solflare.com) — the bounty sponsor wallet
- Create a new wallet, save the seed phrase somewhere safe
- Copy your wallet address

### 7.2 · Fund the wallet

You need two assets:

- **~0.01 SOL** for transaction fees
- **$1–$5 in USDC** for the test deposit

Easiest way: buy a tiny amount of SOL on Coinbase / Binance / Kraken, send it to your new wallet address, then swap half of it for USDC on Jupiter (https://jup.ag).

If you just want to prove the flow works without real money: stop at Step 6. The UI, Kamino APY, market discovery, and wallet connection all work without funds. You just can't click the final "Open position" button.

### 7.3 · KYC verification (required by law)

Kalshi is CFTC-regulated. DFlow enforces this by requiring wallet-level KYC through their Proof provider:

1. Go to **https://dflow.net/proof**
2. Connect the same wallet you're about to trade with
3. Complete the identity verification (ID + selfie)
4. Wait for approval (usually a few minutes)

Unverified wallets will see `/order` requests fail. This is not optional — it's a regulatory requirement for accessing Kalshi liquidity.

### 7.4 · Run the deposit

With your wallet funded and verified:

1. On the Foresight landing page, click **"Connect Wallet"** (top right)
2. Select Solflare, approve the connection
3. Go to `/markets`, pick a market with low close time (e.g. a game happening soon)
4. Enter `1` in the deposit field (1 USDC)
5. Leave the allocation slider at 50/50
6. Click **Open position**
7. Approve the first transaction in Solflare (DFlow order)
8. Wait ~5 seconds for CLP fill
9. Approve the second transaction (Kamino deposit)
10. You should see a green "Position opened" toast

Check your wallet — you should see new Yes or No SPL tokens, plus a reduced USDC balance. Open the Solana Explorer with your two signatures to confirm everything landed on-chain.

---

## 8 · Publish

### 8.1 · Push to GitHub

```bash
# Initialize if you haven't already
cd ~/foresight
git init
git add .
git commit -m "Initial commit — Foresight for Solana Frontier Hackathon"

# Create a new repo on github.com (public, no README), then:
git remote add origin https://github.com/YOUR_USERNAME/foresight.git
git branch -M main
git push -u origin main
```

If GitHub asks for authentication, use a Personal Access Token (Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new).

### 8.2 · Deploy to Vercel

Vercel auto-detects Next.js apps and deploys in 2 minutes:

1. Go to **https://vercel.com** and sign in with your GitHub account
2. Click **"Add New → Project"**
3. Import your `foresight` repo
4. On the setup screen, **expand "Environment Variables"** and add:
   - `NEXT_PUBLIC_SOLANA_RPC_URL` → your QuickNode URL
   - `DFLOW_METADATA_BASE` → `https://dev-prediction-markets-api.dflow.net`
   - `NEXT_PUBLIC_DFLOW_TRADE_BASE` → `https://dev-quote-api.dflow.net`
   - `NEXT_PUBLIC_KAMINO_MAIN_MARKET` → `7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF`
5. Click **Deploy**
6. Wait ~90 seconds for the build to complete
7. Copy your production URL (looks like `foresight-xxx.vercel.app`)

### 8.3 · Record the demo video

The demo script is in `pitch/demo-script.md`. Target: 90 seconds. Tools:

- **OBS Studio** (free): https://obsproject.com — records screen + audio. Set "Display Capture" to your browser window, enable mic audio.
- **Cut audio separately** — record voiceover with any mic app after the screen recording, then layer together in DaVinci Resolve (free) or Shotcut.

Upload to YouTube (unlisted works fine) or Loom.

### 8.4 · Submit to Superteam Earn

Go to the bounty listing: https://superteam.fun/earn/listing/build-a-live-dapp-with-solflare-kamino-dflow-or-quicknode-with-eitherway-app

Click **"Submit Now"**. You'll need:

- Project name: `Foresight`
- Project description: pull from `README.md` top section
- Live URL: your Vercel deployment
- GitHub URL: your repo
- Demo video URL: YouTube/Loom link
- Pitch deck: upload `foresight-deck.pptx`

Submit.

---

## Troubleshooting

### `npm install` fails with `ENOTFOUND`
Your WSL might not have network. Try: `sudo apt update && sudo apt install -y ca-certificates`.

### Port 3000 already in use
Something else is using it. Either kill that process (`lsof -i :3000` to find out what), or run Next on a different port: `npm run dev -- -p 3001`.

### Kamino calls fail in the browser console
Your RPC URL is wrong, rate-limited, or the Kamino SDK can't find the USDC reserve. Try:
- Refresh `NEXT_PUBLIC_SOLANA_RPC_URL` with your QuickNode endpoint
- Restart dev server (`Ctrl+C`, then `npm run dev` again) — env changes need a restart

### DFlow `/order` returns 400 or 403
Either:
- Your wallet isn't KYC-verified — complete https://dflow.net/proof
- You're hitting a rate limit on the dev tier — wait 30s and retry, or request an API key from DFlow

### Solflare not detected
Open the Solflare extension, unlock it, and refresh the page. Next.js's wallet-adapter discovers wallets via the Wallet Standard on page load.

### TypeScript errors during `npm run dev`
The code uses `(mod as any)` casts in the Kamino client specifically because the SDK's TypeScript types lag the runtime behavior. If you're seeing errors elsewhere, paste the output.

---

## What to send me if something breaks

If you get stuck at any step, paste the **full error output**, not just the summary line. The actionable part is usually in the stack trace, not the top-level message.
