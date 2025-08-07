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

// Individual hooks for each data type with standardized cache config
export function useAreas() {
  return useQuery({
    queryKey: ['pricing_areas'],
    queryFn: async () => {
      console.log('[usePricingData] Fetching areas...');
      try {
        const { data, error } = await supabase
          .from('pricing_areas')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) {
          console.error('[usePricingData] Areas fetch error:', error);
          throw new Error(`Failed to fetch pricing areas: ${error.message}`);
        }
        
        console.log('[usePricingData] Areas fetched successfully:', data?.length || 0);
        return (data || []) as DbArea[];
      } catch (error) {
        console.error('[usePricingData] Network error fetching areas:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced for better freshness
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      console.log(`[usePricingData] Areas retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    },
  });
}

export function useAdSizes() {
  return useQuery({
    queryKey: ['ad_sizes'],
    queryFn: async () => {
      console.log('[usePricingData] Fetching ad sizes...');
      try {
        const { data, error } = await supabase
          .from('ad_sizes')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) {
          console.error('[usePricingData] Ad sizes fetch error:', error);
          throw new Error(`Failed to fetch ad sizes: ${error.message}`);
        }
        
        const processedData = (data || []).map(item => ({
          ...item,
          available_for: Array.isArray(item.available_for) 
            ? item.available_for 
            : ['fixed', 'subscription']
        })) as DbAdSize[];
        
        console.log('[usePricingData] Ad sizes fetched successfully:', processedData.length);
        return processedData;
      } catch (error) {
        console.error('[usePricingData] Network error fetching ad sizes:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced for better freshness
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      console.log(`[usePricingData] Ad sizes retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    },
  });
}

export function useDurations() {
  return useQuery({
    queryKey: ['pricing_durations'],
    queryFn: async () => {
      console.log('[usePricingData] Fetching durations...');
      try {
        const { data, error } = await supabase
          .from('pricing_durations')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) {
          console.error('[usePricingData] Durations fetch error:', error);
          throw new Error(`Failed to fetch durations: ${error.message}`);
        }
        
        console.log('[usePricingData] Durations fetched successfully:', data?.length || 0);
        return (data || []) as DbDuration[];
      } catch (error) {
        console.error('[usePricingData] Network error fetching durations:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced for better freshness
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      console.log(`[usePricingData] Durations retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    },
  });
}

export function useVolumeDiscounts() {
  return useQuery({
    queryKey: ['volume_discounts'],
    queryFn: async () => {
      console.log('[usePricingData] Fetching volume discounts...');
      try {
        const { data, error } = await supabase
          .from('volume_discounts')
          .select('*')
          .eq('is_active', true)
          .order('min_areas');
        
        if (error) {
          console.error('[usePricingData] Volume discounts fetch error:', error);
          throw new Error(`Failed to fetch volume discounts: ${error.message}`);
        }
        
        console.log('[usePricingData] Volume discounts fetched successfully:', data?.length || 0);
        return (data || []) as DbVolumeDiscount[];
      } catch (error) {
        console.error('[usePricingData] Network error fetching volume discounts:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced for better freshness
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      console.log(`[usePricingData] Volume discounts retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    },
  });
}

// Optimized combined hook with improved loading state logic
export function usePricingData() {
  const areasQuery = useAreas();
  const adSizesQuery = useAdSizes();
  const durationsQuery = useDurations();
  const volumeDiscountsQuery = useVolumeDiscounts();

  // Improved loading logic - only show loading if we have NO data and queries are loading
  const hasAnyData = (areasQuery.data?.length || 0) > 0 || 
                    (adSizesQuery.data?.length || 0) > 0 || 
                    (durationsQuery.data?.length || 0) > 0 || 
                    (volumeDiscountsQuery.data?.length || 0) > 0;

  // Only show loading state if no cached data exists AND queries are actually loading
  const isInitialLoading = (areasQuery.isLoading && !areasQuery.data) || 
                          (adSizesQuery.isLoading && !adSizesQuery.data) || 
                          (durationsQuery.isLoading && !durationsQuery.data) || 
                          (volumeDiscountsQuery.isLoading && !volumeDiscountsQuery.data);
  
  const isLoading = !hasAnyData && isInitialLoading;
  
  const isError = areasQuery.isError || adSizesQuery.isError || 
                 durationsQuery.isError || volumeDiscountsQuery.isError;
  
  const error = areasQuery.error || adSizesQuery.error || 
               durationsQuery.error || volumeDiscountsQuery.error;

  // Debug logging for loading states
  console.log('[usePricingData] Loading states:', {
    isLoading,
    isInitialLoading,
    hasAnyData,
    areas: { loading: areasQuery.isLoading, data: areasQuery.data?.length },
    adSizes: { loading: adSizesQuery.isLoading, data: adSizesQuery.data?.length },
    durations: { loading: durationsQuery.isLoading, data: durationsQuery.data?.length },
    volumeDiscounts: { loading: volumeDiscountsQuery.isLoading, data: volumeDiscountsQuery.data?.length }
  });

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