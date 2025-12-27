/**
 * impulsar Configuration Package
 *
 * PRODUCTION-ALIGNED: Separate browser and server environment validation.
 *
 * CRITICAL ARCHITECTURE DECISION:
 * - BrowserEnv and ServerEnv are COMPLETELY SEPARATE (no inheritance)
 * - Browser uses NEXT_PUBLIC_* variables (exposed to client)
 * - Server uses direct env vars (never exposed to client)
 * - This prevents "NEXT_PUBLIC_* required in backend" bugs
 */

import { z } from 'zod';

// ============================================================================
// Browser Environment (Frontend Only - NEXT_PUBLIC_* variables)
// ============================================================================

/**
 * Browser-safe environment variables (exposed to client bundle)
 * Only NEXT_PUBLIC_* variables are available in the browser
 */
export const BrowserEnvSchema = z.object({
  // Supabase (public keys only)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Stellar Network (public endpoints)
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: z.string().default('Test SDF Network ; September 2015'),
  NEXT_PUBLIC_STELLAR_HORIZON_URL: z.string().url().default('https://horizon-testnet.stellar.org'),
  NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL: z.string().url().default('https://soroban-testnet.stellar.org'),

  // API Base URL (for frontend to call backend)
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type BrowserEnv = z.infer<typeof BrowserEnvSchema>;

// ============================================================================
// Server Environment (Backend Only - Service-Specific Schemas)
// ============================================================================

/**
 * SECURITY PRINCIPLE: Least Privilege
 *
 * Each microservice validates ONLY the secrets it needs:
 * - Transfer service: needs Stellar keys, NOT JWT secrets
 * - Auth service: needs JWT secrets, NOT Stellar keys
 *
 * This prevents:
 * 1. Security risk: auth-service having blockchain signing keys (unnecessary attack surface)
 * 2. Operational friction: forcing all services to have all secrets
 * 3. Debugging pain: unclear which service needs which secret
 */

/**
 * Common base schema for all backend services
 * Contains shared infrastructure secrets
 */
const BaseServerEnvSchema = z.object({
  // Supabase (all backend services need database access)
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Stellar Network Configuration (all services may query blockchain)
  STELLAR_NETWORK_PASSPHRASE: z.string().default('Test SDF Network ; September 2015'),
  STELLAR_HORIZON_URL: z.string().url().default('https://horizon-testnet.stellar.org'),
  STELLAR_SOROBAN_RPC_URL: z.string().url().default('https://soroban-testnet.stellar.org'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Transfer Service Environment Schema
 *
 * Requires:
 * - Stellar operational secret key (signs blockchain transactions)
 * - Transfer service port
 *
 * Does NOT require:
 * - JWT secrets (auth is handled by auth-service)
 */
export const TransferServiceEnvSchema = BaseServerEnvSchema.extend({
  // CRITICAL: Operational wallet secret key (signs CLP transfer transactions)
  // Must start with 'S' (Stellar secret key format), 56 characters
  STELLAR_OPERATIONAL_SECRET_KEY: z
    .string()
    .min(1, 'STELLAR_OPERATIONAL_SECRET_KEY is required')
    .regex(/^S[A-Z2-7]{55}$/, 'STELLAR_OPERATIONAL_SECRET_KEY must be a valid Stellar secret key (starts with S, 56 chars)'),

  // Transfer service port (defaults to 3001)
  TRANSFER_SERVICE_PORT: z
    .string()
    .regex(/^\d+$/, 'TRANSFER_SERVICE_PORT must be a number')
    .transform(Number)
    .default('3001'),
});

export type TransferServiceEnv = z.infer<typeof TransferServiceEnvSchema>;

/**
 * Auth Service Environment Schema
 *
 * Requires:
 * - JWT secrets (signs authentication tokens)
 * - Auth service port
 *
 * Does NOT require:
 * - Stellar operational secret key (no blockchain signing)
 */
export const AuthServiceEnvSchema = BaseServerEnvSchema.extend({
  // JWT signing secret (minimum 32 characters for security)
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // JWT token expiry (Zeit/ms format: "24h", "7d", etc.)
  JWT_EXPIRY: z.string().default('24h'),

  // JWT refresh token expiry (should be longer than JWT_EXPIRY)
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Auth service port (defaults to 3002)
  AUTH_SERVICE_PORT: z
    .string()
    .regex(/^\d+$/, 'AUTH_SERVICE_PORT must be a number')
    .transform(Number)
    .default('3002'),
});

export type AuthServiceEnv = z.infer<typeof AuthServiceEnvSchema>;

// ============================================================================
// Environment Validation (Runtime)
// ============================================================================

/**
 * STRICT VALIDATION FROM DAY 0
 *
 * CRITICAL: Each service calls its own validator FIRST (before initializing routes/middleware)
 *
 * Validation strategy:
 * - Required secrets MUST be provided - missing = service fails to start
 * - Optional values have reasonable defaults (e.g., STELLAR_HORIZON_URL, ports)
 * - Strict regex validation (STELLAR_OPERATIONAL_SECRET_KEY format, JWT_SECRET length)
 * - Same validation in dev and prod (no "relaxed mode" - prevents deployment surprises)
 *
 * Transfer Service Example (services/transfer-service/src/index.ts):
 * ```
 * // CRITICAL: Imports must be at the top in ESM
 * import 'dotenv/config';
 * import express from 'express';
 * import { validateTransferEnv } from '@impulsar/config';
 *
 * // FIRST executable line: Validate env before any setup
 * const env = validateTransferEnv(process.env);
 * // Now env is strongly typed and guaranteed to have:
 * // - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * // - STELLAR_OPERATIONAL_SECRET_KEY (for signing transactions)
 * // - TRANSFER_SERVICE_PORT
 * // Does NOT require JWT_SECRET (auth-service responsibility)
 *
 * const app = express();
 * const PORT = env.TRANSFER_SERVICE_PORT;
 * // ... rest of setup
 * ```
 *
 * Auth Service Example (services/auth-service/src/index.ts):
 * ```
 * import 'dotenv/config';
 * import express from 'express';
 * import { validateAuthEnv } from '@impulsar/config';
 *
 * const env = validateAuthEnv(process.env);
 * // Now env is strongly typed and guaranteed to have:
 * // - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * // - JWT_SECRET, JWT_EXPIRY, JWT_REFRESH_EXPIRY
 * // - AUTH_SERVICE_PORT
 * // Does NOT require STELLAR_OPERATIONAL_SECRET_KEY (transfer-service responsibility)
 *
 * const app = express();
 * const PORT = env.AUTH_SERVICE_PORT;
 * // ... rest of setup
 * ```
 *
 * Frontend (apps/web/app/layout.tsx or middleware):
 * ```
 * import { validateBrowserEnv } from '@impulsar/config';
 * const env = validateBrowserEnv(process.env);
 * ```
 *
 * This ensures you NEVER deploy to production with missing secrets,
 * and each service only validates what it actually needs (least privilege).
 */
export const validateBrowserEnv = (env: Record<string, string | undefined>): BrowserEnv => {
  return BrowserEnvSchema.parse(env);
};

export const validateTransferEnv = (env: Record<string, string | undefined>): TransferServiceEnv => {
  return TransferServiceEnvSchema.parse(env);
};

export const validateAuthEnv = (env: Record<string, string | undefined>): AuthServiceEnv => {
  return AuthServiceEnvSchema.parse(env);
};

// ============================================================================
// API Endpoint Builders (Production-Safe)
// ============================================================================

/**
 * PRODUCTION-ALIGNED: Build API URLs at runtime (not module load time)
 *
 * DO NOT use a global API_BASE_URL constant (evaluated at import time)
 * Instead, build URLs when needed using validated env
 */

/**
 * Get API base URL from validated environment
 * Call this when you need the URL, not at module import time
 */
export const getApiBaseUrl = (browserEnv: BrowserEnv): string => {
  return browserEnv.NEXT_PUBLIC_API_URL;
};

/**
 * Build API endpoint URLs
 * Usage:
 * ```
 * const env = validateBrowserEnv(process.env);
 * const endpoints = buildApiEndpoints(env);
 * fetch(endpoints.transfers.list);
 * ```
 */
export const buildApiEndpoints = (browserEnv: BrowserEnv) => {
  const base = getApiBaseUrl(browserEnv);

  return {
    transfers: {
      list: `${base}/api/transfers`,
      create: `${base}/api/transfers`,
      details: (id: string) => `${base}/api/transfers/${id}`,
    },
    wallets: {
      details: `${base}/api/wallet`,
      balance: `${base}/api/wallet/balance`,
    },
    nav: {
      current: `${base}/api/nav/current`,
      history: `${base}/api/nav/history`,
    },
  } as const;
};

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  enableTransfers: true,
  enableNavUpdates: true,
  enableAdminPanel: false, // Future feature
  maintenanceMode: false,
} as const;
