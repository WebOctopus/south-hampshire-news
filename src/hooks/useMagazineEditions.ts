import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export type ContentType = 'front_cover' | 'online_content';

export interface MagazineEdition {
  id: string;
  title: string;
  image_url: string;
  alt_text: string | null;
  link_url: string | null;
  issue_month: string | null;
  sort_order: number;
  is_active: boolean;
  content_type: ContentType;
  created_at: string;
  updated_at: string;
}

export const useMagazineEditions = (
  includeInactive = false,
  contentType?: ContentType
) => {
  return useQuery({
    queryKey: ['magazine-editions', includeInactive, contentType],
    queryFn: async () => {
      let query = supabase
        .from('magazine_editions')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      if (contentType) {
        query = query.eq('content_type', contentType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MagazineEdition[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMagazineEditionMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEdition = useMutation({
    mutationFn: async (edition: Omit<MagazineEdition, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('magazine_editions')
        .insert(edition)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine-editions'] });
      toast({ title: 'Success', description: 'Edition created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateEdition = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MagazineEdition> & { id: string }) => {
      const { data, error } = await supabase
        .from('magazine_editions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine-editions'] });
      toast({ title: 'Success', description: 'Edition updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEdition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('magazine_editions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine-editions'] });
      toast({ title: 'Success', description: 'Edition deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('magazine_editions')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine-editions'] });
      toast({ title: 'Success', description: 'Edition status updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateSortOrder = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('magazine_editions')
          .update({ sort_order })
          .eq('id', id)
      );
      const results = await Promise.all(promises);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine-editions'] });
      toast({ title: 'Success', description: 'Order updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { createEdition, updateEdition, deleteEdition, toggleActive, updateSortOrder };
};

export const useMagazineImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('magazine-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('magazine-covers')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({ 
        title: 'Upload failed', 
        description: error.message, 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadCoverImage, isUploading };
};
