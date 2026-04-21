'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { Zap } from 'lucide-react';
import { SolanaProvider } from './SolanaProvider';
import { shortAddr } from '@/lib/utils';

// Stable id so repeated connect/disconnect events replace the same toast
// slot instead of stacking new ones on top.
const TOAST_ID_WALLET = 'wallet-status';

function WalletStatusWatcher() {
  const { connected, publicKey, wallet } = useWallet();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = publicKey?.toBase58() ?? null;

    if (connected && key && key !== lastKey.current) {
      toast.success(`${wallet?.adapter.name ?? 'Wallet'} connected`, {
        id: TOAST_ID_WALLET,
        description: shortAddr(key, 6),
        icon: <Zap className="w-4 h-4 text-plasma" />,
      });
      lastKey.current = key;
      try {
        sessionStorage.setItem('foresight:wallet-used', '1');
      } catch {
        /* private mode — non-fatal */
      }
      return;
    }

    if (!connected && lastKey.current) {
      toast('Wallet disconnected', {
        id: TOAST_ID_WALLET,
        description: 'You can reconnect anytime.',
      });
      lastKey.current = null;
    }
  }, [connected, publicKey, wallet]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={qc}>
      <SolanaProvider>
        <WalletStatusWatcher />
        {children}
        <Toaster
          position="bottom-right"
          visibleToasts={1}
          toastOptions={{
            style: {
              background: '#10121A',
              border: '1px solid #2A2F45',
              color: '#F4F1EA',
              fontFamily: 'Inter Tight, sans-serif',
            },
          }}
        />
      </SolanaProvider>
    </QueryClientProvider>
  );
}
