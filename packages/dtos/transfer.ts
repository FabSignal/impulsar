/**
 * Transfer DTO converters (API ↔ Runtime)
 *
 * Handles serialization/deserialization between:
 * - API format: Transfer interface with ISO 8601 strings
 * - Runtime format: TransferRuntime with Date objects
 */
import type { Transfer } from '@impulsar/contracts';

/**
 * Transfer with Date objects (for internal runtime use)
 * Use this when working with dates in memory (calculations, comparisons, etc.)
 */
export interface TransferRuntime {
  id: string;
  fromUserId: string;
  toUserId: string;
  amountPuls: number;
  amountArs: number;
  nav: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Converts a Transfer DTO (API) to runtime format with Date objects.
 *
 * @example
 * // Frontend - deserialize API response:
 * const transferDto: Transfer = await fetch('/api/transfers/123').then(r => r.json());
 * const transfer = deserializeTransfer(transferDto);
 *
 * // Now you can work with Date objects:
 * if (transfer.createdAt < new Date('2026-01-01')) { ... }
 */
export const deserializeTransfer = (dto: Transfer): TransferRuntime => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
});

/**
 * Converts a TransferRuntime to Transfer DTO (API) with ISO strings.
 *
 * @example
 * // Backend - serialize before sending:
 * const transfer: TransferRuntime = {
 *   id: '123',
 *   fromUserId: 'user1',
 *   toUserId: 'user2',
 *   amountPuls: 100,
 *   amountArs: 10000,
 *   nav: 100,
 *   status: 'completed',
 *   createdAt: new Date(),
 *   completedAt: new Date(),
 * };
 *
 * res.json(serializeTransfer(transfer));
 */
export const serializeTransfer = (runtime: TransferRuntime): Transfer => ({
  ...runtime,
  createdAt: runtime.createdAt.toISOString(),
  completedAt: runtime.completedAt ? runtime.completedAt.toISOString() : undefined,
});