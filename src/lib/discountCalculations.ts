/**
 * Discount calculation helpers.
 * Pure functions — no side effects, no React imports.
 */

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_item';
export type DiscountProductType = 'subscription' | 'fixed_term' | 'leaflets';

export interface AppliedDiscount {
  code: string;
  code_id?: string;
  discount_type: DiscountType;
  discount_value: number;
  free_item_text?: string | null;
}

export interface DiscountInput {
  productType: DiscountProductType;
  /** Contract total ex-VAT (already reflects payment-option discounts like 12-month upfront 10%). */
  baseFinalTotal: number;
  /** Per-month ex-VAT amount (subscription only). */
  baseMonthly?: number;
  /** Number of months in the subscription contract term (e.g. 6, 12). */
  contractMonths?: number;
  discount: AppliedDiscount | null | undefined;
}

export interface DiscountResult {
  adjustedFinalTotal: number;
  adjustedMonthly: number;
  discountAmount: number;
  /** Short human label, e.g. "10% off", "£50 off", or the free_item_text. */
  lineLabel: string;
  /** True when the discount was a free_item (no monetary change). */
  isFreeItem: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Apply a discount to the displayed totals.
 *
 * Rules (per product spec):
 *  - percentage:
 *      subscription → take % off the monthly cost (for the contract term)
 *      short-term / leaflets → take % off the full amount
 *  - fixed_amount:
 *      subscription → spread amount evenly across contract term (per-month reduction)
 *      short-term / leaflets → take £ off the full amount
 *  - free_item: no price change; surface the free_item_text as a £0 line
 *
 * Stacking: the "12 months upfront = 10%" discount is already baked into
 * `baseFinalTotal` (it comes from calculatePaymentAmount), so applying the
 * fixed_amount code afterwards naturally subtracts from the already-
 * discounted total — matching the spec's "percentage first, then fixed".
 */
export function applyDiscountToTotals(input: DiscountInput): DiscountResult {
  const baseFinalTotal = Math.max(0, Number(input.baseFinalTotal) || 0);
  const baseMonthly = Math.max(0, Number(input.baseMonthly) || 0);

  if (!input.discount) {
    return {
      adjustedFinalTotal: baseFinalTotal,
      adjustedMonthly: baseMonthly,
      discountAmount: 0,
      lineLabel: '',
      isFreeItem: false,
    };
  }

  const { discount_type, discount_value, free_item_text } = input.discount;
  const value = Math.max(0, Number(discount_value) || 0);

  // free_item: no price change.
  if (discount_type === 'free_item') {
    return {
      adjustedFinalTotal: baseFinalTotal,
      adjustedMonthly: baseMonthly,
      discountAmount: 0,
      lineLabel: free_item_text || 'Free item',
      isFreeItem: true,
    };
  }

  // percentage
  if (discount_type === 'percentage') {
    const pct = Math.min(100, value);
    const factor = 1 - pct / 100;
    if (input.productType === 'subscription') {
      const adjustedMonthly = round2(baseMonthly * factor);
      const months = input.contractMonths && input.contractMonths > 0
        ? input.contractMonths
        : (baseMonthly > 0 ? Math.round(baseFinalTotal / baseMonthly) : 0);
      const adjustedFinalTotal = months > 0
        ? round2(adjustedMonthly * months)
        : round2(baseFinalTotal * factor);
      return {
        adjustedFinalTotal,
        adjustedMonthly,
        discountAmount: round2(baseFinalTotal - adjustedFinalTotal),
        lineLabel: `${pct}% off`,
        isFreeItem: false,
      };
    }
    const adjustedFinalTotal = round2(baseFinalTotal * factor);
    return {
      adjustedFinalTotal,
      adjustedMonthly: 0,
      discountAmount: round2(baseFinalTotal - adjustedFinalTotal),
      lineLabel: `${pct}% off`,
      isFreeItem: false,
    };
  }

  // fixed_amount
  if (discount_type === 'fixed_amount') {
    if (input.productType === 'subscription') {
      const months = input.contractMonths && input.contractMonths > 0
        ? input.contractMonths
        : (baseMonthly > 0 ? Math.round(baseFinalTotal / baseMonthly) : 1);
      const perMonth = months > 0 ? value / months : value;
      const adjustedMonthly = Math.max(0, round2(baseMonthly - perMonth));
      const adjustedFinalTotal = months > 0
        ? round2(adjustedMonthly * months)
        : Math.max(0, round2(baseFinalTotal - value));
      return {
        adjustedFinalTotal,
        adjustedMonthly,
        discountAmount: round2(baseFinalTotal - adjustedFinalTotal),
        lineLabel: `£${value.toFixed(2)} off`,
        isFreeItem: false,
      };
    }
    const adjustedFinalTotal = Math.max(0, round2(baseFinalTotal - value));
    return {
      adjustedFinalTotal,
      adjustedMonthly: 0,
      discountAmount: round2(baseFinalTotal - adjustedFinalTotal),
      lineLabel: `£${value.toFixed(2)} off`,
      isFreeItem: false,
    };
  }

  // Unknown type — no-op.
  return {
    adjustedFinalTotal: baseFinalTotal,
    adjustedMonthly: baseMonthly,
    discountAmount: 0,
    lineLabel: '',
    isFreeItem: false,
  };
}

/** Map UI pricing model → discount RPC product_type. */
export function pricingModelToProductType(
  pricingModel: string,
): DiscountProductType {
  if (pricingModel === 'bogof') return 'subscription';
  if (pricingModel === 'leafleting') return 'leaflets';
  return 'fixed_term';
}
