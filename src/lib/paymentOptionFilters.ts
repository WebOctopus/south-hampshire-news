import { isSubscriptionModel } from './finalTotalNormaliser';

/**
 * Drop the Monthly Direct Debit option for non-subscription pricing models.
 *
 * `payment_options` has no `pricing_model` column, so the same rows are
 * fetched for every model. Monthly DD (`option_type = 'monthly'`,
 * `minimum_payments = 6`) only makes sense for true subscriptions; for
 * `fixed` (Pay-As-You-Go) it would charge `monthly_price` for 6 months
 * regardless of the campaign's actual issue count.
 */
export function filterPaymentOptionsForModel<T extends { option_type?: string | null }>(
  options: T[] | null | undefined,
  pricingModel?: string | null,
): T[] {
  const list = options ?? [];
  if (isSubscriptionModel(pricingModel)) return list;
  return list.filter((opt) => opt?.option_type !== 'monthly');
}