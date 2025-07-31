import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingArea {
  id: string;
  name: string;
  postcodes: string[];
  circulation: number;
  base_price_multiplier: number;
  quarter_page_multiplier: number;
  half_page_multiplier: number;
  full_page_multiplier: number;
  townsVillages?: string;
}

export interface AdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_area: number;
  base_price_per_month: number;
  areaPricing: {
    perMonth: number[];
  };
}

export interface Duration {
  id: string;
  name: string;
  duration_type: string;
  duration_value: number;
  discount_percentage: number;
  discountMultiplier: number;
}

export interface VolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number | null;
  discount_percentage: number;
}

export interface SpecialDeal {
  id: string;
  name: string;
  description: string;
  deal_type: string;
  deal_value: number;
  min_areas: number;
  valid_from: string | null;
  valid_until: string | null;
}

export function usePricingData() {
  const [areas, setAreas] = useState<PricingArea[]>([]);
  const [adSizes, setAdSizes] = useState<AdSize[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [subscriptionDurations, setSubscriptionDurations] = useState<Duration[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>([]);
  const [specialDeals, setSpecialDeals] = useState<SpecialDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAreas(),
        loadAdSizes(),
        loadDurations(),
        loadVolumeDiscounts(),
        loadSpecialDeals()
      ]);
    } catch (err) {
      console.error('Error loading pricing data:', err);
      setError('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    const { data, error } = await supabase
      .from('pricing_areas')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const transformedAreas: PricingArea[] = data.map(area => ({
      id: area.id,
      name: area.name,
      postcodes: area.postcodes || [],
      circulation: area.circulation,
      base_price_multiplier: Number(area.base_price_multiplier),
      quarter_page_multiplier: Number(area.quarter_page_multiplier),
      half_page_multiplier: Number(area.half_page_multiplier),
      full_page_multiplier: Number(area.full_page_multiplier),
      townsVillages: area.postcodes?.join(', ') || ''
    }));

    setAreas(transformedAreas);
  };

  const loadAdSizes = async () => {
    const { data, error } = await supabase
      .from('ad_sizes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const transformedAdSizes: AdSize[] = data.map(size => {
      // Create pricing tiers based on base price
      const basePrice = Number(size.base_price_per_month);
      const areaPricing = {
        perMonth: [
          basePrice,        // 1 area
          basePrice * 1.8,  // 2 areas
          basePrice * 2.5,  // 3 areas
          basePrice * 3.0,  // 4 areas
          basePrice * 3.4,  // 5 areas
          basePrice * 3.7,  // 6 areas
          basePrice * 4.0,  // 7 areas
          basePrice * 4.2,  // 8 areas
          basePrice * 4.4,  // 9 areas
          basePrice * 4.5   // 10+ areas
        ]
      };

      return {
        id: size.id,
        name: size.name,
        dimensions: size.dimensions,
        base_price_per_area: Number(size.base_price_per_area),
        base_price_per_month: Number(size.base_price_per_month),
        areaPricing
      };
    });

    setAdSizes(transformedAdSizes);
  };

  const loadDurations = async () => {
    const { data, error } = await supabase
      .from('pricing_durations')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const allDurations: Duration[] = data.map(duration => ({
      id: duration.id,
      name: duration.name,
      duration_type: duration.duration_type,
      duration_value: duration.duration_value,
      discount_percentage: Number(duration.discount_percentage),
      discountMultiplier: 1 - (Number(duration.discount_percentage) / 100)
    }));

    // Separate by type
    const fixedDurations = allDurations.filter(d => d.duration_type === 'issues');
    const subDurations = allDurations.filter(d => d.duration_type === 'months');

    setDurations(fixedDurations);
    setSubscriptionDurations(subDurations);
  };

  const loadVolumeDiscounts = async () => {
    const { data, error } = await supabase
      .from('volume_discounts')
      .select('*')
      .eq('is_active', true)
      .order('min_areas', { ascending: true });

    if (error) throw error;

    const transformedDiscounts: VolumeDiscount[] = data.map(discount => ({
      id: discount.id,
      min_areas: discount.min_areas,
      max_areas: discount.max_areas,
      discount_percentage: Number(discount.discount_percentage)
    }));

    setVolumeDiscounts(transformedDiscounts);
  };

  const loadSpecialDeals = async () => {
    const { data, error } = await supabase
      .from('special_deals')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    const transformedDeals: SpecialDeal[] = data.map(deal => ({
      id: deal.id,
      name: deal.name,
      description: deal.description || '',
      deal_type: deal.deal_type,
      deal_value: Number(deal.deal_value),
      min_areas: deal.min_areas || 1,
      valid_from: deal.valid_from,
      valid_until: deal.valid_until
    }));

    setSpecialDeals(transformedDeals);
  };

  return {
    areas,
    adSizes,
    durations,
    subscriptionDurations,
    volumeDiscounts,
    specialDeals,
    loading,
    error,
    refetch: loadAllData
  };
}