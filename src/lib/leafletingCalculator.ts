// Leafleting service pricing calculation

import { LeafletArea } from '@/hooks/useLeafletData';

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
  voucherDiscount?: number;
  voucherCode?: string;
}

/**
 * Calculate leafleting service pricing based on selected areas
 */
export function calculateLeafletingPrice(
  selectedAreaIds: string[],
  leafletAreas: LeafletArea[] = [],
  durationMultiplier: number = 1
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
  const subtotal = selectedAreas.reduce((total, area) => total + area.price_with_vat, 0);
  
  // No volume discount for leafleting
  const volumeDiscountPercent = 0;
  const volumeDiscount = 0;
  
  // Calculate total circulation
  const totalCirculation = selectedAreas.reduce((total, area) => total + area.bimonthly_circulation, 0);
  
  // Calculate final total with duration multiplier
  const finalTotal = (subtotal - volumeDiscount) * durationMultiplier;
  
  // Build area breakdown
  const areaBreakdown = selectedAreas.map(area => ({
    areaId: area.id,
    areaName: area.name,
    basePrice: area.price_with_vat,
    circulation: area.bimonthly_circulation
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