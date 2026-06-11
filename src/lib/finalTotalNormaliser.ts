/**
 * Single source of truth for `quotes.final_total` / `bookings.final_total`.
 *
 * For genuine monthly-subscription pricing models (currently only `bogof`)
 * the persisted campaign total must equal `monthly_price × minimum_payments`
 * (default 6). The raw calculator output `subtotal × duration_multiplier`
 * double-counts bi-monthly issues for these models.
 *
 * For every other model (`fixed` / Pay-As-You-Go, `fixed_term`, `leafleting`)
 * the fallback value is returned unchanged — those are priced per issue and
 * the calculator's finalTotal is correct as-is.
 */

export const SUBSCRIPTION_PAYMENTS = 6;

/** Pricing models billed as a true monthly subscription. Extend here if a new
 *  subscription product launches — every persistence + payment site reads
 *  from this single set. */
export const SUBSCRIPTION_MODELS = new Set<string>(['bogof']);

export function isSubscriptionModel(pricingModel?: string | null): boolean {
  return !!pricingModel && SUBSCRIPTION_MODELS.has(String(pricingModel));
}

export interface NormaliseFinalTotalInput {
  pricingModel?: string | null;
  monthlyPrice?: number | null;
  fallbackFinalTotal?: number | null;
  /** Override the default 6 payments if a payment option specifies a different
   *  minimum (rare). */
  minimumPayments?: number;
}

export function normaliseFinalTotal(opts: NormaliseFinalTotalInput): number {
  const { pricingModel, monthlyPrice, fallbackFinalTotal } = opts;
  const payments = opts.minimumPayments ?? SUBSCRIPTION_PAYMENTS;
  const mp = Number(monthlyPrice) || 0;
  if (isSubscriptionModel(pricingModel) && mp > 0) {
    return Math.round(mp * payments * 100) / 100;
  }
  return Number(fallbackFinalTotal) || 0;
}