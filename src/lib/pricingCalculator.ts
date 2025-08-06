// Database interface types for pricing calculator
interface DbArea {
  id: string;
  name: string;
  postcodes: string[];
  circulation: number;
  base_price_multiplier: number;
  quarter_page_multiplier: number;
  half_page_multiplier: number;
  full_page_multiplier: number;
}

interface DbAdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_month: number;
  base_price_per_area: number;
  fixed_pricing_per_issue: any;
  subscription_pricing_per_issue: any;
}

interface DbDuration {
  id: string;
  name: string;
  duration_value: number;
  discount_percentage: number;
  duration_type: string;
}

interface DbVolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number | null;
  discount_percentage: number;
}

export interface PricingBreakdown {
  subtotal: number;
  volumeDiscount: number;
  volumeDiscountPercent: number;
  durationMultiplier: number;
  finalTotal: number;
  totalCirculation: number;
  areaBreakdown: Array<{
    area: DbArea;
    adSize: DbAdSize;
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
  isSubscription: boolean = false,
  areas: DbArea[] = [],
  adSizes: DbAdSize[] = [],
  durations: DbDuration[] = [],
  subscriptionDurations: DbDuration[] = [],
  volumeDiscounts: DbVolumeDiscount[] = []
): PricingBreakdown | null {
  // Validate inputs
  if (!selectedAreaIds.length || !adSizeId || !durationId || !areas.length || !adSizes.length) {
    return null;
  }

  const selectedAreas = areas.filter(area => selectedAreaIds.includes(area.id));
  
  // Find the ad size by ID
  const selectedAdSize = adSizes.find(size => size.id === adSizeId);
  
  const allDurations = isSubscription ? subscriptionDurations : durations;
  const selectedDuration = allDurations.find(duration => duration.id === durationId);

  if (!selectedAdSize || !selectedDuration || !selectedAreas.length) {
    return null;
  }

  // Calculate pricing based on model type
  const areasCount = selectedAreas.length;
  let subtotal: number;
  let areaBreakdown: Array<{area: DbArea; adSize: DbAdSize; basePrice: number; multipliedPrice: number;}>;

  if (isSubscription) {
    // For subscription: use database pricing
    const subscriptionPricing = selectedAdSize.subscription_pricing_per_issue;
    let basePrice = selectedAdSize.base_price_per_month;
    
    if (subscriptionPricing && Array.isArray(subscriptionPricing)) {
      basePrice = subscriptionPricing[areasCount - 1] || selectedAdSize.base_price_per_month;
    }
    
    subtotal = basePrice;
    
    // Create area breakdown
    const pricePerArea = basePrice / areasCount;
    areaBreakdown = selectedAreas.map((area) => ({
      area,
      adSize: selectedAdSize,
      basePrice: pricePerArea,
      multipliedPrice: pricePerArea
    }));
  } else {
    // For fixed pricing: use database pricing
    const fixedPricing = selectedAdSize.fixed_pricing_per_issue;
    let basePrice = selectedAdSize.base_price_per_month;
    
    if (fixedPricing && Array.isArray(fixedPricing)) {
      basePrice = fixedPricing[areasCount - 1] || selectedAdSize.base_price_per_month;
    }
    
    subtotal = basePrice;
    
    // Create area breakdown
    const pricePerArea = basePrice / areasCount;
    areaBreakdown = selectedAreas.map((area) => ({
      area,
      adSize: selectedAdSize,
      basePrice: pricePerArea,
      multipliedPrice: pricePerArea
    }));
  }

  // Apply duration multiplier (convert discount percentage to multiplier)
  const durationMultiplier = selectedDuration.duration_value;
  const discountMultiplier = 1 - (selectedDuration.discount_percentage / 100);
  const finalTotal = subtotal * durationMultiplier * discountMultiplier;

  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((sum, area) => sum + area.circulation, 0);

  return {
    subtotal,
    volumeDiscount: 0,
    volumeDiscountPercent: 0,
    durationMultiplier: durationMultiplier,
    finalTotal,
    totalCirculation,
    areaBreakdown
  };
}

/**
 * Get volume discount percentage based on number of areas selected
 */
function getVolumeDiscount(areasCount: number, volumeDiscounts: DbVolumeDiscount[]): number {
  const tier = volumeDiscounts.find(
    tier => areasCount >= tier.min_areas && (tier.max_areas === null || areasCount <= tier.max_areas)
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