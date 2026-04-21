'use client';

// ────────────────────────────────────────────────────────────────────────
// Wallet + connection provider.
//
// Key constraints:
//   1. WalletProvider MUST be mounted during SSR so useWallet() doesn't
//      throw "No provider" errors on the server. Previous implementations
//      that gated the provider behind a client-only `ready` flag broke
//      SSR and produced a cascade of errors on every landing-page request.
//   2. autoConnect must be TRUE after the user has manually connected,
//      otherwise the modal's wallet-selection flow never completes.
//   3. autoConnect must be effectively FALSE on cold landing-page load
//      so we don't pop a wallet prompt at visitors.
//
// Solution: always mount WalletProvider with autoConnect=true, but on
// mount of the landing page with no session flag set, clear the stale
// `walletName` from localStorage. autoConnect with no selected wallet
// is a no-op — the prompt never fires. Once the user connects via the
// modal, Providers.tsx writes the session flag so subsequent navigation
// auto-reconnects within the same tab.
// ────────────────────────────────────────────────────────────────────────

import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { toast } from 'sonner';

import '@solana/wallet-adapter-react-ui/styles.css';

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

const NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) ||
  WalletAdapterNetwork.Mainnet;

const SILENT_ERRORS = new Set([
  'WalletNotReadyError',
  'WalletNotSelectedError',
  'WalletConnectionError',
  'WalletWindowClosedError',
  'WalletWindowBlockedError',
]);

const WALLET_NAME_KEY = 'walletName';
const SESSION_USED_KEY = 'foresight:wallet-used';

/**
 * Client-only hook that clears the stale walletName on cold landing-page
 * load. Runs in a useEffect (post-mount), which is strictly too late to
 * prevent the very first autoConnect attempt — but the attempt happens
 * with `walletName=null` since we cleared it, which is a silent no-op.
 *
 * If the user has connected earlier in this tab session (sessionStorage
 * flag is set), we leave the walletName alone so they stay connected
 * across / → /markets navigation.
 */
function useSuppressLandingAutoConnect() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLanding = window.location.pathname === '/';
    if (!isLanding) return;
    const hasSessionFlag = sessionStorage.getItem(SESSION_USED_KEY) === '1';
    if (hasSessionFlag) return;
    // First mount of landing in this session — nuke stale selection.
    try {
      localStorage.removeItem(WALLET_NAME_KEY);
    } catch {
      /* private mode — non-fatal */
    }
  }, []);
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [new SolflareWalletAdapter({ network: NETWORK })],
    [],
  );

  useSuppressLandingAutoConnect();

  const onError = useCallback((error: WalletError) => {
    if (SILENT_ERRORS.has(error.name)) {
      // eslint-disable-next-line no-console
      console.debug('[wallet] silent:', error.name);
      return;
    }
    // eslint-disable-next-line no-console
    console.warn('[wallet]', error.name, error.message);
    toast.error(error.message || 'Wallet error', { description: error.name });
  }, []);

  return (
    <ConnectionProvider endpoint={RPC_URL} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
