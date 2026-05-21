import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useBusinessImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (
    file: File,
    businessId: string,
    imageType: 'logo' | 'featured' | 'gallery'
  ): Promise<string | null> => {
    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const rand = Math.random().toString(36).slice(2, 8);
      const fileName = `${businessId}/${imageType}-${Date.now()}-${rand}.${fileExt}`;

      // Upload to business-images bucket
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: imageType !== 'gallery',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (publicUrl: string): Promise<boolean> => {
    try {
      const marker = '/business-images/';
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return false;
      const path = publicUrl.slice(idx + marker.length);
      const { error } = await supabase.storage.from('business-images').remove([path]);
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete image',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { uploadImage, deleteImage, isUploading };
}
