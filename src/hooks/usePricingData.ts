import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Area {
  id: string;
  name: string;
  postcodes: string[];
  circulation: number;
  base_price_multiplier: number;
  quarter_page_multiplier: number;
  half_page_multiplier: number;
  full_page_multiplier: number;
  is_active: boolean;
  sort_order: number;
}

export interface AdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_month: number;
  base_price_per_area: number;
  is_active: boolean;
  sort_order: number;
}

export interface Duration {
  id: string;
  name: string;
  duration_type: string;
  duration_value: number;
  discount_percentage: number;
  is_active: boolean;
  sort_order: number;
}

export interface VolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number;
  discount_percentage: number;
  is_active: boolean;
}

export interface SpecialDeal {
  id: string;
  name: string;
  deal_type: string;
  description: string;
  deal_value: number;
  min_areas: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export const usePricingData = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [adSizes, setAdSizes] = useState<AdSize[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>([]);
  const [specialDeals, setSpecialDeals] = useState<SpecialDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPricingData = async () => {
    try {
      setIsLoading(true);
      
      const [areasResult, adSizesResult, durationsResult, volumeDiscountsResult, specialDealsResult] = await Promise.all([
        supabase
          .from('pricing_areas')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('ad_sizes')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('pricing_durations')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('volume_discounts')
          .select('*')
          .eq('is_active', true)
          .order('min_areas', { ascending: true }),
        supabase
          .from('special_deals')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      ]);

      if (areasResult.error) throw areasResult.error;
      if (adSizesResult.error) throw adSizesResult.error;
      if (durationsResult.error) throw durationsResult.error;
      if (volumeDiscountsResult.error) throw volumeDiscountsResult.error;
      if (specialDealsResult.error) throw specialDealsResult.error;

      setAreas(areasResult.data || []);
      setAdSizes(adSizesResult.data || []);
      setDurations(durationsResult.data || []);
      setVolumeDiscounts(volumeDiscountsResult.data || []);
      setSpecialDeals(specialDealsResult.data || []);

    } catch (error: any) {
      console.error('Error loading pricing data:', error);
      toast({
        title: "Error loading pricing data",
        description: error.message || "Failed to load pricing information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  return {
    areas,
    adSizes,
    durations,
    volumeDiscounts,
    specialDeals,
    isLoading,
    refetch: loadPricingData
  };
};