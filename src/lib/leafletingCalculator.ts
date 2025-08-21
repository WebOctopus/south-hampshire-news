// Leafleting service pricing calculation

export interface LeafletArea {
  id: string;
  areaNumber: number;
  name: string;
  postcodes: string;
  bimonthlyCirculation: number;
  priceWithVat: number;
  schedule?: any[];
}

export interface VolumeDiscount {
  minAreas: number;
  maxAreas?: number;
  discountPercentage: number;
}

export interface LeafletingPricingBreakdown {
  subtotal: number;
  volumeDiscount: number;
  volumeDiscountPercent: number;
  finalTotal: number;
  totalCirculation: number;
  areaBreakdown: Array<{
    areaId: string;
    areaName: string;
    basePrice: number;
    circulation: number;
  }>;
  durationMultiplier: number;
}

/**
 * Calculate leafleting service pricing based on selected areas
 */
export function calculateLeafletingPrice(
  selectedAreaIds: string[],
  leafletAreas: LeafletArea[] = [],
  durationMultiplier: number = 1,
  volumeDiscounts: VolumeDiscount[] = []
): LeafletingPricingBreakdown | null {
  if (selectedAreaIds.length === 0 || leafletAreas.length === 0) {
    return null;
  }

  // Get selected areas data
  const selectedAreas = leafletAreas.filter(area => selectedAreaIds.includes(area.id));
  
  if (selectedAreas.length === 0) {
    return null;
  }

  // Calculate base subtotal
  const subtotal = selectedAreas.reduce((total, area) => total + area.priceWithVat, 0);
  
  // Calculate volume discount based on number of areas
  const volumeDiscountPercent = getLeafletVolumeDiscount(selectedAreas.length, volumeDiscounts);
  const volumeDiscount = subtotal * (volumeDiscountPercent / 100);
  
  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((total, area) => total + area.bimonthlyCirculation, 0);
  
  // Calculate final total with duration multiplier
  const finalTotal = (subtotal - volumeDiscount) * durationMultiplier;
  
  // Build area breakdown
  const areaBreakdown = selectedAreas.map(area => ({
    areaId: area.id,
    areaName: area.name,
    basePrice: area.priceWithVat,
    circulation: area.bimonthlyCirculation
  }));

  return {
    subtotal,
    volumeDiscount,
    volumeDiscountPercent,
    finalTotal,
    totalCirculation,
    areaBreakdown,
    durationMultiplier
  };
}

/**
 * Get volume discount percentage based on number of selected areas
 */
function getLeafletVolumeDiscount(areasCount: number, volumeDiscounts: VolumeDiscount[] = []): number {
  const applicableDiscount = volumeDiscounts.find(
    discount => areasCount >= discount.minAreas && (discount.maxAreas === undefined || areasCount <= discount.maxAreas)
  );
  
  return applicableDiscount?.discountPercentage || 0;
}

/**
 * Format price for display
 */
export function formatLeafletPrice(price: number | undefined): string {
  if (price === undefined || price === null) return '£0.00';
  return `£${price.toFixed(2)}`;
}

/**
 * Calculate CPM for leafleting service
 */
export function calculateLeafletCPM(totalPrice: number, totalCirculation: number): number {
  if (totalCirculation === 0) return 0;
  return (totalPrice / totalCirculation) * 1000;
}