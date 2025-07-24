import { areas, adSizes, durations, volumeDiscounts, type Area, type AdSize, type Duration } from '@/data/advertisingPricing';

export interface PricingBreakdown {
  subtotal: number;
  volumeDiscount: number;
  volumeDiscountPercent: number;
  durationMultiplier: number;
  finalTotal: number;
  totalCirculation: number;
  areaBreakdown: Array<{
    area: Area;
    adSize: AdSize;
    basePrice: number;
    multipliedPrice: number;
  }>;
}

/**
 * Calculate comprehensive advertising pricing based on Excel structure for 1-3 issues fixed booking
 */
export function calculateAdvertisingPrice(
  selectedAreaIds: string[],
  adSizeId: string,
  durationId: string
): PricingBreakdown | null {
  // Validate inputs
  if (!selectedAreaIds.length || !adSizeId || !durationId) {
    return null;
  }

  const selectedAreas = areas.filter(area => selectedAreaIds.includes(area.id));
  const selectedAdSize = adSizes.find(size => size.id === adSizeId);
  const selectedDuration = durations.find(duration => duration.id === durationId);

  if (!selectedAdSize || !selectedDuration || !selectedAreas.length) {
    return null;
  }

  // Calculate pricing based on total number of areas selected (cumulative pricing)
  const areasCount = selectedAreas.length;
  
  // Use the perMonth pricing array as cumulative pricing for area counts
  // Index 0 = 1 area, Index 1 = 2 areas, etc.
  const cumulativePrice = selectedAdSize.areaPricing.perMonth[areasCount - 1] || selectedAdSize.areaPricing.perMonth[0];

  // Create area breakdown for display purposes - distribute the cumulative price evenly
  const pricePerArea = cumulativePrice / areasCount;
  const areaBreakdown = selectedAreas.map((area) => {
    return {
      area,
      adSize: selectedAdSize,
      basePrice: pricePerArea,
      multipliedPrice: pricePerArea
    };
  });

  // Subtotal is the cumulative price for the selected number of areas
  const subtotal = cumulativePrice;

  // Apply duration multiplier (1, 2, or 3 issues) - no volume discount for this payment type
  const finalTotal = subtotal * selectedDuration.discountMultiplier;

  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((sum, area) => sum + area.circulation, 0);

  return {
    subtotal,
    volumeDiscount: 0,
    volumeDiscountPercent: 0,
    durationMultiplier: selectedDuration.discountMultiplier,
    finalTotal,
    totalCirculation,
    areaBreakdown
  };
}

/**
 * Get volume discount percentage based on number of areas selected
 */
function getVolumeDiscount(areasCount: number): number {
  const tier = volumeDiscounts.find(
    tier => areasCount >= tier.minAreas && areasCount <= tier.maxAreas
  );
  return tier?.discountPercentage || 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '£0.00';
  }
  return `£${price.toFixed(2)}`;
}

/**
 * Calculate cost per thousand (CPM) for circulation reach
 */
export function calculateCPM(totalPrice: number, totalCirculation: number): number {
  if (totalCirculation === 0) return 0;
  return (totalPrice / totalCirculation) * 1000;
}

/**
 * Get recommended duration based on business goals - simplified for 1-3 issues
 */
export function getRecommendedDuration(areasCount: number): string[] {
  if (areasCount >= 10) {
    return ['3-issues'];
  } else if (areasCount >= 6) {
    return ['2-issues', '3-issues'];
  } else if (areasCount >= 3) {
    return ['2-issues'];
  }
  return ['1-issue', '2-issues'];
}