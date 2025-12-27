/**
 * impulsar Stellar SDK - Root Package
 *
 * Shared types and utilities for Stellar operations.
 * For actual operations, use explicit entrypoints:
 *
 * - import from '@impulsar/stellar-sdk/horizon' (browser-safe reads)
 * - import from '@impulsar/stellar-sdk/soroban' (backend-only writes)
 *
 * DO NOT import operations from the root package.
 */

// Shared types (safe for both frontend and backend)
export interface StellarNetworkConfig {
  networkPassphrase: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
}

// Placeholder for future shared utilities
export const placeholder = 'Stellar SDK root package';

/**
 * IMPORTANT: Do not add operation functions here.
 * Operations belong in /horizon or /soroban to maintain clear boundaries.
 */