/**
 * Get current period in YYYY-MM format
 */
export function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format a date to YYYY-MM period string
 */
export function formatDateToPeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Validate period format (YYYY-MM)
 */
export function isValidPeriod(period: string): boolean {
  const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return periodRegex.test(period);
}
