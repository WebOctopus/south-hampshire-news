import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Plus, Edit, Trash2, Upload, Download, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { fixedRatesAdSizes, subscriptionAdSizes } from '@/data/advertisingPricing';
import { useUpdateAdSizePricing, usePricingInvalidation } from '@/hooks/usePricingMutations';

interface AdSize {
  id: string;
  name: string;
  dimensions: string;
  base_price_per_area: number;
  base_price_per_month: number;
  fixed_pricing_per_issue: Record<string, number>;
  subscription_pricing_per_issue: Record<string, number>;
  available_for: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface AdvertSizesPricingManagementProps {
  onStatsUpdate: () => void;
}

const AdvertSizesPricingManagement = ({ onStatsUpdate }: AdvertSizesPricingManagementProps) => {
  const [adSizes, setAdSizes] = useState<AdSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdSize, setEditingAdSize] = useState<AdSize | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dimensions: '',
    base_price_per_area: 0,
    base_price_per_month: 0,
    design_fee: 0,
    fixed_pricing_per_issue: {} as Record<string, number>,
    subscription_pricing_per_issue: {} as Record<string, number>,
    available_for: ['fixed', 'subscription'] as string[],
    is_active: true,
    sort_order: 0
  });
  const [bulkAdjustment, setBulkAdjustment] = useState({
    percentage: 0,
    type: 'increase' as 'increase' | 'decrease'
  });
  const { toast } = useToast();
  const updateAdSizePricingMutation = useUpdateAdSizePricing();
  const { invalidateSpecific } = usePricingInvalidation();
  
  // State for temporarily storing pricing updates before saving
  const [tempPricingUpdates, setTempPricingUpdates] = useState<Record<string, AdSize>>({});

  useEffect(() => {
    loadAdSizes();
    initializeDefaultAdSizes();
  }, []);

  const initializeDefaultAdSizes = async () => {
    try {
      // Check if ad sizes already exist
      const { data: existingAdSizes } = await supabase
        .from('ad_sizes')
        .select('id')
        .limit(1);

      if (existingAdSizes && existingAdSizes.length === 0) {
        // Import default ad sizes from advertisingPricing.ts
        const defaultAdSizes = fixedRatesAdSizes.map((adSize, index) => ({
          name: adSize.label,
          dimensions: adSize.dimensions,
          base_price_per_area: adSize.areaPricing.perArea[0], // First area price
          base_price_per_month: adSize.areaPricing.perMonth[0], // First area monthly price
          is_active: true,
          sort_order: index + 1
        }));

        const { error } = await supabase
          .from('ad_sizes')
          .insert(defaultAdSizes);

        if (error) {
          console.error('Error initializing default ad sizes:', error);
        } else {
          toast({
            title: "Default Ad Sizes Imported",
            description: `Successfully imported ${defaultAdSizes.length} default ad sizes.`
          });
          loadAdSizes();
        }
      }
    } catch (error) {
      console.error('Error initializing default ad sizes:', error);
    }
  };

  const loadAdSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_sizes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the data to ensure JSON fields are properly parsed
      const transformedData = (data || []).map(item => ({
        ...item,
        fixed_pricing_per_issue: typeof item.fixed_pricing_per_issue === 'string' 
          ? JSON.parse(item.fixed_pricing_per_issue || '{}')
          : (item.fixed_pricing_per_issue || {}),
        subscription_pricing_per_issue: typeof item.subscription_pricing_per_issue === 'string'
          ? JSON.parse(item.subscription_pricing_per_issue || '{}')
          : (item.subscription_pricing_per_issue || {}),
        available_for: Array.isArray(item.available_for) 
          ? item.available_for 
          : (typeof item.available_for === 'string' 
            ? JSON.parse(item.available_for || '["fixed", "subscription"]') 
            : ['fixed', 'subscription'])
      }));

      setAdSizes(transformedData);
      if (onStatsUpdate) {
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error loading ad sizes:', error);
      toast({
        title: "Error",
        description: "Failed to load ad sizes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dimensions: '',
      base_price_per_area: 0,
      base_price_per_month: 0,
      design_fee: 0,
      fixed_pricing_per_issue: {},
      subscription_pricing_per_issue: {},
      available_for: ['fixed', 'subscription'],
      is_active: true,
      sort_order: adSizes.length + 1
    });
    setEditingAdSize(null);
  };

  const openDialog = (adSize?: AdSize) => {
    if (adSize) {
      setEditingAdSize(adSize);
      setFormData({
        name: adSize.name,
        dimensions: adSize.dimensions,
        base_price_per_area: adSize.base_price_per_area,
        base_price_per_month: adSize.base_price_per_month,
        design_fee: (adSize as any).design_fee || 0,
        fixed_pricing_per_issue: adSize.fixed_pricing_per_issue || {},
        subscription_pricing_per_issue: adSize.subscription_pricing_per_issue || {},
        available_for: adSize.available_for || ['fixed', 'subscription'],
        is_active: adSize.is_active,
        sort_order: adSize.sort_order
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name || !formData.dimensions) {
        toast({
          title: "Validation Error",
          description: "Name and dimensions are required.",
          variant: "destructive"
        });
        return;
      }

      if (formData.base_price_per_area <= 0 && formData.base_price_per_month <= 0) {
        toast({
          title: "Validation Error",
          description: "At least one base price (fixed or subscription) must be greater than 0.",
          variant: "destructive"
        });
        return;
      }

      const adSizeData = {
        ...formData,
        base_price_per_area: Number(formData.base_price_per_area),
        base_price_per_month: Number(formData.base_price_per_month),
        sort_order: Number(formData.sort_order)
      };

      let error;
      
      if (editingAdSize) {
        const { error: updateError } = await supabase
          .from('ad_sizes')
          .update(adSizeData)
          .eq('id', editingAdSize.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('ad_sizes')
          .insert([adSizeData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Ad size ${editingAdSize ? 'updated' : 'created'} successfully. ${!editingAdSize ? 'Configure area-count pricing in Issue-Based Pricing section.' : ''}`
      });

      setIsDialogOpen(false);
      resetForm();
      await loadAdSizes();
      // Invalidate queries to refresh all components
      invalidateSpecific('adSizes');
    } catch (error: any) {
      console.error('Error saving ad size:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ad size.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (adSizeId: string) => {
    try {
      const { error } = await supabase
        .from('ad_sizes')
        .delete()
        .eq('id', adSizeId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Ad size deleted successfully."
      });

      await loadAdSizes();
      invalidateSpecific('adSizes');
    } catch (error: any) {
      console.error('Error deleting ad size:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete ad size.",
        variant: "destructive"
      });
    }
  };

  const handleBulkPriceAdjustment = async () => {
    if (bulkAdjustment.percentage === 0) return;

    try {
      const multiplier = bulkAdjustment.type === 'increase' 
        ? (1 + bulkAdjustment.percentage / 100)
        : (1 - bulkAdjustment.percentage / 100);

      const updates = adSizes.map(adSize => ({
        id: adSize.id,
        base_price_per_area: Math.round(adSize.base_price_per_area * multiplier * 100) / 100,
        base_price_per_month: Math.round(adSize.base_price_per_month * multiplier * 100) / 100
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('ad_sizes')
          .update({
            base_price_per_area: update.base_price_per_area,
            base_price_per_month: update.base_price_per_month
          })
          .eq('id', update.id);

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: `All prices ${bulkAdjustment.type}d by ${bulkAdjustment.percentage}% successfully.`
      });

      setBulkAdjustment({ percentage: 0, type: 'increase' });
      await loadAdSizes();
      invalidateSpecific('adSizes');
    } catch (error: any) {
      console.error('Error adjusting prices:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to adjust prices.",
        variant: "destructive"
      });
    }
  };

  const exportPricing = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Dimensions,Fixed Price,Subscription Price,Status\n" +
      adSizes.map(adSize => 
        `"${adSize.name}","${adSize.dimensions}",${adSize.base_price_per_area},${adSize.base_price_per_month},${adSize.is_active ? 'Active' : 'Inactive'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ad-sizes-pricing.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle updating issue pricing in local state
  const handleUpdateIssuePricing = (adSizeId: string, field: 'fixed_pricing_per_issue' | 'subscription_pricing_per_issue', updatedPricing: Record<string, number>) => {
    const currentAdSize = adSizes.find(size => size.id === adSizeId);
    if (!currentAdSize) return;

    const updatedAdSize = {
      ...currentAdSize,
      [field]: updatedPricing
    };

    // Update local state
    setAdSizes(prevSizes => 
      prevSizes.map(size => 
        size.id === adSizeId ? updatedAdSize : size
      )
    );

    // Track changes for bulk save
    setTempPricingUpdates(prev => ({
      ...prev,
      [adSizeId]: updatedAdSize
    }));
  };

  // Save pricing changes to database
  const saveIssuePricing = async (adSizeId: string) => {
    try {
      const updatedAdSize = tempPricingUpdates[adSizeId] || adSizes.find(size => size.id === adSizeId);
      if (!updatedAdSize) return;

      await updateAdSizePricingMutation.mutateAsync({
        adSizeId,
        fixedPricing: updatedAdSize.fixed_pricing_per_issue,
        subscriptionPricing: updatedAdSize.subscription_pricing_per_issue
      });

      // Remove from temp updates
      setTempPricingUpdates(prev => {
        const updated = { ...prev };
        delete updated[adSizeId];
        return updated;
      });

      // Reload the data to ensure consistency
      await loadAdSizes();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">Loading ad sizes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-community-navy flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ad Sizes & Pricing Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage advertisement sizes and their pricing structure
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPricing}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Ad Size
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAdSize ? 'Edit Ad Size' : 'Add New Ad Size'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Ad Size Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Full Page"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dimensions">Dimensions *</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="e.g., 132 x 190"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price_per_area">Fixed Price (£)</Label>
                    <Input
                      id="base_price_per_area"
                      type="number"
                      step="0.01"
                      value={formData.base_price_per_area}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price_per_area: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="base_price_per_month">Subscription Price (£)</Label>
                    <Input
                      id="base_price_per_month"
                      type="number"
                      step="0.01"
                      value={formData.base_price_per_month}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price_per_month: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="design_fee">Artwork Design Fee (£)</Label>
                  <Input
                    id="design_fee"
                    type="number"
                    step="0.01"
                    value={formData.design_fee || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, design_fee: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g., 50.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One-time fee charged if customer needs design services
                  </p>
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Available For</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fixed_available"
                        checked={formData.available_for.includes('fixed')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              available_for: [...prev.available_for.filter(type => type !== 'fixed'), 'fixed']
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              available_for: prev.available_for.filter(type => type !== 'fixed')
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="fixed_available" className="text-sm font-normal">Fixed Pricing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="subscription_available"
                        checked={formData.available_for.includes('subscription')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              available_for: [...prev.available_for.filter(type => type !== 'subscription'), 'subscription']
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              available_for: prev.available_for.filter(type => type !== 'subscription')
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="subscription_available" className="text-sm font-normal">Subscription Pricing</Label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which pricing types this ad size should be available for
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    {editingAdSize ? 'Update' : 'Create'} Ad Size
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Ad Sizes</TabsTrigger>
          <TabsTrigger value="issues">Issue-Based Pricing</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Price Tools</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {/* Current Ad Sizes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ad Sizes ({adSizes.length})</span>
                <Badge variant="outline">
                  Avg Fixed: £{adSizes.length > 0 ? Math.round(adSizes.reduce((sum, size) => sum + size.base_price_per_area, 0) / adSizes.length) : 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adSizes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No ad sizes found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Fixed Price</TableHead>
                        <TableHead>Subscription Price</TableHead>
                        <TableHead>Available For</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adSizes.map((adSize) => (
                        <TableRow key={adSize.id}>
                          <TableCell className="font-medium">{adSize.name}</TableCell>
                          <TableCell>{adSize.dimensions}</TableCell>
                          <TableCell>£{adSize.base_price_per_area.toFixed(2)}</TableCell>
                          <TableCell>£{adSize.base_price_per_month.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {adSize.available_for?.includes('fixed') && (
                                <Badge variant="outline" className="text-xs">Fixed</Badge>
                              )}
                              {adSize.available_for?.includes('subscription') && (
                                <Badge variant="outline" className="text-xs">Subscription</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={adSize.is_active ? "default" : "secondary"}
                              className={adSize.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {adSize.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{adSize.sort_order}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialog(adSize)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Ad Size</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{adSize.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(adSize.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
        </TabsContent>

        <TabsContent value="issues">
          {/* Issue-Based Pricing Management with Accordion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Issue-Based Pricing Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure pricing for each ad size based on number of issues. Click to expand each section.
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {adSizes.map((adSize) => (
                  <AccordionItem key={adSize.id} value={adSize.id} className="border rounded-lg mb-4 last:mb-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline bg-muted/50 rounded-t-lg data-[state=open]:rounded-b-none">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">{adSize.name}</span>
                          <Badge variant="outline" className="bg-background">
                            {adSize.dimensions}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            Fixed: £{adSize.base_price_per_area.toFixed(2)}
                          </span>
                          <span>•</span>
                          <span>
                            Subscription: £{adSize.base_price_per_month.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 bg-background rounded-b-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Fixed Rates Table */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-community-navy flex items-center gap-2">
                            Fixed Rates
                            <Badge variant="secondary" className="text-xs">
                              One-time booking
                            </Badge>
                          </h3>
                          <div className="overflow-x-auto">
                            <Table className="text-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-20">Issues</TableHead>
                                  <TableHead>Per Issue (£)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Array.from({ length: 14 }, (_, i) => i + 1).map((issueCount) => {
                                  const currentPrice = adSize.fixed_pricing_per_issue?.[issueCount.toString()] || 0;
                                  return (
                                    <TableRow key={`fixed-${issueCount}`}>
                                      <TableCell className="font-medium">{issueCount}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={currentPrice}
                                          onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value) || 0;
                                            const updatedPricing = {
                                              ...adSize.fixed_pricing_per_issue,
                                              [issueCount.toString()]: newPrice
                                            };
                                            handleUpdateIssuePricing(adSize.id, 'fixed_pricing_per_issue', updatedPricing);
                                          }}
                                          className="w-full h-8"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Subscription Rates Table */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-community-navy flex items-center gap-2">
                            Subscription Rates
                            <Badge variant="secondary" className="text-xs">
                              Monthly subscription
                            </Badge>
                          </h3>
                          <div className="overflow-x-auto">
                            <Table className="text-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-20">Issues</TableHead>
                                  <TableHead>Per Issue (£)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Array.from({ length: 14 }, (_, i) => i + 1).map((issueCount) => {
                                  const currentPrice = adSize.subscription_pricing_per_issue?.[issueCount.toString()] || 0;
                                  return (
                                    <TableRow key={`subscription-${issueCount}`}>
                                      <TableCell className="font-medium">{issueCount}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={currentPrice}
                                          onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value) || 0;
                                            const updatedPricing = {
                                              ...adSize.subscription_pricing_per_issue,
                                              [issueCount.toString()]: newPrice
                                            };
                                            handleUpdateIssuePricing(adSize.id, 'subscription_pricing_per_issue', updatedPricing);
                                          }}
                                          className="w-full h-8"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t">
                        <Button 
                          onClick={() => saveIssuePricing(adSize.id)}
                          className="w-full"
                          variant={tempPricingUpdates[adSize.id] ? "default" : "outline"}
                        >
                          {tempPricingUpdates[adSize.id] ? "Save Changes" : "No Changes"} - {adSize.name} Pricing
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          {/* Bulk Price Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Bulk Price Adjustment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Apply percentage increases or decreases to all ad size prices at once.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adjustment_type">Adjustment Type</Label>
                  <select
                    id="adjustment_type"
                    className="w-full p-2 border rounded-md"
                    value={bulkAdjustment.type}
                    onChange={(e) => setBulkAdjustment(prev => ({ ...prev, type: e.target.value as 'increase' | 'decrease' }))}
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="adjustment_percentage">Percentage (%)</Label>
                  <Input
                    id="adjustment_percentage"
                    type="number"
                    step="0.1"
                    value={bulkAdjustment.percentage}
                    onChange={(e) => setBulkAdjustment(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g., 5.0"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleBulkPriceAdjustment}
                    disabled={bulkAdjustment.percentage === 0}
                    className="w-full"
                  >
                    Apply {bulkAdjustment.type === 'increase' ? 'Increase' : 'Decrease'}
                  </Button>
                </div>
              </div>

              {bulkAdjustment.percentage > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> All prices will be {bulkAdjustment.type}d by {bulkAdjustment.percentage}%.
                    {adSizes.length > 0 && (
                      <span>
                        {' '}For example, £{adSizes[0]?.base_price_per_area?.toFixed(2)} will become £
                        {(adSizes[0]?.base_price_per_area * (bulkAdjustment.type === 'increase' 
                          ? (1 + bulkAdjustment.percentage / 100)
                          : (1 - bulkAdjustment.percentage / 100))).toFixed(2)}.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          {/* Import/Export Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import/Export Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Export Current Pricing</h3>
                  <p className="text-sm text-gray-600">
                    Download current ad sizes and pricing as CSV for backup or analysis.
                  </p>
                  <Button variant="outline" onClick={exportPricing} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Import from Excel Data</h3>
                  <p className="text-sm text-gray-600">
                    Reset to default pricing from the uploaded Excel sheet.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Excel import functionality will be available in the next update."
                      });
                    }}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import from Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvertSizesPricingManagement;