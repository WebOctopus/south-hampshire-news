import { PaymentOption } from '@/hooks/usePaymentOptions';

/**
 * Calculate the final payment amount for a given payment option
 * This logic is shared between the booking summary and dashboard
 */
export const calculatePaymentAmount = (
  baseTotal: number,
  option: PaymentOption,
  pricingModel: string,
  paymentOptions: PaymentOption[],
  designFee: number = 0
): number => {
  // Separate the design fee from the base total for proper calculation
  const campaignCost = baseTotal - designFee;
  let amount = campaignCost;

  // Helper: compute the displayed Monthly Payment Plan amount
  const getMonthlyAmount = () => {
    const monthlyOpt = paymentOptions.find((opt: any) => opt.option_type === 'monthly');
    if (!monthlyOpt) return undefined;
    let m = campaignCost;
    if (pricingModel === 'bogof') {
      // In 3+ package, campaignCost represents the 6-month total
      m = campaignCost / 2; // monthly plan is based on 12 months total (half of 6-month deal)
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
    // Add design fee split across monthly payments
    if (designFee > 0 && monthlyOpt.minimum_payments) {
      m += designFee / monthlyOpt.minimum_payments;
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
      // 6 Months full payment = (monthly x 6) - design fee split, then add full design fee
      if (option.display_name?.includes('6 Months')) {
        const monthlyPayments = paymentOptions.find(opt => opt.option_type === 'monthly')?.minimum_payments || 12;
        const monthlyWithoutDesign = monthly - (designFee / monthlyPayments);
        return (monthlyWithoutDesign * 6) + designFee;
      }
      // 12 Months full payment = ((monthly x 12) - design fee split) x 0.9, then add full design fee
      if (option.display_name?.includes('12 Months') || option.option_type?.includes('12')) {
        const monthlyPayments = paymentOptions.find(opt => opt.option_type === 'monthly')?.minimum_payments || 12;
        const monthlyWithoutDesign = monthly - (designFee / monthlyPayments);
        return (monthlyWithoutDesign * 12 * 0.9) + designFee;
      }
    }
  }

  // For non-BOGOF 12-month options, double the base amount
  if (pricingModel !== 'bogof' && (option.display_name?.includes('12 Months') || option.option_type?.includes('12'))) {
    amount = campaignCost * 2;
  }

  // Apply discount
  if (option.discount_percentage > 0) {
    amount = amount * (1 - option.discount_percentage / 100);
  }

  // Apply additional fee
  if (option.additional_fee_percentage !== 0) {
    amount = amount * (1 + option.additional_fee_percentage / 100);
  }

  // For monthly payments (fallback), divide by minimum payments and add design fee per month
  if (option.minimum_payments && option.option_type === 'monthly') {
    const monthlyAmount = amount / option.minimum_payments;
    return monthlyAmount + (designFee / option.minimum_payments);
  }

  // For full payment options, add the full design fee
  return amount + designFee;
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
