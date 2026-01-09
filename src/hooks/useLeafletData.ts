import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeafletScheduleItem {
  year: number;
  month: string;
  copyDeadline: string;
  copy_deadline?: string;
  printDeadline: string;
  print_deadline?: string;
  deliveryDate: string;
  delivery_date?: string;
}

export interface LeafletArea {
  id: string;
  area_number: number;
  name: string;
  postcodes: string;
  bimonthly_circulation: number;
  price_with_vat: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  schedule?: LeafletScheduleItem[];
}

export interface LeafletDuration {
  id: string;
  name: string;
  description: string;
  months: number;
  issues: number;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeafletSize {
  id: string;
  label: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Hook to fetch leaflet areas
export function useLeafletAreas() {
  return useQuery({
    queryKey: ['leaflet-areas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('leaflet_areas')
          .select('*')
          .eq('is_active', true)
          .order('area_number');
        
        if (error) {
          throw error;
        }
        
        // Process the data to properly type the schedule field
        const processedData = (data || []).map(area => ({
          ...area,
          schedule: Array.isArray(area.schedule) 
            ? (area.schedule as unknown as LeafletScheduleItem[]) 
            : []
        })) as LeafletArea[];
        
        return processedData;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      return failureCount < 1; // Only retry once
    }
  });
}

// Hook to fetch leaflet campaign durations
export function useLeafletCampaignDurations() {
  return useQuery({
    queryKey: ['leaflet-durations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('leaflet_campaign_durations')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) {
          throw error;
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

// Hook to fetch leaflet sizes
export function useLeafletSizes() {
  return useQuery({
    queryKey: ['leaflet-sizes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('leaflet_sizes')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) {
          throw error;
        }
        
        return (data || []) as LeafletSize[];
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

// Combined hook for all leaflet data
export function useLeafletData() {
  const { 
    data: leafletAreas, 
    isLoading: leafletAreasLoading, 
    isError: leafletAreasError, 
    refetch: refetchLeafletAreas 
  } = useLeafletAreas();
  
  const { 
    data: leafletDurations, 
    isLoading: leafletDurationsLoading, 
    isError: leafletDurationsError, 
    refetch: refetchLeafletDurations 
  } = useLeafletCampaignDurations();

  const { 
    data: leafletSizes, 
    isLoading: leafletSizesLoading, 
    isError: leafletSizesError, 
    refetch: refetchLeafletSizes 
  } = useLeafletSizes();

  const isLoading = leafletAreasLoading || leafletDurationsLoading || leafletSizesLoading;
  const isError = leafletAreasError || leafletDurationsError || leafletSizesError;

  const refetch = () => {
    refetchLeafletAreas();
    refetchLeafletDurations();
    refetchLeafletSizes();
  };

  return {
    leafletAreas,
    leafletDurations,
    leafletSizes,
    isLoading,
    isError,
    refetch,
  };
}