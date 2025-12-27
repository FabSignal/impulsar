/**
 * Formatting utilities for display purposes
 */

/**
 * Formats a number as Argentine Pesos
 * @example formatArs(1234.56) // "$ 1.234,56"
 */
export const formatArs = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

/**
 * Formats a number as PULS tokens
 * @example formatPuls(1234.56) // "1,234.56 PULS"
 */
export const formatPuls = (amount: number): string => {
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} PULS`;
};

/**
 * Formats a percentage
 * @example formatPercentage(0.0523) // "5.23%"
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Truncates a Stellar public key for display
 * @example truncateStellarKey("GABC...XYZ123") // "GABC...XYZ"
 */
export const truncateStellarKey = (publicKey: string): string => {
  if (publicKey.length <= 12) return publicKey;
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
};