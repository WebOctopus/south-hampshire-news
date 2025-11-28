import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ProductPackageFeature {
  label: string;
  value: string | boolean;
  highlight: boolean;
}

export interface ProductPackage {
  id: string;
  package_id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge_text: string | null;
  badge_variant: string;
  cta_text: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  features: ProductPackageFeature[];
  created_at: string;
  updated_at: string;
}

export const useProductPackages = (includeInactive = false) => {
  return useQuery({
    queryKey: ['product-packages', includeInactive],
    queryFn: async () => {
      // Add request timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      try {
        let query = supabase
          .from('product_packages')
          .select('*')
          .order('sort_order', { ascending: true })
          .abortSignal(controller.signal);

        if (!includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        clearTimeout(timeoutId);

        if (error) throw error;
        return (data || []).map(item => ({
          ...item,
          features: item.features as unknown as ProductPackageFeature[]
        })) as ProductPackage[];
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - packages don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnMount: 'always', // Always refetch when component mounts (important for Dialog)
    refetchOnWindowFocus: false,
  });
};

export const useUpdateProductPackage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProductPackage> & { id: string }) => {
      const updateData = {
        ...data,
        features: data.features as any // Cast to any for JSONB compatibility
      };
      delete (updateData as any).created_at;
      delete (updateData as any).updated_at;
      
      const { error } = await supabase
        .from('product_packages')
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-packages'] });
      toast({
        title: 'Success',
        description: 'Product package updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating product package:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product package',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateProductPackage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ProductPackage, 'id' | 'created_at' | 'updated_at'>) => {
      const insertData = {
        ...data,
        features: data.features as any // Cast to any for JSONB compatibility
      };
      
      const { error } = await supabase
        .from('product_packages')
        .insert(insertData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-packages'] });
      toast({
        title: 'Success',
        description: 'Product package created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating product package:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product package',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProductPackage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('product_packages')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-packages'] });
      toast({
        title: 'Success',
        description: 'Product package deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting product package:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product package',
        variant: 'destructive',
      });
    },
  });
};
