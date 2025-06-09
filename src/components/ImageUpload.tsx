import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Star } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  featuredImage: string;
  onImagesChange: (images: string[]) => void;
  onFeaturedImageChange: (imageUrl: string) => void;
  userId: string;
}

const ImageUpload = ({ 
  images, 
  featuredImage, 
  onImagesChange, 
  onFeaturedImageChange, 
  userId 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error, data } = await supabase.storage
      .from('business-images')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(uploadImage);
      const newImageUrls = await Promise.all(uploadPromises);
      
      const updatedImages = [...images, ...newImageUrls];
      onImagesChange(updatedImages);
      
      // Set first uploaded image as featured if no featured image exists
      if (!featuredImage && newImageUrls.length > 0) {
        onFeaturedImageChange(newImageUrls[0]);
      }
      
      toast({
        title: "Success",
        description: `${newImageUrls.length} image(s) uploaded successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL for deletion
      const fileName = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('business-images').remove([fileName]);
      
      const updatedImages = images.filter(img => img !== imageUrl);
      onImagesChange(updatedImages);
      
      // If removed image was featured, set new featured image
      if (featuredImage === imageUrl) {
        onFeaturedImageChange(updatedImages.length > 0 ? updatedImages[0] : '');
      }
      
      toast({
        title: "Success",
        description: "Image removed successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const setFeaturedImage = (imageUrl: string) => {
    onFeaturedImageChange(imageUrl);
    toast({
      title: "Success",
      description: "Featured image updated."
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Business Images
        </label>
        <div className="space-y-4">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          </div>
          
          {images.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Uploaded Images ({images.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((imageUrl, index) => (
                  <Card key={index} className="relative group">
                    <CardContent className="p-2">
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={`Business image ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        
                        {/* Featured image indicator */}
                        {featuredImage === imageUrl && (
                          <div className="absolute top-1 left-1 bg-yellow-500 text-white p-1 rounded">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {featuredImage !== imageUrl && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setFeaturedImage(imageUrl)}
                              className="p-1 h-6 w-6"
                              title="Set as featured image"
                            >
                              <Star className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(imageUrl)}
                            className="p-1 h-6 w-6"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {featuredImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Featured Image</p>
                  <Card className="w-32">
                    <CardContent className="p-2">
                      <img
                        src={featuredImage}
                        alt="Featured business image"
                        className="w-full h-20 object-cover rounded"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;