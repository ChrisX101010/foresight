'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { Zap } from 'lucide-react';
import { SolanaProvider } from './SolanaProvider';
import { shortAddr } from '@/lib/utils';

// Runs inside SolanaProvider so useWallet is available. Fires a toast
// on connect/disconnect transitions and surfaces adapter errors.
function WalletStatusWatcher() {
  const { connected, publicKey, wallet, connecting } = useWallet();
  const wasConnected = useRef(false);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = publicKey?.toBase58() ?? null;

    if (connected && key && key !== lastKey.current) {
      toast.success(`${wallet?.adapter.name ?? 'Wallet'} connected`, {
        description: shortAddr(key, 6),
        icon: <Zap className="w-4 h-4 text-plasma" />,
      });
      lastKey.current = key;
      wasConnected.current = true;
    }

    if (!connected && wasConnected.current) {
      toast('Wallet disconnected', { description: 'You can reconnect anytime.' });
      wasConnected.current = false;
      lastKey.current = null;
    }
  }, [connected, publicKey, wallet]);

  useEffect(() => {
    if (!wallet) return;
    const adapter = wallet.adapter;
    const onError = (err: Error) => {
      if (err.name === 'WalletNotReadyError') return;
      toast.error('Wallet error', { description: err.message });
    };
    adapter.on('error', onError);
    return () => {
      adapter.off('error', onError);
    };
  }, [wallet]);

  void connecting;
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      })
  );
  return (
    <QueryClientProvider client={qc}>
      <SolanaProvider>
        <WalletStatusWatcher />
        {children}
        <Toaster
          position="bottom-right"
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
