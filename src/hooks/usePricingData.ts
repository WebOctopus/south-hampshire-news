import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbArea {
  id: string;
  name: string;
  area_number: number;
  postcodes: string;
  circulation: number;
  sort_order: number;
  is_active: boolean;
  price_multiplier: number;
  subscription_price_multiplier: number;
  bogof_paid_multiplier: number;
  bogof_free_multiplier: number;
  leafleting_multiplier: number;
  copy_deadline_days: number;
  print_deadline_days: number;
  delivery_deadline_days: number;
  base_price_multiplier: number;
  quarter_page_multiplier: number;
  half_page_multiplier: number;
  full_page_multiplier: number;
  schedule?: Array<{ 
    month: string; 
    copyDeadline: string; 
    printDeadline: string; 
    deliveryDate: string; 
  }>;
}

export interface DbAdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_area: number;
  base_price_per_month: number;
  subscription_base_price_per_area: number;
  subscription_base_price_per_month: number;
  is_active: boolean;
  available_for: string[];
}

export interface DbDuration {
  id: string;
  name: string;
  duration_value: number;
  duration_type: string;
  discount_percentage: number;
  is_active: boolean;
}

export interface DbVolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number | null;
  discount_percentage: number;
  is_active: boolean;
}

// Hook to fetch areas
export function useAreas() {
  return useQuery({
    queryKey: ['pricing_areas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_areas')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) {
          throw new Error(`Failed to fetch pricing areas: ${error.message}`);
        }
        
        const processedData = data?.map(item => ({
          ...item,
          schedule: item.schedule as DbArea['schedule']
        }));
        
        return processedData || [];
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      return failureCount < 3;
    }
  });
}

// Hook to fetch ad sizes
export function useAdSizes() {
  return useQuery({
    queryKey: ['ad_sizes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ad_sizes')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          throw new Error(`Failed to fetch ad sizes: ${error.message}`);
        }
        
        const processedData = data?.map(item => ({
          ...item,
          available_for: item.available_for as string[]
        }));
        
        return processedData || [];
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      return failureCount < 3;
    }
  });
}

// Hook to fetch durations
export function useDurations() {
  return useQuery({
    queryKey: ['pricing_durations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_durations')
          .select('*')
          .eq('is_active', true)
          .order('duration_value');
        
        if (error) {
          throw new Error(`Failed to fetch durations: ${error.message}`);
        }
        
        return (data || []);
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      return failureCount < 3;
    }
  });
}

// Hook to fetch volume discounts
export function useVolumeDiscounts() {
  return useQuery({
    queryKey: ['volume_discounts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('volume_discounts')
          .select('*')
          .eq('is_active', true)
          .order('min_areas');
        
        if (error) {
          throw new Error(`Failed to fetch volume discounts: ${error.message}`);
        }
        
        return (data || []);
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      return failureCount < 3;
    }
  });
}

// Combined hook for all pricing data
export function usePricingData() {
  const { data: areas, isLoading: areasLoading, isError: areasError, refetch: refetchAreas } = useAreas();
  const { data: adSizes, isLoading: adSizesLoading, isError: adSizesError, refetch: refetchAdSizes } = useAdSizes();
  const { data: allDurations, isLoading: durationsLoading, isError: durationsError, refetch: refetchDurations } = useDurations();
  const { data: volumeDiscounts, isLoading: volumeDiscountsLoading, isError: volumeDiscountsError, refetch: refetchVolumeDiscounts } = useVolumeDiscounts();

  // Split durations into fixed and subscription
  const durations = allDurations?.filter(d => d.duration_type === 'fixed') || [];
  const subscriptionDurations = allDurations?.filter(d => d.duration_type === 'subscription') || [];

  const isLoading = areasLoading || adSizesLoading || durationsLoading || volumeDiscountsLoading;
  const isError = areasError || adSizesError || durationsError || volumeDiscountsError;

  const refetch = () => {
    refetchAreas();
    refetchAdSizes();
    refetchDurations();
    refetchVolumeDiscounts();
  };

  return {
    areas,
    adSizes,
    durations,
    subscriptionDurations,
    volumeDiscounts,
    isLoading,
    isError,
    refetch,
  };
}