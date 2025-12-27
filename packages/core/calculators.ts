/**
 * Business calculation utilities
 */

/**
 * Converts PULS to ARS using current NAV
 */
export const pulsToArs = (pulsAmount: number, nav: number): number => {
  return pulsAmount * nav;
};

/**
 * Converts ARS to PULS using current NAV
 */
export const arsToPuls = (arsAmount: number, nav: number): number => {
  return arsAmount / nav;
};

/**
 * Calculates yield percentage between two NAV values
 */
export const calculateYield = (navPrevious: number, navNew: number): number => {
  return (navNew - navPrevious) / navPrevious;
};