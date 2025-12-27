/**
 * impulsar Stellar SDK - Horizon Module (Browser-Safe)
 *
 * Read-only operations using Stellar Horizon REST API.
 * Safe for browser environments (no signing, no secret keys).
 *
 * Use this module in:
 * - Frontend (apps/web)
 * - Backend read operations
 *
 * DO NOT USE THIS FOR:
 * - Transaction signing
 * - Writing to blockchain
 * - Operations requiring secret keys
 *
 * For write operations, use @impulsar/stellar-sdk/soroban
 */

export const placeholder = 'Horizon read operations coming soon';

/**
 * Future exports:
 * - getAccountBalance(publicKey: string): Promise<Balance>
 * - getAccountTransactions(publicKey: string): Promise<Transaction[]>
 * - streamPayments(publicKey: string, onPayment: (payment: Payment) => void)
 */