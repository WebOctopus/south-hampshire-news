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

  // Calculate area-specific pricing using Excel structure
  const areaBreakdown = selectedAreas.map((area, index) => {
    // Get area index (0-13 for areas 1-14)
    const areaIndex = parseInt(area.id.replace('area', '')) - 1;
    
    // Use per-area pricing from Excel for base calculation
    const basePrice = selectedAdSize.areaPricing.perArea[areaIndex] || selectedAdSize.areaPricing.perArea[0];
    
    // For 1-3 issues, we use the per-area pricing directly
    const multipliedPrice = basePrice;

    return {
      area,
      adSize: selectedAdSize,
      basePrice,
      multipliedPrice
    };
  });

  // Calculate subtotal before any discounts
  const subtotal = areaBreakdown.reduce((sum, item) => sum + item.multipliedPrice, 0);

  // Apply volume discount based on number of areas
  const volumeDiscount = getVolumeDiscount(selectedAreas.length);
  const volumeDiscountAmount = subtotal * (volumeDiscount / 100);
  const subtotalAfterVolumeDiscount = subtotal - volumeDiscountAmount;

  // Apply duration multiplier (1, 2, or 3 issues)
  const finalTotal = subtotalAfterVolumeDiscount * selectedDuration.discountMultiplier;

  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((sum, area) => sum + area.circulation, 0);

  return {
    subtotal,
    volumeDiscount: volumeDiscountAmount,
    volumeDiscountPercent: volumeDiscount,
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
export function formatPrice(price: number): string {
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