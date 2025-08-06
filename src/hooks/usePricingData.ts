import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbArea {
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

export interface DbAdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_area: number;
  base_price_per_month: number;
  fixed_pricing_per_issue: Record<string, any>;
  subscription_pricing_per_issue: Record<string, any>;
  available_for: string[];
  is_active: boolean;
  sort_order: number;
}

export interface DbDuration {
  id: string;
  name: string;
  duration_value: number;
  duration_type: string;
  discount_percentage: number;
  is_active: boolean;
  sort_order: number;
}

export interface DbVolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number | null;
  discount_percentage: number;
  is_active: boolean;
}

// Individual hooks for each data type with error boundaries
export function useAreas() {
  return useQuery({
    queryKey: ['pricing_areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_areas')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as DbArea[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAdSizes() {
  return useQuery({
    queryKey: ['ad_sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_sizes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        available_for: Array.isArray(item.available_for) 
          ? item.available_for 
          : ['fixed', 'subscription']
      })) as DbAdSize[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useDurations() {
  return useQuery({
    queryKey: ['pricing_durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_durations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as DbDuration[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useVolumeDiscounts() {
  return useQuery({
    queryKey: ['volume_discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volume_discounts')
        .select('*')
        .eq('is_active', true)
        .order('min_areas');
      
      if (error) throw error;
      return data as DbVolumeDiscount[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Optimized combined hook that uses individual queries
export function usePricingData() {
  const areasQuery = useAreas();
  const adSizesQuery = useAdSizes();
  const durationsQuery = useDurations();
  const volumeDiscountsQuery = useVolumeDiscounts();

  const isLoading = areasQuery.isLoading || adSizesQuery.isLoading || 
                   durationsQuery.isLoading || volumeDiscountsQuery.isLoading;
  
  const isError = areasQuery.isError || adSizesQuery.isError || 
                 durationsQuery.isError || volumeDiscountsQuery.isError;
  
  const error = areasQuery.error || adSizesQuery.error || 
               durationsQuery.error || volumeDiscountsQuery.error;

  // Separate durations by type
  const fixedDurations = durationsQuery.data?.filter(d => d.duration_type === 'fixed') || [];
  const subscriptionDurations = durationsQuery.data?.filter(d => d.duration_type === 'subscription') || [];

  return {
    areas: areasQuery.data || [],
    adSizes: adSizesQuery.data || [],
    durations: fixedDurations,
    subscriptionDurations,
    volumeDiscounts: volumeDiscountsQuery.data || [],
    isLoading,
    isError,
    error,
    refetch: () => {
      areasQuery.refetch();
      adSizesQuery.refetch();
      durationsQuery.refetch();
      volumeDiscountsQuery.refetch();
    }
  };
}