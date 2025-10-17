import { PaymentOption } from '@/hooks/usePaymentOptions';

/**
 * Calculate the final payment amount for a given payment option
 * This logic is shared between the booking summary and dashboard
 */
export const calculatePaymentAmount = (
  baseTotal: number,
  option: PaymentOption,
  pricingModel: string,
  paymentOptions: PaymentOption[]
): number => {
  let amount = baseTotal;

  // Helper: compute the displayed Monthly Payment Plan amount
  const getMonthlyAmount = () => {
    const monthlyOpt = paymentOptions.find((opt: any) => opt.option_type === 'monthly');
    if (!monthlyOpt) return undefined;
    let m = baseTotal;
    if (pricingModel === 'bogof') {
      // In 3+ package, baseTotal represents the 6-month total
      m = baseTotal / 2; // monthly plan is based on 12 months total (half of 6-month deal)
    }
    // Apply monthly option adjustments
    if (monthlyOpt.discount_percentage > 0) {
      m = m * (1 - monthlyOpt.discount_percentage / 100);
    }
    if (monthlyOpt.additional_fee_percentage !== 0) {
      m = m * (1 + monthlyOpt.additional_fee_percentage / 100);
    }
    if (monthlyOpt.minimum_payments) {
      m = m / monthlyOpt.minimum_payments;
    }
    return m;
  };

  // If this is the monthly option, return the monthly amount directly
  if (option.option_type === 'monthly') {
    const monthly = getMonthlyAmount();
    return monthly !== undefined ? monthly : amount;
  }

  // For 3+ package (BOGOF), derive full-payment totals from the monthly plan
  if (pricingModel === 'bogof') {
    const monthly = getMonthlyAmount();
    if (monthly !== undefined) {
      // 6 Months full payment = monthly x 6
      if (option.display_name?.includes('6 Months')) {
        return monthly * 6;
      }
      // 12 Months full payment = (monthly x 12) - 10%
      if (option.display_name?.includes('12 Months') || option.option_type?.includes('12')) {
        return monthly * 12 * 0.9;
      }
    }
  }

  // For non-BOGOF 12-month options, double the base amount
  if (pricingModel !== 'bogof' && (option.display_name?.includes('12 Months') || option.option_type?.includes('12'))) {
    amount = baseTotal * 2;
  }

  // Apply discount
  if (option.discount_percentage > 0) {
    amount = amount * (1 - option.discount_percentage / 100);
  }

  // Apply additional fee
  if (option.additional_fee_percentage !== 0) {
    amount = amount * (1 + option.additional_fee_percentage / 100);
  }

  // For monthly payments (fallback), divide by minimum payments
  if (option.minimum_payments && option.option_type === 'monthly') {
    return amount / option.minimum_payments;
  }

  return amount;
};

/**
 * Format a price as a currency string
 */
export const formatPaymentPrice = (price: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};
