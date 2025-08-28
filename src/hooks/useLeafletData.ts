import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeafletArea {
  id: string;
  area_number: number;
  name: string;
  postcodes: string;
  household_count: number;
  bimonthly_circulation: number;
  price_per_thousand: number;
  price_with_vat: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  schedule?: Array<{
    year: number;
    month: string;
    copy_deadline: string;
    delivery_date: string;
    print_deadline: string;
  }>;
}

export interface LeafletDuration {
  id: string;
  name: string;
  description: string;
  months: number;
  issues: number;
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
        
        const processedData = data?.map(item => ({
          ...item,
          schedule: item.schedule as LeafletArea['schedule']
        })) as LeafletArea[];
        
        return processedData || [];
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      return failureCount < 1; // Only retry once
    }
  });
};

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
          .order('months');
        
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

  const isLoading = leafletAreasLoading || leafletDurationsLoading;
  const isError = leafletAreasError || leafletDurationsError;

  const refetch = () => {
    refetchLeafletAreas();
    refetchLeafletDurations();
  };

  return {
    leafletAreas,
    leafletDurations,
    isLoading,
    isError,
    refetch,
  };
}