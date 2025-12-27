/**
 * impulsar DTOs - Serialization/Deserialization Layer
 *
 * Handles transformations between API contracts (@impulsar/contracts) and runtime types.
 *
 * KEY PRINCIPLE:
 * - API contracts use ISO 8601 strings (JSON-safe)
 * - Runtime types use Date objects (easier to work with in code)
 * - This package bridges the gap
 */

// DTO converters
export {
  type TransferRuntime,
  deserializeTransfer,
  serializeTransfer,
} from './transfer';

export {
  type WalletRuntime,
  deserializeWallet,
  serializeWallet,
} from './wallet';

export {
  type UserRuntime,
  deserializeUser,
  serializeUser,
} from './user';

export {
  type AttestationDocumentRuntime,
  deserializeAttestation,
  serializeAttestation,
} from './attestation';