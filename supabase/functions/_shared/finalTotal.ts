// Mirror of src/lib/finalTotalNormaliser.ts for edge functions.

export const SUBSCRIPTION_PAYMENTS = 6;
export const SUBSCRIPTION_MODELS = new Set<string>(['bogof']);

export function isSubscriptionModel(pricingModel?: string | null): boolean {
  return !!pricingModel && SUBSCRIPTION_MODELS.has(String(pricingModel));
}

export interface NormaliseFinalTotalInput {
  pricingModel?: string | null;
  monthlyPrice?: number | null;
  fallbackFinalTotal?: number | null;
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