/**
 * Money is always stored/compared as an integer number of centavos (see
 * supabase/migrations/0003_products.sql) — never as a float — to avoid
 * floating-point rounding errors in prices and totals.
 */

/** Formats an integer centavos amount for display, e.g. 15000 -> "₱150.00". */
export function formatCents(cents: number): string {
  return `₱${(cents / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parses a decimal string as typed by a user (e.g. "150.50") into an integer
 * number of centavos. Returns null if the input isn't a valid, non-negative
 * number.
 */
export function parseCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return Math.round(parsed * 100);
}
