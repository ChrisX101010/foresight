'use client';

// ────────────────────────────────────────────────────────────────────────
// useVault — the orchestration hook.
// Combines DFlow outcome-token mint + Kamino USDC deposit into one flow.
// ────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';
import { toast } from 'sonner';

import {
  requestBuyOrder,
  getOrderStatus,
  DflowError,
} from '@/lib/dflow';
import { createKaminoClient, FALLBACK_YIELD } from '@/lib/kamino';
import {
  DEFAULT_SLIPPAGE_BPS,
  PRIORITY_FEE_MICROLAMPORTS,
} from '@/lib/constants';
import type {
  PredictionMarket,
  PositionSide,
  YieldBreakdown,
} from '@/types';

export interface DepositParams {
  market: PredictionMarket;
  side: PositionSide;
  predictionBudgetUsd: number;
  yieldBudgetUsd: number;
}

export interface DepositResult {
  predictionSig: string;
  yieldSig: string | null;
  outcomeTokens: number;
  yieldDeposited: number;
}

export interface VaultState {
  isDepositing: boolean;
  currentStep:
    | 'idle'
    | 'requesting-order'
    | 'signing-predict'
    | 'confirming-predict'
    | 'waiting-fill'
    | 'signing-yield'
    | 'confirming-yield'
    | 'done'
    | 'error';
  error: string | null;
  yieldInfo: YieldBreakdown;
}

const STEPS = {
  idle: 'Ready',
  'requesting-order': 'Requesting DFlow order…',
  'signing-predict': 'Awaiting signature for prediction leg…',
  'confirming-predict': 'Confirming outcome mint on Solana…',
  'waiting-fill': 'Waiting for DFlow CLP fill…',
  'signing-yield': 'Awaiting signature for yield leg…',
  'confirming-yield': 'Depositing idle capital to Kamino…',
  done: 'Position opened',
  error: 'Failed',
} as const;

export function stepLabel(step: VaultState['currentStep']) {
  return STEPS[step];
}

export function useVault() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [state, setState] = useState<VaultState>({
    isDepositing: false,
    currentStep: 'idle',
    error: null,
    yieldInfo: FALLBACK_YIELD,
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const refresh = async () => {
      try {
        const client = await createKaminoClient(connection);
        const y = await client.getUsdcYield();
        if (!cancelled) setState((s) => ({ ...s, yieldInfo: y }));
      } catch (err) {
        console.warn('[vault] yield refresh failed', err);
      }
    };

    refresh();
    timer = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [connection]);

  const deposit = useCallback(
    async (params: DepositParams): Promise<DepositResult | null> => {
      if (!publicKey || !signTransaction) {
        toast.error('Connect a wallet first');
        return null;
      }
      if (params.predictionBudgetUsd <= 0) {
        toast.error('Prediction budget must be > 0');
        return null;
      }

      setState((s) => ({
        ...s,
        isDepositing: true,
        error: null,
        currentStep: 'requesting-order',
      }));

      try {
        const outcomeMint =
          params.side === 'yes' ? params.market.yesMint : params.market.noMint;

        const order = await requestBuyOrder({
          outcomeMint,
          amountUsdc: params.predictionBudgetUsd,
          userPublicKey: publicKey.toBase58(),
          slippageBps: DEFAULT_SLIPPAGE_BPS,
          priorityFeeLamports: Math.floor(PRIORITY_FEE_MICROLAMPORTS / 1000),
        });

        setState((s) => ({ ...s, currentStep: 'signing-predict' }));

        const orderTx = VersionedTransaction.deserialize(
          Uint8Array.from(Buffer.from(order.transaction, 'base64'))
        );
        const signedOrder = await signTransaction(orderTx);
        const predictionSig = await connection.sendRawTransaction(
          signedOrder.serialize(),
          { skipPreflight: false, maxRetries: 3 }
        );

        setState((s) => ({ ...s, currentStep: 'confirming-predict' }));
        await connection.confirmTransaction(predictionSig, 'confirmed');

        let outcomeTokens = 0;
        if (order.executionMode === 'async') {
          setState((s) => ({ ...s, currentStep: 'waiting-fill' }));
          for (let i = 0; i < 30; i++) {
            const status = await getOrderStatus(
              predictionSig,
              order.lastValidBlockHeight
            );
            if (status.status === 'closed') {
              outcomeTokens = status.outAmount / 1_000_000;
              break;
            }
            if (['expired', 'failed'].includes(status.status)) {
              throw new Error(`DFlow order ${status.status}`);
            }
            await new Promise((r) => setTimeout(r, 2_000));
          }
        } else {
          outcomeTokens = Number(order.outAmount) / 1_000_000;
        }

        let yieldSig: string | null = null;
        let yieldDeposited = 0;

        if (params.yieldBudgetUsd > 0) {
          setState((s) => ({ ...s, currentStep: 'signing-yield' }));
          const kamino = await createKaminoClient(connection);
          const ixs = await kamino.buildDepositIxs(publicKey, params.yieldBudgetUsd);

          const { blockhash } = await connection.getLatestBlockhash();
          const msg = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: ixs,
          }).compileToV0Message();
          const yieldTx = new VersionedTransaction(msg);
          const signedYield = await signTransaction(yieldTx);

          yieldSig = await connection.sendRawTransaction(
            signedYield.serialize(),
            { skipPreflight: false, maxRetries: 3 }
          );
          setState((s) => ({ ...s, currentStep: 'confirming-yield' }));
          await connection.confirmTransaction(yieldSig, 'confirmed');
          yieldDeposited = params.yieldBudgetUsd;
        }

        setState((s) => ({
          ...s,
          isDepositing: false,
          currentStep: 'done',
        }));
        toast.success('Position opened — earning while you wait.');

        return { predictionSig, yieldSig, outcomeTokens, yieldDeposited };
      } catch (err) {
        const isKycError = err instanceof DflowError && err.requiresKyc;
        const msg = err instanceof Error ? err.message : String(err);

        setState((s) => ({
          ...s,
          isDepositing: false,
          currentStep: 'error',
          error: msg,
        }));

        if (isKycError) {
          toast.error('Kalshi KYC required for this wallet', {
            description: 'Verify once at dflow.net/proof — takes a few minutes.',
            action: {
              label: 'Verify now',
              onClick: () => window.open('https://dflow.net/proof', '_blank'),
            },
            duration: 10000,
          });
        } else {
          toast.error(msg);
        }
        return null;
      }
    },
    [connection, publicKey, signTransaction]
  );

  return { state, deposit };
}
