import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Star, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useFeaturedAdvertisers, useFeaturedAdvertiserMutations, FeaturedAdvertiser, FeaturedAdvertiserInput } from '@/hooks/useFeaturedAdvertisers';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
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
  advertiser: FeaturedAdvertiser;
  onEdit: (advertiser: FeaturedAdvertiser) => void;
  onDelete: (advertiser: FeaturedAdvertiser) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const SortableRow = ({ advertiser, onEdit, onDelete, onToggleActive }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: advertiser.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-muted-foreground">{advertiser.sort_order}</span>
        </div>
      </TableCell>
      <TableCell>
        <img
          src={advertiser.image_url}
          alt={advertiser.name}
          className="h-12 w-20 object-contain rounded bg-muted"
        />
      </TableCell>
      <TableCell className="font-medium">{advertiser.name}</TableCell>
      <TableCell>
        {advertiser.businesses ? (
          <Link
            to={`/business/${advertiser.business_id}`}
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {advertiser.businesses.name}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground italic">Not linked</span>
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={advertiser.is_active}
          onCheckedChange={(checked) => onToggleActive(advertiser.id, checked)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(advertiser)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(advertiser)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const FeaturedAdvertisersManagement = () => {
  const { data: advertisers, isLoading } = useFeaturedAdvertisers(true);
  const { createAdvertiser, updateAdvertiser, deleteAdvertiser, toggleActive, updateSortOrder, isCreating, isUpdating } = useFeaturedAdvertiserMutations();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<FeaturedAdvertiser | null>(null);
  const [businessSearchOpen, setBusinessSearchOpen] = useState(false);
  const [formData, setFormData] = useState<FeaturedAdvertiserInput>({
    name: '',
    image_url: '',
    business_id: null,
    is_active: true,
  });

  // Fetch businesses for the dropdown
  const { data: businesses } = useQuery({
    queryKey: ['businesses-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_businesses', {
        limit_count: 1000,
        offset_count: 0,
      });
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !advertisers) return;

    const oldIndex = advertisers.findIndex((a) => a.id === active.id);
    const newIndex = advertisers.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(advertisers, oldIndex, newIndex);

    const updates = reordered.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));

    updateSortOrder(updates);
  };

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `featured-${Date.now()}.${fileExt}`;
      const filePath = `featured-advertisers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      image_url: '',
      business_id: null,
      is_active: true,
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (advertiser: FeaturedAdvertiser) => {
    setSelectedAdvertiser(advertiser);
    setFormData({
      name: advertiser.name,
      image_url: advertiser.image_url,
      business_id: advertiser.business_id,
      is_active: advertiser.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (advertiser: FeaturedAdvertiser) => {
    setSelectedAdvertiser(advertiser);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActive({ id, is_active: isActive });
  };

  const handleCreate = () => {
    const maxOrder = advertisers?.reduce((max, a) => Math.max(max, a.sort_order), 0) || 0;
    createAdvertiser({ ...formData, sort_order: maxOrder + 1 });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedAdvertiser) return;
    updateAdvertiser({ id: selectedAdvertiser.id, ...formData });
    setIsEditDialogOpen(false);
    setSelectedAdvertiser(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedAdvertiser) return;
    deleteAdvertiser(selectedAdvertiser.id);
    setIsDeleteDialogOpen(false);
    setSelectedAdvertiser(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Featured Advertisers
              </CardTitle>
              <CardDescription>
                Manage the advertisers displayed on the homepage carousel. Drag to reorder.
              </CardDescription>
            </div>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Advertiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {advertisers && advertisers.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Order</TableHead>
                    <TableHead className="w-24">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Linked Business</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={advertisers.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                    {advertisers.map((advertiser) => (
                      <SortableRow
                        key={advertiser.id}
                        advertiser={advertiser}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No featured advertisers yet.</p>
              <p className="text-sm">Click "Add Advertiser" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Featured Advertiser</DialogTitle>
            <DialogDescription>Add a new advertiser to the homepage carousel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label htmlFor="name">Advertiser Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., DJ Summers Plumbing & Heating"
              />
            </div>
            <div className="space-y-2">
              <ImageDropzone
                label="Artwork Image *"
                value={formData.image_url}
                onUpload={handleImageUpload}
                onClear={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                aspectRatio="landscape"
                maxSizeMB={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Business Directory</Label>
              <Popover open={businessSearchOpen} onOpenChange={setBusinessSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={businessSearchOpen}
                    className="w-full justify-between font-normal"
                  >
                    {formData.business_id
                      ? businesses?.find((b) => b.id === formData.business_id)?.name || "Select a business..."
                      : "No business linked"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search businesses..." />
                    <CommandList>
                      <CommandEmpty>No business found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, business_id: null }));
                            setBusinessSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.business_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          No business linked
                        </CommandItem>
                        {businesses?.map((business) => (
                          <CommandItem
                            key={business.id}
                            value={business.name}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, business_id: business.id }));
                              setBusinessSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.business_id === business.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {business.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                When linked, clicking the advertiser on the homepage will navigate to their directory listing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active (visible on homepage)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || !formData.image_url || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Advertiser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Featured Advertiser</DialogTitle>
            <DialogDescription>Update the advertiser details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Advertiser Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., DJ Summers Plumbing & Heating"
              />
            </div>
            <div className="space-y-2">
              <ImageDropzone
                label="Artwork Image *"
                value={formData.image_url}
                onUpload={handleImageUpload}
                onClear={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                aspectRatio="landscape"
                maxSizeMB={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Business Directory</Label>
              <Popover open={businessSearchOpen} onOpenChange={setBusinessSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={businessSearchOpen}
                    className="w-full justify-between font-normal"
                  >
                    {formData.business_id
                      ? businesses?.find((b) => b.id === formData.business_id)?.name || "Select a business..."
                      : "No business linked"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search businesses..." />
                    <CommandList>
                      <CommandEmpty>No business found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, business_id: null }));
                            setBusinessSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.business_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          No business linked
                        </CommandItem>
                        {businesses?.map((business) => (
                          <CommandItem
                            key={business.id}
                            value={business.name}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, business_id: business.id }));
                              setBusinessSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.business_id === business.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {business.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                When linked, clicking the advertiser on the homepage will navigate to their directory listing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-active">Active (visible on homepage)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || !formData.image_url || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Advertiser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Featured Advertiser</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAdvertiser?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FeaturedAdvertisersManagement;
