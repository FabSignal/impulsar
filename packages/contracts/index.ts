/**
 * impulsar Contracts - Pure TypeScript Interfaces
 *
 * **ZERO RUNTIME CODE** - This package contains ONLY TypeScript type definitions.
 *
 * Business domain types shared between frontend and backend.
 * These define the "contract" (shape) of data across API boundaries.
 *
 * KEY PRINCIPLES:
 * - These are NOT database types (those live in @impulsar/database)
 * - These are NOT serialization logic (that lives in @impulsar/dtos)
 * - These are NOT business utilities (those live in @impulsar/core)
 *
 * IMPORTANT: All timestamps use ISO 8601 strings (not Date objects)
 * for JSON serialization compatibility across API boundaries.
 *
 * PRODUCTION RULE: If you need to import a value (not just a type), you're in the wrong package.
 * Use @impulsar/dtos for serialization or @impulsar/core for utilities.
 */

// ============================================================================
// Core Business Domain Types (API Contracts)
// ============================================================================

/**
 * Transfer entity (API contract)
 * All timestamps are ISO 8601 strings for JSON compatibility.
 */
export interface Transfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  amountPuls: number;
  amountArs: number;
  nav: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;  // ISO 8601: "2026-01-15T10:30:00.000Z"
  completedAt?: string;  // ISO 8601: "2026-01-15T10:35:00.000Z"
}

/**
 * Wallet entity (API contract)
 */
export interface Wallet {
  stellarPublicKey: string;
  balancePuls: number;
  balanceArs: number; // Calculated from balancePuls * NAV
  lastSyncedAt: string;  // ISO 8601
}

/**
 * User entity (API contract)
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  walletAddress?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;  // ISO 8601
}

/**
 * Attestation document (NAV certification)
 */
export interface AttestationDocument {
  period: string; // "2026-01"
  navPrevious: number;
  navNew: number;
  yieldPercentage: number;
  totalAum: number;
  reportHash: string;
  signatures: {
    custodian: string;
    auditor: string;
  };
  attestedAt: string;  // ISO 8601
}

// ============================================================================
// API Request/Response DTOs
// ============================================================================

export interface CreateTransferRequest {
  recipientId: string;
  amountPuls: number;
}

export interface CreateTransferResponse {
  transfer: Transfer;
  transactionHash: string;
}