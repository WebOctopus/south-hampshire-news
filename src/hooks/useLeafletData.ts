import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface LeafletArea {
  id: string;
  area_number: number;
  name: string;
  postcodes: string;
  bimonthly_circulation: number;
  price_with_vat: number;
  schedule: Array<{
    month: string;
    copyDeadline: string;
    printDeadline: string;
    delivery: string;
    circulation: number;
  }>;
  is_active: boolean;
}

export interface LeafletSize {
  id: string;
  label: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface LeafletCampaignDuration {
  id: string;
  name: string;
  issues: number;
  months: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export const useLeafletAreas = () => {
  return useQuery({
    queryKey: ['leaflet-areas'],
    queryFn: async () => {
      console.log('[useLeafletData] Fetching leaflet areas... - START');
      console.log('[useLeafletData] Supabase client available:', !!supabase);
      
      try {
        console.log('[useLeafletData] Executing leaflet areas query...');
        const { data, error } = await supabase
          .from('leaflet_areas')
          .select('*')
          .eq('is_active', true)
          .order('area_number');
        
        console.log('[useLeafletData] Leaflet areas query completed - data:', !!data, 'error:', !!error);
        
        if (error) {
          console.error('[useLeafletData] Leaflet areas fetch error:', error);
          throw error;
        }
        
        console.log('[useLeafletData] Leaflet areas fetched successfully:', data?.length || 0);
        console.log('[useLeafletData] First leaflet area sample:', data?.[0]);
        
        const processedData = data?.map(item => ({
          ...item,
          schedule: item.schedule as LeafletArea['schedule']
        })) as LeafletArea[];
        
        console.log('[useLeafletData] Processed leaflet areas length:', processedData?.length || 0);
        return processedData || [];
      } catch (error) {
        console.error('[useLeafletData] Network error fetching leaflet areas:', error);
        console.error('[useLeafletData] Error stack:', (error as Error)?.stack);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for debugging
    retry: (failureCount, error) => {
      console.log(`[useLeafletData] Leaflet areas retry attempt ${failureCount + 1}:`, error);
      return failureCount < 1; // Only retry once for debugging
    }
  });
};

export const useLeafletSizes = () => {
  return useQuery({
    queryKey: ['leaflet-sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaflet_sizes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as LeafletSize[];
    },
  });
};

export const useCreateLeafletArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (area: Omit<LeafletArea, 'id'>) => {
      const { data, error } = await supabase
        .from('leaflet_areas')
        .insert([area])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-areas'] });
      toast({ title: "Area created successfully" });
    },
    onError: (error) => {
      console.error('Error creating area:', error);
      toast({ title: "Error creating area", variant: "destructive" });
    },
  });
};

export const useUpdateLeafletArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (area: LeafletArea) => {
      const { data, error } = await supabase
        .from('leaflet_areas')
        .update({
          area_number: area.area_number,
          name: area.name,
          postcodes: area.postcodes,
          bimonthly_circulation: area.bimonthly_circulation,
          price_with_vat: area.price_with_vat,
          schedule: area.schedule,
        })
        .eq('id', area.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-areas'] });
      toast({ title: "Area updated successfully" });
    },
    onError: (error) => {
      console.error('Error updating area:', error);
      toast({ title: "Error updating area", variant: "destructive" });
    },
  });
};

export const useDeleteLeafletArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leaflet_areas')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-areas'] });
      toast({ title: "Area deleted successfully", variant: "destructive" });
    },
    onError: (error) => {
      console.error('Error deleting area:', error);
      toast({ title: "Error deleting area", variant: "destructive" });
    },
  });
};

export const useCreateLeafletSize = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (size: Omit<LeafletSize, 'id'>) => {
      const { data, error } = await supabase
        .from('leaflet_sizes')
        .insert([size])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-sizes'] });
      toast({ title: "Size created successfully" });
    },
    onError: (error) => {
      console.error('Error creating size:', error);
      toast({ title: "Error creating size", variant: "destructive" });
    },
  });
};

export const useUpdateLeafletSize = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (size: LeafletSize) => {
      const { data, error } = await supabase
        .from('leaflet_sizes')
        .update({
          label: size.label,
          description: size.description,
          sort_order: size.sort_order,
        })
        .eq('id', size.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-sizes'] });
      toast({ title: "Size updated successfully" });
    },
    onError: (error) => {
      console.error('Error updating size:', error);
      toast({ title: "Error updating size", variant: "destructive" });
    },
  });
};

export const useDeleteLeafletSize = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leaflet_sizes')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-sizes'] });
      toast({ title: "Size deleted successfully", variant: "destructive" });
    },
    onError: (error) => {
      console.error('Error deleting size:', error);
      toast({ title: "Error deleting size", variant: "destructive" });
    },
  });
};

// Campaign Duration Hooks
export const useLeafletCampaignDurations = () => {
  return useQuery({
    queryKey: ['leaflet-campaign-durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaflet_campaign_durations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as LeafletCampaignDuration[];
    },
  });
};

export const useCreateLeafletCampaignDuration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (duration: Omit<LeafletCampaignDuration, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leaflet_campaign_durations')
        .insert([duration])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-campaign-durations'] });
      toast({ title: "Campaign duration created successfully" });
    },
    onError: (error) => {
      console.error('Error creating campaign duration:', error);
      toast({ title: "Error creating campaign duration", variant: "destructive" });
    },
  });
};

export const useUpdateLeafletCampaignDuration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (duration: LeafletCampaignDuration) => {
      const { data, error } = await supabase
        .from('leaflet_campaign_durations')
        .update({
          name: duration.name,
          issues: duration.issues,
          months: duration.months,
          description: duration.description,
          is_default: duration.is_default,
          sort_order: duration.sort_order,
        })
        .eq('id', duration.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-campaign-durations'] });
      toast({ title: "Campaign duration updated successfully" });
    },
    onError: (error) => {
      console.error('Error updating campaign duration:', error);
      toast({ title: "Error updating campaign duration", variant: "destructive" });
    },
  });
};

export const useDeleteLeafletCampaignDuration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leaflet_campaign_durations')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaflet-campaign-durations'] });
      toast({ title: "Campaign duration deleted successfully", variant: "destructive" });
    },
    onError: (error) => {
      console.error('Error deleting campaign duration:', error);
      toast({ title: "Error deleting campaign duration", variant: "destructive" });
    },
  });
};