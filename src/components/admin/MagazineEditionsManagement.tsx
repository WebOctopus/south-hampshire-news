import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useMagazineEditions, useMagazineEditionMutations, useMagazineImageUpload, MagazineEdition } from '@/hooks/useMagazineEditions';
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Upload, X, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRowProps {
  edition: MagazineEdition;
  onEdit: (edition: MagazineEdition) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const SortableRow = ({ edition, onEdit, onDelete, onToggleActive }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: edition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'hsl(var(--muted))' : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span>{edition.sort_order}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="w-16 h-20 rounded overflow-hidden bg-muted">
          <img 
            src={edition.image_url} 
            alt={edition.alt_text || edition.title}
            className="w-full h-full object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{edition.title}</TableCell>
      <TableCell>{edition.issue_month || '-'}</TableCell>
      <TableCell>
        {edition.link_url ? (
          <a 
            href={edition.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Link
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={edition.is_active}
          onCheckedChange={(checked) => onToggleActive(edition.id, checked)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(edition)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(edition.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const MagazineEditionsManagement = () => {
  const { data: editions, isLoading } = useMagazineEditions(true);
  const { createEdition, updateEdition, deleteEdition, toggleActive, updateSortOrder } = useMagazineEditionMutations();
  const { uploadCoverImage, isUploading } = useMagazineImageUpload();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEdition, setEditingEdition] = useState<MagazineEdition | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    alt_text: '',
    link_url: '',
    issue_month: '',
    sort_order: 0,
    is_active: true,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      alt_text: '',
      link_url: '',
      issue_month: '',
      sort_order: editions?.length ? editions.length + 1 : 1,
      is_active: true,
    });
    setEditingEdition(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleOpenDialog = (edition?: MagazineEdition) => {
    if (edition) {
      setEditingEdition(edition);
      setFormData({
        title: edition.title,
        image_url: edition.image_url,
        alt_text: edition.alt_text || '',
        link_url: edition.link_url || '',
        issue_month: edition.issue_month || '',
        sort_order: edition.sort_order,
        is_active: edition.is_active,
      });
      setPreviewUrl(edition.image_url);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(editingEdition?.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    let imageUrl = formData.image_url;

    // Upload new file if selected
    if (selectedFile) {
      const uploadedUrl = await uploadCoverImage(selectedFile);
      if (!uploadedUrl) return; // Upload failed
      imageUrl = uploadedUrl;
    }

    if (editingEdition) {
      await updateEdition.mutateAsync({
        id: editingEdition.id,
        ...formData,
        image_url: imageUrl,
        alt_text: formData.alt_text || null,
        link_url: formData.link_url || null,
        issue_month: formData.issue_month || null,
      });
    } else {
      await createEdition.mutateAsync({
        ...formData,
        image_url: imageUrl,
        alt_text: formData.alt_text || null,
        link_url: formData.link_url || null,
        issue_month: formData.issue_month || null,
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this edition?')) {
      await deleteEdition.mutateAsync(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && editions) {
      const oldIndex = editions.findIndex((e) => e.id === active.id);
      const newIndex = editions.findIndex((e) => e.id === over.id);
      
      const reordered = arrayMove(editions, oldIndex, newIndex);
      
      // Create updates with new sort_order values
      const updates = reordered.map((edition, index) => ({
        id: edition.id,
        sort_order: index + 1,
      }));
      
      updateSortOrder.mutate(updates);
    }
  };

  const isFormValid = formData.title && (selectedFile || formData.image_url);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Magazine Editions</h2>
          <p className="text-muted-foreground">Manage the magazine covers displayed on the homepage carousel. Drag to reorder.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Edition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingEdition ? 'Edit Edition' : 'Add New Edition'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Edition Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., WINCHESTER & SURROUNDS"
                />
              </div>
              
              {/* Drag and Drop Upload Zone */}
              <div>
                <Label>Cover Image</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-40 rounded-lg mx-auto"
                      />
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSelectedFile();
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedFile ? selectedFile.name : 'Current image'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop an image here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        JPG, PNG, or WebP • Max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="issue_month">Issue Month</Label>
                <Input
                  id="issue_month"
                  value={formData.issue_month}
                  onChange={(e) => setFormData({ ...formData, issue_month: e.target.value })}
                  placeholder="e.g., January 2025"
                />
              </div>
              <div>
                <Label htmlFor="alt_text">Alt Text (Accessibility)</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  placeholder="Discover Magazine - Winchester Edition"
                />
              </div>
              <div>
                <Label htmlFor="link_url">Link URL (Optional)</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || isUploading || createEdition.isPending || updateEdition.isPending}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : editingEdition ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Editions ({editions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!editions?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No editions found. Add your first edition above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead className="w-24">Preview</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Issue Month</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={editions.map(e => e.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {editions.map((edition) => (
                        <SortableRow
                          key={edition.id}
                          edition={edition}
                          onEdit={handleOpenDialog}
                          onDelete={handleDelete}
                          onToggleActive={(id, isActive) => toggleActive.mutate({ id, is_active: isActive })}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MagazineEditionsManagement;
