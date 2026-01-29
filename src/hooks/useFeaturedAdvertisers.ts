import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeaturedAdvertiser {
  id: string;
  name: string;
  image_url: string;
  business_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  businesses?: {
    id: string;
    name: string;
  } | null;
}

export interface FeaturedAdvertiserInput {
  name: string;
  image_url: string;
  business_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export const useFeaturedAdvertisers = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ['featured-advertisers', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('featured_advertisers')
        .select(`
          *,
          businesses:business_id (
            id,
            name
          )
        `)
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching featured advertisers:', error);
        throw error;
      }

      return data as FeaturedAdvertiser[];
    },
  });
};

export const useFeaturedAdvertiserMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (input: FeaturedAdvertiserInput) => {
      const { data, error } = await supabase
        .from('featured_advertisers')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-advertisers'] });
      toast.success('Featured advertiser created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating featured advertiser:', error);
      toast.error('Failed to create featured advertiser');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: FeaturedAdvertiserInput & { id: string }) => {
      const { data, error } = await supabase
        .from('featured_advertisers')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-advertisers'] });
      toast.success('Featured advertiser updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating featured advertiser:', error);
      toast.error('Failed to update featured advertiser');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('featured_advertisers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-advertisers'] });
      toast.success('Featured advertiser deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting featured advertiser:', error);
      toast.error('Failed to delete featured advertiser');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('featured_advertisers')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-advertisers'] });
      toast.success('Featured advertiser visibility updated');
    },
    onError: (error: Error) => {
      console.error('Error toggling featured advertiser:', error);
      toast.error('Failed to update visibility');
    },
  });

  const updateSortOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('featured_advertisers')
          .update({ sort_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-advertisers'] });
      toast.success('Order updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating sort order:', error);
      toast.error('Failed to update order');
    },
  });

  return {
    createAdvertiser: createMutation.mutate,
    updateAdvertiser: updateMutation.mutate,
    deleteAdvertiser: deleteMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    updateSortOrder: updateSortOrderMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
