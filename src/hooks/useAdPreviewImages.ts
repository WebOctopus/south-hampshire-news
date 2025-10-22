import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdPreviewImage {
  id: string;
  ad_size_id: string;
  image_url: string;
  image_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  ad_sizes?: {
    id: string;
    name: string;
    dimensions: string;
  };
}

export function useAdPreviewImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all preview images with ad sizes
  const { data: previewImages, isLoading, error } = useQuery({
    queryKey: ['ad-preview-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_preview_images')
        .select(`
          *,
          ad_sizes (
            id,
            name,
            dimensions
          )
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as AdPreviewImage[];
    },
  });

  // Upload new image
  const uploadImageMutation = useMutation({
    mutationFn: async ({ 
      file, 
      adSizeId, 
      imageName 
    }: { 
      file: File; 
      adSizeId: string; 
      imageName: string;
    }) => {
      // Generate unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${adSizeId}/${timestamp}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('ad-preview-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-preview-images')
        .getPublicUrl(filePath);

      // Save reference in database
      const { data, error: dbError } = await supabase
        .from('ad_preview_images')
        .insert({
          ad_size_id: adSizeId,
          image_url: filePath,
          image_name: imageName,
          is_active: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-preview-images'] });
      toast({
        title: "Success",
        description: "Preview image uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  // Delete image
  const deleteImageMutation = useMutation({
    mutationFn: async (image: AdPreviewImage) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ad-preview-images')
        .remove([image.image_url]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('ad_preview_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-preview-images'] });
      toast({
        title: "Success",
        description: "Preview image deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('ad_preview_images')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-preview-images'] });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Get preview image for a specific ad size
  const getPreviewImageForSize = (adSizeId: string) => {
    return previewImages?.find(
      (img) => img.ad_size_id === adSizeId && img.is_active
    );
  };

  // Get public URL for an image
  const getPublicUrl = (imagePath: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('ad-preview-images')
      .getPublicUrl(imagePath);
    return publicUrl;
  };

  return {
    previewImages,
    isLoading,
    error,
    uploadImage: uploadImageMutation.mutate,
    isUploading: uploadImageMutation.isPending,
    deleteImage: deleteImageMutation.mutate,
    isDeleting: deleteImageMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
    getPreviewImageForSize,
    getPublicUrl,
  };
}
