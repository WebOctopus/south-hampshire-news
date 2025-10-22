import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Upload, Trash2, Eye, Image as ImageIcon, AlertCircle, Pencil } from 'lucide-react';
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

  const [editingSize, setEditingSize] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showEditDialog, setShowEditDialog] = useState(false);
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

  const handleEditClick = (size: any) => {
    setEditingSize(size);
    setSelectedFile(null);
    setPreviewUrl('');
    setShowEditDialog(true);
  };

  const handleUpload = () => {
    if (!selectedFile || !editingSize) {
      toast({
        title: "Missing Information",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const imageName = `${editingSize.name || 'Preview'} - ${selectedFile.name}`;

    uploadImage(
      {
        file: selectedFile,
        adSizeId: editingSize.id,
        imageName,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setPreviewUrl('');
          setEditingSize(null);
          setShowEditDialog(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          Manage custom advertisement images for each ad size shown in the Magazine Preview section.
        </p>
      </div>

      {/* Existing Images Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Images by Ad Size</CardTitle>
          <CardDescription>
            Click the edit button to upload or replace preview images for each ad size
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(size)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          {image ? 'Edit' : 'Upload'}
                        </Button>
                        {image && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(image)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
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

      {/* Edit/Upload Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {getImageForSize(editingSize?.id) ? 'Edit' : 'Upload'} Preview Image - {editingSize?.name}
            </DialogTitle>
            <DialogDescription>
              {editingSize?.dimensions} - Upload a high-quality image to preview in the Magazine Preview section
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
              </AlertDescription>
            </Alert>

            {/* Current Image Preview */}
            {getImageForSize(editingSize?.id) && !selectedFile && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Image</label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={getPublicUrl(getImageForSize(editingSize?.id)?.image_url)}
                    alt="Current preview"
                    className="max-h-64 mx-auto object-contain"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {getImageForSize(editingSize?.id) ? 'Replace with New Image' : 'Select Image File'}
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">New Image Preview</label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={previewUrl}
                    alt="New preview"
                    className="max-h-64 mx-auto object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCloseEditDialog}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {getImageForSize(editingSize?.id) ? 'Replace Image' : 'Upload Image'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
