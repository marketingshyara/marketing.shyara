/**
 * Money rounding helpers used by commission math.
 *
 * `bankers` (round half to even) is the recommended default for financial systems because the
 * bias of always rounding ties up (`round`) or down (`floor`) accumulates over many trades; the
 * even-rounding rule has zero expected bias when ties are uniformly distributed.
 */

export type RoundingMode = "floor" | "round" | "bankers";

/**
 * Compute `floor(numerator / denominator)` with the requested rounding rule for the remainder.
 * All inputs are integers (cents * basis-points); intermediate products use BigInt so we never
 * overflow 53-bit float math even on multi-million-rupee invoices.
 */
export function divideCentsWithRounding(
  numerator: number,
  denominator: number,
  mode: RoundingMode
): number {
  if (denominator <= 0) {
    throw new Error("divideCentsWithRounding: denominator must be > 0");
  }
  const n = BigInt(numerator);
  const d = BigInt(denominator);
  const quotient = n / d;
  const remainder = n - quotient * d;

  if (remainder === 0n) {
    return Number(quotient);
  }

  if (mode === "floor") {
    // For non-negative values BigInt division already floors; for negative, BigInt rounds toward
    // zero, so we adjust by -1. Commission math always produces non-negative numerators in
    // practice, but defending the helper here keeps it generally useful.
    if (n < 0n) return Number(quotient - 1n);
    return Number(quotient);
  }

  // Compare 2 * |remainder| vs denominator.
  const absRem = remainder < 0n ? -remainder : remainder;
  const twice = absRem * 2n;

  if (twice < d) {
    return Number(quotient);
  }
  if (twice > d) {
    return Number(quotient + (n >= 0n ? 1n : -1n));
  }
  // Exact tie.
  if (mode === "round") {
    return Number(quotient + (n >= 0n ? 1n : -1n));
  }
  // mode === "bankers": round to even.
  const isEven = quotient % 2n === 0n;
  return Number(isEven ? quotient : quotient + (n >= 0n ? 1n : -1n));
}

/** Split an agreed project total into a 50/50 advance / final pair that sums exactly to `total`. */
export function splitAgreedTotal5050Cents(totalCents: number): {
  advanceAmountCents: number;
  finalQuoteCents: number;
} {
  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new Error("splitAgreedTotal5050Cents: totalCents must be a non-negative integer");
  }
  const advanceAmountCents = Math.floor(totalCents / 2);
  const finalQuoteCents = totalCents - advanceAmountCents;
  return { advanceAmountCents, finalQuoteCents };
}
