import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useBusinessImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (
    file: File,
    businessId: string,
    imageType: 'logo' | 'featured'
  ): Promise<string | null> => {
    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/${imageType}-${Date.now()}.${fileExt}`;

      // Upload to business-images bucket
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
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

  return { uploadImage, isUploading };
}
