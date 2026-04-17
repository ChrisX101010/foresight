'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SolanaProvider } from './SolanaProvider';

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
