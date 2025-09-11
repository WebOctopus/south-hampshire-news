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

  // Get volume discount for this number of areas
  const volumeDiscountPercent = getVolumeDiscount(areasCount, volumeDiscounts);
  const volumeDiscountMultiplier = 1 - (volumeDiscountPercent / 100);

  if (isSubscription) {
    // For subscription (BOGOF): use subscription pricing from database
    const subscriptionPricing = selectedAdSize.subscription_pricing_per_issue;
    let basePrice = selectedAdSize.base_price_per_month;
    
    // Check if we have area-specific pricing configured
    if (subscriptionPricing && typeof subscriptionPricing === 'object') {
      const areasKey = areasCount.toString();
      if (subscriptionPricing[areasKey]) {
        basePrice = subscriptionPricing[areasKey];
      }
    }
    
    // Apply area multipliers for more accurate pricing
    const areaSpecificTotal = selectedAreas.reduce((total, area) => {
      let areaPrice = basePrice / areasCount; // Base price per area
      
      // Apply area-specific multipliers based on ad size
      if (selectedAdSize.name.toLowerCase().includes('quarter')) {
        areaPrice *= area.quarter_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('half')) {
        areaPrice *= area.half_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('full')) {
        areaPrice *= area.full_page_multiplier || 1;
      } else {
        areaPrice *= area.base_price_multiplier || 1;
      }
      
      return total + areaPrice;
    }, 0);
    
    subtotal = areaSpecificTotal;
    
    // Create detailed area breakdown for subscription
    areaBreakdown = selectedAreas.map((area) => {
      let areaPrice = basePrice / areasCount;
      let multiplier = 1;
      
      if (selectedAdSize.name.toLowerCase().includes('quarter')) {
        multiplier = area.quarter_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('half')) {
        multiplier = area.half_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('full')) {
        multiplier = area.full_page_multiplier || 1;
      } else {
        multiplier = area.base_price_multiplier || 1;
      }
      
      return {
        area,
        adSize: selectedAdSize,
        basePrice: areaPrice,
        multipliedPrice: areaPrice * multiplier
      };
    });
  } else {
    // For fixed pricing: use fixed pricing from database
    const fixedPricing = selectedAdSize.fixed_pricing_per_issue;
    let basePrice = selectedAdSize.base_price_per_month;
    
    // Check if we have area-specific pricing configured
    if (fixedPricing && typeof fixedPricing === 'object') {
      const areasKey = areasCount.toString();
      if (fixedPricing[areasKey]) {
        basePrice = fixedPricing[areasKey];
      }
    }
    
    // Apply area multipliers for more accurate pricing
    const areaSpecificTotal = selectedAreas.reduce((total, area) => {
      let areaPrice = basePrice / areasCount; // Base price per area
      
      // Apply area-specific multipliers based on ad size
      if (selectedAdSize.name.toLowerCase().includes('quarter')) {
        areaPrice *= area.quarter_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('half')) {
        areaPrice *= area.half_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('full')) {
        areaPrice *= area.full_page_multiplier || 1;
      } else {
        areaPrice *= area.base_price_multiplier || 1;
      }
      
      return total + areaPrice;
    }, 0);
    
    subtotal = areaSpecificTotal;
    
    // Create detailed area breakdown for fixed pricing
    areaBreakdown = selectedAreas.map((area) => {
      let areaPrice = basePrice / areasCount;
      let multiplier = 1;
      
      if (selectedAdSize.name.toLowerCase().includes('quarter')) {
        multiplier = area.quarter_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('half')) {
        multiplier = area.half_page_multiplier || 1;
      } else if (selectedAdSize.name.toLowerCase().includes('full')) {
        multiplier = area.full_page_multiplier || 1;
      } else {
        multiplier = area.base_price_multiplier || 1;
      }
      
      return {
        area,
        adSize: selectedAdSize,
        basePrice: areaPrice,
        multipliedPrice: areaPrice * multiplier
      };
    });
  }

  // Apply volume discount
  const subtotalAfterVolumeDiscount = subtotal * volumeDiscountMultiplier;
  const volumeDiscountAmount = subtotal - subtotalAfterVolumeDiscount;

  // Apply duration multiplier and discount
  const durationMultiplier = selectedDuration.duration_value;
  const durationDiscountMultiplier = 1 - (selectedDuration.discount_percentage / 100);
  const finalTotal = subtotalAfterVolumeDiscount * durationMultiplier * durationDiscountMultiplier;

  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((sum, area) => sum + area.circulation, 0);

  return {
    subtotal,
    volumeDiscount: volumeDiscountAmount,
    volumeDiscountPercent,
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