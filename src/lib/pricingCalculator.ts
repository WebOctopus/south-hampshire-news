import type { Area, AdSize, Duration, VolumeDiscount } from '@/hooks/usePricingData';

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
 * Calculate comprehensive advertising pricing for both fixed and subscription packages
 */
export function calculateAdvertisingPrice(
  selectedAreaIds: string[],
  adSizeId: string,
  durationId: string,
  areas: Area[],
  adSizes: AdSize[],
  durations: Duration[],
  volumeDiscounts: VolumeDiscount[],
  isSubscription: boolean = false
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

  // Calculate pricing based on new database structure
  const areasCount = selectedAreas.length;
  let subtotal = 0;
  let areaBreakdown: Array<{area: Area; adSize: AdSize; basePrice: number; multipliedPrice: number;}> = [];

  // Calculate price for each area individually using multipliers
  selectedAreas.forEach((area) => {
    let basePrice = selectedAdSize.base_price_per_area;
    let multipliedPrice = basePrice;

    // Apply area-specific multipliers based on ad size
    switch (selectedAdSize.id) {
      case 'quarter-page':
        multipliedPrice = basePrice * area.quarter_page_multiplier;
        break;
      case 'half-page':
        multipliedPrice = basePrice * area.half_page_multiplier;
        break;
      case 'full-page':
        multipliedPrice = basePrice * area.full_page_multiplier;
        break;
      default:
        multipliedPrice = basePrice * area.base_price_multiplier;
        break;
    }

    areaBreakdown.push({
      area,
      adSize: selectedAdSize,
      basePrice,
      multipliedPrice
    });

    subtotal += multipliedPrice;
  });

  // Apply duration multiplier (convert discount percentage to multiplier)
  const durationMultiplier = selectedDuration.duration_value * (1 - selectedDuration.discount_percentage / 100);
  
  // Apply volume discount
  const volumeDiscountPercent = getVolumeDiscount(areasCount, volumeDiscounts);
  const volumeDiscount = subtotal * (volumeDiscountPercent / 100);
  const afterVolumeDiscount = subtotal - volumeDiscount;
  
  const finalTotal = afterVolumeDiscount * durationMultiplier;

  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((sum, area) => sum + area.circulation, 0);

  return {
    subtotal,
    volumeDiscount,
    volumeDiscountPercent,
    durationMultiplier,
    finalTotal,
    totalCirculation,
    areaBreakdown
  };
}

/**
 * Get volume discount percentage based on number of areas selected
 */
function getVolumeDiscount(areasCount: number, volumeDiscounts: VolumeDiscount[]): number {
  const tier = volumeDiscounts.find(
    tier => areasCount >= tier.min_areas && (!tier.max_areas || areasCount <= tier.max_areas)
  );
  return tier?.discount_percentage || 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '£0.00';
  }
  return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
export function getRecommendedDuration(areasCount: number, durations: Duration[]): string[] {
  const availableDurations = durations.map(d => d.id);
  
  if (areasCount >= 10) {
    return availableDurations.filter(id => id.includes('12-months') || id.includes('3-issues'));
  } else if (areasCount >= 6) {
    return availableDurations.filter(id => id.includes('6-months') || id.includes('2-issues'));
  } else if (areasCount >= 3) {
    return availableDurations.filter(id => id.includes('6-months') || id.includes('2-issues'));
  }
  return availableDurations.filter(id => id.includes('1-issue') || id.includes('6-months'));
}