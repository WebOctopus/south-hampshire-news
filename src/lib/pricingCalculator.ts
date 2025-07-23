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
 * Calculate comprehensive advertising pricing with all discounts and multipliers
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

  // Calculate area-specific pricing
  const areaBreakdown = selectedAreas.map(area => {
    const basePrice = selectedAdSize.basePrice;
    const multiplier = area.pricingMultipliers[adSizeId] || 1.0;
    const multipliedPrice = basePrice * multiplier;

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

  // Apply duration multiplier
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
 * Get recommended duration based on business goals
 */
export function getRecommendedDuration(areasCount: number): string[] {
  if (areasCount >= 10) {
    return ['12-months', 'subscription-annually'];
  } else if (areasCount >= 6) {
    return ['6-months', 'subscription-quarterly'];
  } else if (areasCount >= 3) {
    return ['3-months', '6-months'];
  }
  return ['1-month', '3-months'];
}