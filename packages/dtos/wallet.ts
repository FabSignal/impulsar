/**
 * Wallet DTO converters (API ↔ Runtime)
 */
import type { Wallet } from '@impulsar/contracts';

/**
 * Wallet with Date objects (internal runtime)
 */
export interface WalletRuntime {
  stellarPublicKey: string;
  balancePuls: number;
  balanceArs: number;
  lastSyncedAt: Date;
}

/**
 * Converts Wallet DTO to runtime format
 */
export const deserializeWallet = (dto: Wallet): WalletRuntime => ({
  ...dto,
  lastSyncedAt: new Date(dto.lastSyncedAt),
});

/**
 * Converts WalletRuntime to Wallet DTO
 */
export const serializeWallet = (runtime: WalletRuntime): Wallet => ({
  ...runtime,
  lastSyncedAt: runtime.lastSyncedAt.toISOString(),
});