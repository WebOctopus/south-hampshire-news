import { useRef, useState } from 'react';
import { Plus, X, GripVertical, Loader2, ImageIcon } from 'lucide-react';
import { useBusinessImageUpload } from '@/hooks/useBusinessImageUpload';
import { useToast } from '@/components/ui/use-toast';

interface BusinessGalleryEditorProps {
  businessId: string;
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 5 * 1024 * 1024;

export function BusinessGalleryEditor({
  businessId,
  images,
  onChange,
  disabled,
  maxImages = 12,
}: BusinessGalleryEditorProps) {
  const { uploadImage, deleteImage, isUploading } = useBusinessImageUpload();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const remaining = Math.max(0, maxImages - images.length);
  const canAdd = remaining > 0 && !disabled;

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const toUpload = Array.from(files).slice(0, remaining);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      if (file.size > MAX_BYTES) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB.`,
          variant: 'destructive',
        });
        continue;
      }
      const url = await uploadImage(file, businessId, 'gallery');
      if (url) uploaded.push(url);
    }
    if (uploaded.length) onChange([...images, ...uploaded]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async (index: number) => {
    const url = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    if (url) await deleteImage(url);
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(target, 0, moved);
    onChange(next);
    setDragIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {images.length} of {maxImages} images. Drag to reorder.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <div
            key={src + i}
            draggable={!disabled}
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
            className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border ${
              dragIndex === i ? 'opacity-50' : ''
            }`}
          >
            <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              disabled={disabled}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute top-2 left-2 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="aspect-[4/3] rounded-xl bg-muted/40 border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 mb-1 animate-spin" />
            ) : (
              <Plus className="h-6 w-6 mb-1" />
            )}
            <span className="text-sm font-medium">
              {isUploading ? 'Uploading…' : 'Add photo'}
            </span>
            <span className="text-xs">Max 5MB (JPG, PNG, WebP)</span>
          </button>
        )}

        {images.length === 0 && !canAdd && (
          <div className="aspect-[4/3] rounded-xl bg-muted/40 border flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6 mb-1" />
            <span className="text-sm">No images</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}