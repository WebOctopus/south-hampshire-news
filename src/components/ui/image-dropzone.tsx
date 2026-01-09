import { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  value?: string;
  onUpload: (file: File) => Promise<string | null>;
  onClear?: () => void;
  label?: string;
  aspectRatio?: 'square' | 'landscape' | 'auto';
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

export function ImageDropzone({
  value,
  onUpload,
  onClear,
  label = 'Upload Image',
  aspectRatio = 'auto',
  maxSizeMB = 5,
  disabled = false,
  className,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl || value;

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, GIF, or WebP)';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        setPreviewUrl(null); // Clear preview, value will update
      } else {
        setPreviewUrl(null);
      }
    } catch (err) {
      setPreviewUrl(null);
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }, [onUpload, maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleClick = () => {
    if (disabled || isUploading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onClear?.();
  };

  const aspectClass = aspectRatio === 'square' 
    ? 'aspect-square' 
    : aspectRatio === 'landscape' 
      ? 'aspect-video' 
      : 'min-h-[120px]';

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden",
          aspectClass,
          isDragging && "border-primary bg-primary/5",
          !isDragging && !displayUrl && "border-muted-foreground/25 hover:border-muted-foreground/50",
          displayUrl && "border-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "pointer-events-none"
        )}
      >
        {displayUrl ? (
          <div className="relative w-full h-full">
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!isUploading && onClear && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground p-4">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm text-center">
                  Drag & drop or click to upload
                </span>
                <span className="text-xs">
                  Max {maxSizeMB}MB (JPG, PNG, GIF, WebP)
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
