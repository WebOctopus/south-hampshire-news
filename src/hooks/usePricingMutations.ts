import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Helper function to invalidate all pricing-related queries
export const usePricingInvalidation = () => {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['pricing'] });
    queryClient.invalidateQueries({ queryKey: ['areas'] });
    queryClient.invalidateQueries({ queryKey: ['adSizes'] });
    queryClient.invalidateQueries({ queryKey: ['durations'] });
    queryClient.invalidateQueries({ queryKey: ['volumeDiscounts'] });
  };

  const invalidateSpecific = (type: 'areas' | 'adSizes' | 'durations' | 'volumeDiscounts') => {
    queryClient.invalidateQueries({ queryKey: [type] });
    queryClient.invalidateQueries({ queryKey: ['pricing'] }); // Also invalidate combined pricing
  };

  return { invalidateAll, invalidateSpecific };
};

// Mutation hook for updating ad size pricing
export const useUpdateAdSizePricing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { invalidateSpecific } = usePricingInvalidation();

  return useMutation({
    mutationFn: async ({ 
      adSizeId, 
      fixedPricing, 
      subscriptionPricing 
    }: {
      adSizeId: string;
      fixedPricing?: Record<string, number>;
      subscriptionPricing?: Record<string, number>;
    }) => {
      const updateData: any = {};
      
      if (fixedPricing !== undefined) {
        updateData.fixed_pricing_per_issue = fixedPricing;
      }
      
      if (subscriptionPricing !== undefined) {
        updateData.subscription_pricing_per_issue = subscriptionPricing;
      }

      const { error } = await supabase
        .from('ad_sizes')
        .update(updateData)
        .eq('id', adSizeId);

      if (error) throw error;
      
      return { adSizeId, ...updateData };
    },
    onSuccess: () => {
      invalidateSpecific('adSizes');
      toast({
        title: "Success",
        description: "Pricing updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating pricing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing.",
        variant: "destructive",
      });
    },
  });
};

// Mutation hook for updating areas
export const useUpdateArea = () => {
  const { toast } = useToast();
  const { invalidateSpecific } = usePricingInvalidation();

  return useMutation({
    mutationFn: async (areaData: any) => {
      const { error } = await supabase
        .from('pricing_areas')
        .upsert(areaData);

      if (error) throw error;
      return areaData;
    },
    onSuccess: () => {
      invalidateSpecific('areas');
      toast({
        title: "Success",
        description: "Area updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating area:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update area.",
        variant: "destructive",
      });
    },
  });
};

// Mutation hook for updating durations
export const useUpdateDuration = () => {
  const { toast } = useToast();
  const { invalidateSpecific } = usePricingInvalidation();

  return useMutation({
    mutationFn: async (durationData: any) => {
      const { error } = await supabase
        .from('pricing_durations')
        .upsert(durationData);

      if (error) throw error;
      return durationData;
    },
    onSuccess: () => {
      invalidateSpecific('durations');
      toast({
        title: "Success",
        description: "Duration updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating duration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update duration.",
        variant: "destructive",
      });
    },
  });
};

// Mutation hook for updating volume discounts
export const useUpdateVolumeDiscount = () => {
  const { toast } = useToast();
  const { invalidateSpecific } = usePricingInvalidation();

  return useMutation({
    mutationFn: async (volumeDiscountData: any) => {
      const { error } = await supabase
        .from('volume_discounts')
        .upsert(volumeDiscountData);

      if (error) throw error;
      return volumeDiscountData;
    },
    onSuccess: () => {
      invalidateSpecific('volumeDiscounts');
      toast({
        title: "Success",
        description: "Volume discount updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating volume discount:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update volume discount.",
        variant: "destructive",
      });
    },
  });
};