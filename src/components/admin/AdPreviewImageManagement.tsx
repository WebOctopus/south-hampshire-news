import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, Trash2, Eye, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAdPreviewImages } from '@/hooks/useAdPreviewImages';
import { usePricingData } from '@/hooks/usePricingData';
import { useToast } from '@/hooks/use-toast';

export default function AdPreviewImageManagement() {
  const { toast } = useToast();
  const { adSizes, isLoading: loadingSizes } = usePricingData();
  const {
    previewImages,
    isLoading: loadingImages,
    uploadImage,
    isUploading,
    deleteImage,
    isDeleting,
    getPublicUrl,
  } = useAdPreviewImages();

  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedSizeId) {
      toast({
        title: "Missing Information",
        description: "Please select both an ad size and an image file",
        variant: "destructive",
      });
      return;
    }

    const adSize = adSizes?.find(size => size.id === selectedSizeId);
    const imageName = `${adSize?.name || 'Preview'} - ${selectedFile.name}`;

    uploadImage(
      {
        file: selectedFile,
        adSizeId: selectedSizeId,
        imageName,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setPreviewUrl('');
          setSelectedSizeId('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const handleDelete = (image: any) => {
    if (confirm('Are you sure you want to delete this preview image?')) {
      deleteImage(image);
    }
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImageUrl(getPublicUrl(imageUrl));
    setShowPreviewDialog(true);
  };

  // Get existing image for a size
  const getImageForSize = (sizeId: string) => {
    return previewImages?.find(img => img.ad_size_id === sizeId && img.is_active);
  };

  if (loadingSizes || loadingImages) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ad Preview Image Management</h2>
        <p className="text-muted-foreground">
          Upload custom advertisement images for each ad size to show in the Magazine Preview section.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Preview Image</CardTitle>
          <CardDescription>
            Select an ad size and upload an image to be displayed in the customer preview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              For best results, use high-quality images. Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Ad Size</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(e.target.value)}
              >
                <option value="">Choose an ad size...</option>
                {adSizes?.filter(size => size.is_active).map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name} ({size.dimensions})
                    {getImageForSize(size.id) ? ' - Has image' : ' - No image'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Image File</label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="border rounded-lg p-4 bg-muted/50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedSizeId || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
            {selectedFile && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Images Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Preview Images</CardTitle>
          <CardDescription>
            Manage uploaded preview images for each ad size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Size</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Image Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adSizes?.filter(size => size.is_active).map((size) => {
                const image = getImageForSize(size.id);
                return (
                  <TableRow key={size.id}>
                    <TableCell className="font-medium">{size.name}</TableCell>
                    <TableCell>{size.dimensions}</TableCell>
                    <TableCell>
                      {image ? (
                        <span className="text-sm">{image.image_name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {image ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">No Image</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {image ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(image.image_url)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {image ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(image)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {(!adSizes || adSizes.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No ad sizes found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Image</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={previewImageUrl}
              alt="Full preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
