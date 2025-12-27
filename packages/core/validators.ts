/**
 * Validation utilities for business logic
 */

/**
 * Validates a Stellar public key format
 */
export const isValidStellarPublicKey = (key: string): boolean => {
  // Stellar public keys start with 'G' and are 56 characters
  return typeof key === 'string' && key.length === 56 && key.startsWith('G');
};

/**
 * Validates transfer amount is positive and within limits
 */
export const isValidTransferAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && Number.isFinite(amount);
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};