'use client';

// ────────────────────────────────────────────────────────────────────────
// Wallet + connection provider.
//
// Solflare is a bounty sponsor, so we expose it explicitly AND keep the
// general wallet-adapter so Phantom/Backpack/etc. also work. The WalletAdapter
// UI component adds the standard "Select Wallet" modal.
// ────────────────────────────────────────────────────────────────────────

import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  SolflareWalletAdapter,
  // Other adapters auto-detect the wallet-standard; we only explicitly
  // import Solflare because it's a named sponsor of this bounty.
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import '@solana/wallet-adapter-react-ui/styles.css';

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

const NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) ||
  WalletAdapterNetwork.Mainnet;

export function SolanaProvider({ children }: { children: ReactNode }) {
  // Only Solflare is hard-registered; everything else is picked up via
  // the Wallet Standard (Phantom, Backpack, OKX, Glow…).
  const wallets = useMemo(() => [new SolflareWalletAdapter({ network: NETWORK })], []);

  return (
    <ConnectionProvider endpoint={RPC_URL} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
