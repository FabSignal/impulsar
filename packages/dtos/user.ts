/**
 * User DTO converters (API ↔ Runtime)
 */
import type { User } from '@impulsar/contracts';

/**
 * User with Date objects (internal runtime)
 */
export interface UserRuntime {
  id: string;
  email: string;
  fullName: string;
  walletAddress?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

/**
 * Converts User DTO to runtime format
 */
export const deserializeUser = (dto: User): UserRuntime => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
});

/**
 * Converts UserRuntime to User DTO
 */
export const serializeUser = (runtime: UserRuntime): User => ({
  ...runtime,
  createdAt: runtime.createdAt.toISOString(),
});