import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { useProductPackages, useUpdateProductPackage, useCreateProductPackage, useDeleteProductPackage, type ProductPackage, type ProductPackageFeature } from '@/hooks/useProductPackages';
import { iconOptions, getIcon } from '@/lib/iconMap';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ProductDesignerManagement = () => {
  const { data: packages, isLoading } = useProductPackages(true);
  const updatePackage = useUpdateProductPackage();
  const createPackage = useCreateProductPackage();
  const deletePackage = useDeleteProductPackage();
  const { toast } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<ProductPackage>>({
    package_id: '',
    title: '',
    subtitle: '',
    description: '',
    icon: 'Target',
    badge_text: '',
    badge_variant: 'default',
    cta_text: 'SELECT',
    is_popular: false,
    is_active: true,
    sort_order: 0,
    features: [],
  });

  const handleEdit = (pkg: ProductPackage) => {
    setSelectedPackage(pkg);
    setFormData(pkg);
    setIsCreating(false);
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPackage(null);
    setFormData({
      package_id: '',
      title: '',
      subtitle: '',
      description: '',
      icon: 'Target',
      badge_text: '',
      badge_variant: 'default',
      cta_text: 'SELECT',
      is_popular: false,
      is_active: true,
      sort_order: packages ? packages.length + 1 : 1,
      features: [],
    });
    setIsCreating(true);
    setEditDialogOpen(true);
  };

  const handleDelete = (pkg: ProductPackage) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPackage) {
      deletePackage.mutate(selectedPackage.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = () => {
    if (isCreating) {
      createPackage.mutate(formData as Omit<ProductPackage, 'id' | 'created_at' | 'updated_at'>);
    } else if (selectedPackage) {
      updatePackage.mutate({ ...formData, id: selectedPackage.id });
    }
    setEditDialogOpen(false);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), { label: '', value: '', highlight: false }],
    });
  };

  const updateFeature = (index: number, field: keyof ProductPackageFeature, value: string | boolean) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const toggleFeatureType = (index: number) => {
    const feature = formData.features?.[index];
    if (feature) {
      const newValue = typeof feature.value === 'boolean' ? '' : true;
      updateFeature(index, 'value', newValue);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const IconComponent = getIcon(formData.icon || 'Target');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Packages</h3>
          <p className="text-sm text-muted-foreground">
            Manage the pricing options shown to customers on Step 1
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Package ID</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages?.map((pkg) => {
                const Icon = getIcon(pkg.icon);
                return (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{pkg.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{pkg.package_id}</code>
                    </TableCell>
                    <TableCell>
                      {pkg.badge_text && (
                        <Badge variant={pkg.badge_variant as any}>{pkg.badge_text}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {pkg.is_popular && <Badge>Popular</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{pkg.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create' : 'Edit'} Product Package</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Create a new' : 'Edit the'} product package display settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package ID</Label>
                <Input
                  value={formData.package_id}
                  onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                  placeholder="fixed, bogof, leafleting"
                  disabled={!isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  Must match backend pricing logic (fixed/bogof/leafleting)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Fixed Term"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Predictable reach at a fixed term"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Perfect for time-sensitive campaigns..."
              />
            </div>

            {/* Badge Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Badge Text (optional)</Label>
                <Input
                  value={formData.badge_text || ''}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  placeholder="Star Buy"
                />
              </div>

              <div className="space-y-2">
                <Label>Badge Variant</Label>
                <Select value={formData.badge_variant} onValueChange={(value) => setFormData({ ...formData, badge_variant: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="destructive">Destructive</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CTA and Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                  />
                  <Label>Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>

            {/* Features Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Feature label"
                        value={feature.label}
                        onChange={(e) => updateFeature(index, 'label', e.target.value)}
                      />
                      {typeof feature.value === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={feature.value}
                            onCheckedChange={(checked) => updateFeature(index, 'value', checked)}
                          />
                          <span className="text-sm">Boolean</span>
                        </div>
                      ) : (
                        <Input
                          placeholder="Feature value"
                          value={feature.value as string}
                          onChange={(e) => updateFeature(index, 'value', e.target.value)}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={feature.highlight}
                          onCheckedChange={(checked) => updateFeature(index, 'highlight', checked)}
                        />
                        <Label className="text-xs">Highlight</Label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatureType(index)}
                    >
                      {typeof feature.value === 'boolean' ? 'Text' : 'Bool'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">{formData.title || 'Title'}</CardTitle>
                      <CardDescription>{formData.subtitle || 'Subtitle'}</CardDescription>
                    </div>
                  </div>
                  {formData.badge_text && (
                    <Badge variant={formData.badge_variant as any}>{formData.badge_text}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {formData.description || 'Description'}
                </p>
                <Button className="w-full mb-4">{formData.cta_text}</Button>
                <div className="space-y-1">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className={feature.highlight ? 'font-medium' : ''}>{feature.label}</span>
                      <span className={feature.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}>
                        {typeof feature.value === 'boolean' ? (feature.value ? '✓' : '✗') : feature.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Package?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the package from customers. You can reactivate it later by editing it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDesignerManagement;
