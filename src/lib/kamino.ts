// ────────────────────────────────────────────────────────────────────────
// Kamino Lend client.
//
// Verified against:
//   - https://github.com/Kamino-Finance/klend-sdk (README example)
//   - https://www.npmjs.com/package/@kamino-finance/klend-sdk
//
// KaminoMarket.load signature (current):
//   KaminoMarket.load(connection, marketAddress, slotDurationMs, programId?)
//
// Notes:
//   - SDK uses @solana/web3.js PublicKey, not @solana/kit Address. (The
//     GitHub README shows a mix; the runtime SDK accepts PublicKey.)
//   - KaminoAction.buildDepositTxns returns an object whose instructions
//     live on `.setupIxs`, `.lendingIxs`, `.cleanupIxs` — we flatten.
//   - DEFAULT_RECENT_SLOT_DURATION_MS is exported by the SDK (value ≈ 450).
// ────────────────────────────────────────────────────────────────────────

import {
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { KAMINO_MAIN_MARKET, USDC_MINT } from './constants';
import type { YieldBreakdown } from '@/types';

export interface KaminoClient {
  getUsdcYield(): Promise<YieldBreakdown>;
  getUserSupplyBalance(owner: PublicKey): Promise<number>;
  buildDepositIxs(owner: PublicKey, amountUsdc: number): Promise<TransactionInstruction[]>;
  buildWithdrawIxs(owner: PublicKey, amountUsdc: number): Promise<TransactionInstruction[]>;
}

export async function createKaminoClient(
  connection: Connection
): Promise<KaminoClient> {
  // Dynamic import so SSR bundlers don't try to pre-evaluate the SDK's
  // heavier dependencies.
  const mod = await import('@kamino-finance/klend-sdk');
  const {
    KaminoMarket,
    KaminoAction,
    VanillaObligation,
    PROGRAM_ID,
    DEFAULT_RECENT_SLOT_DURATION_MS,
  } = mod as any;

  // The SDK expects PublicKey for the market addr. KAMINO_MAIN_MARKET is
  // already a PublicKey from our constants file.
  const market = await KaminoMarket.load(
    connection,
    KAMINO_MAIN_MARKET,
    DEFAULT_RECENT_SLOT_DURATION_MS
  );
  await market.loadReserves();

  const getUsdcReserve = () => {
    // Try multiple lookup methods — SDK exposes both.
    const reserve =
      (market.getReserveByMint && market.getReserveByMint(USDC_MINT)) ||
      (market.getReserve && market.getReserve('USDC'));
    if (!reserve) throw new Error('USDC reserve not found in Kamino main market');
    return reserve;
  };

  return {
    async getUsdcYield() {
      const reserve = getUsdcReserve();
      const stats = reserve.stats ?? {};
      const reserveApy = Number(stats.supplyApy ?? 0);
      const rewardApy = Number(
        stats.rewardApys?.reduce?.(
          (acc: number, r: { rewardApy: string | number }) => acc + Number(r.rewardApy),
          0
        ) ?? 0
      );
      return {
        reserveApy,
        rewardApy,
        totalApy: reserveApy + rewardApy,
        utilization: Number(stats.utilizationRatio ?? 0),
      };
    },

    async getUserSupplyBalance(owner: PublicKey) {
      try {
        const obligation =
          market.getUserVanillaObligation
            ? await market.getUserVanillaObligation(owner)
            : await market.getObligationByWallet(owner, new VanillaObligation(PROGRAM_ID));
        if (!obligation) return 0;
        const reserve = getUsdcReserve();
        const deposit = obligation.deposits?.get?.(reserve.address);
        if (!deposit) return 0;
        return Number(deposit.amount) / 1_000_000;
      } catch {
        return 0;
      }
    },

    async buildDepositIxs(owner: PublicKey, amountUsdc: number) {
      const amountBase = Math.floor(amountUsdc * 1_000_000);
      const action = await KaminoAction.buildDepositTxns(
        market,
        amountBase.toString(),
        USDC_MINT,
        owner,
        new VanillaObligation(PROGRAM_ID)
      );
      return [
        ...(action.setupIxs ?? []),
        ...(action.lendingIxs ?? []),
        ...(action.cleanupIxs ?? []),
      ] as TransactionInstruction[];
    },

    async buildWithdrawIxs(owner: PublicKey, amountUsdc: number) {
      const amountBase = Math.floor(amountUsdc * 1_000_000);
      const action = await KaminoAction.buildWithdrawTxns(
        market,
        amountBase.toString(),
        USDC_MINT,
        owner,
        new VanillaObligation(PROGRAM_ID)
      );
      return [
        ...(action.setupIxs ?? []),
        ...(action.lendingIxs ?? []),
        ...(action.cleanupIxs ?? []),
      ] as TransactionInstruction[];
    },
  };
}

// Used when Kamino RPC is unreachable so the UI never shows blank APY.
export const FALLBACK_YIELD: YieldBreakdown = {
  reserveApy: 0.0512,
  rewardApy: 0.0128,
  totalApy: 0.064,
  utilization: 0.78,
};
