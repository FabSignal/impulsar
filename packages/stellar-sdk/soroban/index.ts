/**
 * impulsar Stellar SDK - Soroban Module (Backend-Only)
 *
 * Smart contract operations using Stellar Soroban RPC.
 * Includes transaction signing - BACKEND ONLY.
 *
 * Use this module in:
 * - Backend services (services/transfer-service, services/auth-service)
 * - Smart contract deployments
 * - Transaction signing operations
 *
 * ⚠️ CRITICAL: NEVER import this in frontend code
 * ⚠️ This module handles secret keys and transaction signing
 *
 * For read-only operations, use @impulsar/stellar-sdk/horizon
 */

export const placeholder = 'Soroban contract operations coming soon';

/**
 * Future exports:
 * - invokeContract(contractId: string, method: string, params: any[]): Promise<Result>
 * - signTransaction(tx: Transaction, secretKey: string): Promise<SignedTransaction>
 * - deployContract(wasmHash: string, secretKey: string): Promise<ContractId>
 */