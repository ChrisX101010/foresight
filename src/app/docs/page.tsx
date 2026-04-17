'use client';

import { Nav } from '@/components/Nav';
import { ExternalLink, GitBranch, Zap, Coins, Wallet, Server } from 'lucide-react';

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="mono text-xs text-fog uppercase tracking-wider mb-3">Technical overview</p>
        <h1 className="display text-5xl md:text-6xl text-chalk mb-4">
          How <span className="italic text-plasma">Foresight</span> is built.
        </h1>
        <p className="text-lg text-fog mb-12 max-w-2xl">
          The whole app is one Next.js project, one Solana connection, and two
          SDKs stitched together by a single hook. Everything below is the real
          shape of the code in this repo.
        </p>

        <section className="mb-12">
          <h2 className="display text-3xl text-chalk mb-4">The flow</h2>
          <ol className="space-y-3 text-fog">
            <li className="flex gap-3"><Step n="01" /><span>User picks a Kalshi market from the browser (data from DFlow Metadata API).</span></li>
            <li className="flex gap-3"><Step n="02" /><span>User sets a total USDC deposit and slides the prediction-vs-yield allocation.</span></li>
            <li className="flex gap-3"><Step n="03" /><span><code className="text-plasma">useVault.deposit</code> calls <code className="text-chalk">DFlow /quote</code>, then <code className="text-chalk">/order</code> to get a signed transaction.</span></li>
            <li className="flex gap-3"><Step n="04" /><span>Wallet (Solflare, Phantom, etc.) signs and sends — outcome SPL tokens mint via DFlow's CLP.</span></li>
            <li className="flex gap-3"><Step n="05" /><span>Second transaction builds Kamino <code className="text-chalk">buildDepositTxns</code> for the remaining USDC. User signs, yield begins.</span></li>
            <li className="flex gap-3"><Step n="06" /><span>At resolution, user redeems winning outcome tokens for USDC and withdraws their yielded Kamino balance.</span></li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="display text-3xl text-chalk mb-4">Stack by sponsor</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Block
              icon={GitBranch}
              name="DFlow"
              body="Prediction Market Metadata API (via /api/dflow server proxy) for market discovery + pricing. Trade API /quote + /order for building outcome-token mint transactions."
              files={['src/lib/dflow.ts', 'src/app/api/dflow/[...path]/route.ts']}
              link="https://pond.dflow.net"
            />
            <Block
              icon={Coins}
              name="Kamino"
              body="@kamino-finance/klend-sdk — KaminoMarket.load + KaminoAction.buildDepositTxns / buildWithdrawTxns. USDC main market for the yield leg."
              files={['src/lib/kamino.ts']}
              link="https://docs.kamino.finance/build-on-kamino/sdk-and-smart-contracts"
            />
            <Block
              icon={Wallet}
              name="Solflare"
              body="@solana/wallet-adapter-wallets SolflareWalletAdapter is registered as a first-class wallet; adapter standard discovers Phantom/Backpack/OKX as well."
              files={['src/components/SolanaProvider.tsx']}
              link="https://www.quicknode.com/builders-guide/tools/solflare-wallet-sdk-by-solflare"
            />
            <Block
              icon={Server}
              name="QuickNode"
              body="Recommended RPC endpoint for mainnet reads (Kamino SDK issues many parallel account reads). Swap NEXT_PUBLIC_SOLANA_RPC_URL in .env.local."
              files={['.env.example', 'next.config.js']}
              link="https://www.quicknode.com/endpoints"
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="display text-3xl text-chalk mb-4">Built with Eitherway</h2>
          <p className="text-fog leading-relaxed mb-4">
            The initial scaffold — file tree, Tailwind tokens, wallet provider,
            the DFlow/Kamino client modules — was generated from a single
            Eitherway prompt, then refined into the shape you're reading now.
            The prompt and the exported project are in{' '}
            <code className="text-plasma">/pitch/eitherway-prompt.md</code>.
          </p>
          <p className="text-fog leading-relaxed">
            This mirrors Eitherway's core value: natural-language → production
            Solana app. The bounty asks for <em>any</em> live dApp using one of
            four sponsors — Foresight uses two, plus Solflare for wallet and
            QuickNode for RPC.
          </p>
        </section>

        <section>
          <h2 className="display text-3xl text-chalk mb-4">Roadmap</h2>
          <ul className="space-y-2 text-fog">
            <li className="flex gap-2"><Zap className="w-4 h-4 text-plasma mt-1 flex-shrink-0" /><span><strong className="text-chalk">v1.1</strong> — Jito bundle so prediction + yield legs land atomically in the same block.</span></li>
            <li className="flex gap-2"><Zap className="w-4 h-4 text-plasma mt-1 flex-shrink-0" /><span><strong className="text-chalk">v1.2</strong> — Use outcome tokens as Kamino collateral (borrow USDC against a position, scale up).</span></li>
            <li className="flex gap-2"><Zap className="w-4 h-4 text-plasma mt-1 flex-shrink-0" /><span><strong className="text-chalk">v2</strong> — Basket vaults: "earn 6% while exposed to all 2026 Fed meeting markets."</span></li>
            <li className="flex gap-2"><Zap className="w-4 h-4 text-plasma mt-1 flex-shrink-0" /><span><strong className="text-chalk">v3</strong> — Automated hedged strategies (delta-neutral prediction LP).</span></li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function Step({ n }: { n: string }) {
  return (
    <span className="mono text-xs text-plasma border border-plasma/30 rounded px-2 py-0.5 h-fit flex-shrink-0">
      {n}
    </span>
  );
}

function Block({
  icon: Icon,
  name,
  body,
  files,
  link,
}: {
  icon: typeof GitBranch;
  name: string;
  body: string;
  files: string[];
  link: string;
}) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-5 h-5 text-plasma" strokeWidth={1.5} />
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[10px] text-fog hover:text-plasma uppercase tracking-wider flex items-center gap-1"
        >
          Docs <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <h3 className="display text-xl text-chalk mb-2">{name}</h3>
      <p className="text-sm text-fog mb-3 leading-relaxed">{body}</p>
      <div className="space-y-1">
        {files.map((f) => (
          <div key={f} className="mono text-xs text-plasma/80">
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
