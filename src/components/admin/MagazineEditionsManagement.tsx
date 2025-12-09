import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useMagazineEditions, useMagazineEditionMutations, MagazineEdition } from '@/hooks/useMagazineEditions';
import { Plus, Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const MagazineEditionsManagement = () => {
  const { data: editions, isLoading } = useMagazineEditions(true);
  const { createEdition, updateEdition, deleteEdition, toggleActive } = useMagazineEditionMutations();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEdition, setEditingEdition] = useState<MagazineEdition | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    alt_text: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      alt_text: '',
      link_url: '',
      sort_order: editions?.length ? editions.length + 1 : 1,
      is_active: true,
    });
    setEditingEdition(null);
  };

  const handleOpenDialog = (edition?: MagazineEdition) => {
    if (edition) {
      setEditingEdition(edition);
      setFormData({
        title: edition.title,
        image_url: edition.image_url,
        alt_text: edition.alt_text || '',
        link_url: edition.link_url || '',
        sort_order: edition.sort_order,
        is_active: edition.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingEdition) {
      await updateEdition.mutateAsync({
        id: editingEdition.id,
        ...formData,
        alt_text: formData.alt_text || null,
        link_url: formData.link_url || null,
      });
    } else {
      await createEdition.mutateAsync({
        ...formData,
        alt_text: formData.alt_text || null,
        link_url: formData.link_url || null,
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
          <p className="text-muted-foreground">Manage the magazine covers displayed on the homepage carousel.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/lovable-uploads/..."
                />
                {formData.image_url && (
                  <div className="mt-2 border rounded-lg overflow-hidden w-32">
                    <img src={formData.image_url} alt="Preview" className="w-full h-auto" />
                  </div>
                )}
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
                disabled={!formData.title || !formData.image_url || createEdition.isPending || updateEdition.isPending}
              >
                {editingEdition ? 'Update' : 'Create'}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Order</TableHead>
                    <TableHead className="w-24">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editions.map((edition) => (
                    <TableRow key={edition.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
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
                          onCheckedChange={(checked) => toggleActive.mutate({ id: edition.id, is_active: checked })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(edition)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(edition.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MagazineEditionsManagement;
