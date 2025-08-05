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
import { Clock, Plus, Edit, Trash2, Percent, Target, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Duration {
  id: string;
  name: string;
  duration_type: string;
  duration_value: number;
  discount_percentage: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface VolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SpecialDeal {
  id: string;
  name: string;
  description: string;
  deal_type: string;
  deal_value: number;
  min_areas: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionSettingsManagementProps {
  onStatsUpdate: () => void;
}

const SubscriptionSettingsManagement = ({ onStatsUpdate }: SubscriptionSettingsManagementProps) => {
  const [durations, setDurations] = useState<Duration[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>([]);
  const [specialDeals, setSpecialDeals] = useState<SpecialDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('durations');

  // Dialog states
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const [isVolumeDialogOpen, setIsVolumeDialogOpen] = useState(false);
  const [isSpecialDealDialogOpen, setIsSpecialDealDialogOpen] = useState(false);

  // Editing states
  const [editingDuration, setEditingDuration] = useState<Duration | null>(null);
  const [editingVolumeDiscount, setEditingVolumeDiscount] = useState<VolumeDiscount | null>(null);
  const [editingSpecialDeal, setEditingSpecialDeal] = useState<SpecialDeal | null>(null);

  // Form states
  const [durationForm, setDurationForm] = useState({
    name: '',
    duration_type: 'subscription',
    duration_value: 6,
    discount_percentage: 0,
    is_active: true,
    sort_order: 0
  });

  const [volumeDiscountForm, setVolumeDiscountForm] = useState({
    min_areas: 1,
    max_areas: 5,
    discount_percentage: 5,
    is_active: true
  });

  const [specialDealForm, setSpecialDealForm] = useState({
    name: '',
    description: '',
    deal_type: 'percentage',
    deal_value: 0,
    min_areas: 1,
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
    initializeDefaultData();
  }, []);

  const initializeDefaultData = async () => {
    try {
      // Check if data already exists
      const { data: existingDurations } = await supabase
        .from('pricing_durations')
        .select('id')
        .limit(1);

      const { data: existingVolumeDiscounts } = await supabase
        .from('volume_discounts')
        .select('id')
        .limit(1);

      // Initialize durations if none exist
      if (existingDurations && existingDurations.length === 0) {
        const defaultDurations = [
          { name: '1 Issue', duration_type: 'fixed', duration_value: 1, discount_percentage: 0, is_active: true, sort_order: 1 },
          { name: '2 Issues', duration_type: 'fixed', duration_value: 2, discount_percentage: 10, is_active: true, sort_order: 2 },
          { name: '3 Issues', duration_type: 'fixed', duration_value: 3, discount_percentage: 15, is_active: true, sort_order: 3 },
          { name: '6 Months', duration_type: 'subscription', duration_value: 6, discount_percentage: 20, is_active: true, sort_order: 4 },
          { name: '12 Months', duration_type: 'subscription', duration_value: 12, discount_percentage: 25, is_active: true, sort_order: 5 }
        ];

        await supabase.from('pricing_durations').insert(defaultDurations);
      }

      // Initialize volume discounts if none exist
      if (existingVolumeDiscounts && existingVolumeDiscounts.length === 0) {
        const defaultVolumeDiscounts = [
          { min_areas: 1, max_areas: 2, discount_percentage: 0, is_active: true },
          { min_areas: 3, max_areas: 5, discount_percentage: 5, is_active: true },
          { min_areas: 6, max_areas: 9, discount_percentage: 10, is_active: true },
          { min_areas: 10, max_areas: 14, discount_percentage: 15, is_active: true }
        ];

        await supabase.from('volume_discounts').insert(defaultVolumeDiscounts);
      }

      loadAllData();
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  };

  const loadAllData = async () => {
    try {
      const [durationsData, volumeDiscountsData, specialDealsData] = await Promise.all([
        supabase.from('pricing_durations').select('*').order('sort_order'),
        supabase.from('volume_discounts').select('*').order('min_areas'),
        supabase.from('special_deals').select('*').order('created_at', { ascending: false })
      ]);

      setDurations(durationsData.data || []);
      setVolumeDiscounts(volumeDiscountsData.data || []);
      setSpecialDeals(specialDealsData.data || []);
      onStatsUpdate();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Duration management functions
  const resetDurationForm = () => {
    setDurationForm({
      name: '',
      duration_type: 'subscription',
      duration_value: 6,
      discount_percentage: 0,
      is_active: true,
      sort_order: durations.length + 1
    });
    setEditingDuration(null);
  };

  const openDurationDialog = (duration?: Duration) => {
    if (duration) {
      setEditingDuration(duration);
      setDurationForm({
        name: duration.name,
        duration_type: duration.duration_type,
        duration_value: duration.duration_value,
        discount_percentage: duration.discount_percentage,
        is_active: duration.is_active,
        sort_order: duration.sort_order
      });
    } else {
      resetDurationForm();
    }
    setIsDurationDialogOpen(true);
  };

  const handleSaveDuration = async () => {
    try {
      let error;
      
      if (editingDuration) {
        const { error: updateError } = await supabase
          .from('pricing_durations')
          .update(durationForm)
          .eq('id', editingDuration.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('pricing_durations')
          .insert([durationForm]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Duration ${editingDuration ? 'updated' : 'created'} successfully.`
      });

      setIsDurationDialogOpen(false);
      resetDurationForm();
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save duration.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDuration = async (durationId: string) => {
    try {
      const { error } = await supabase
        .from('pricing_durations')
        .delete()
        .eq('id', durationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Duration deleted successfully."
      });

      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete duration.",
        variant: "destructive"
      });
    }
  };

  // Volume discount management functions
  const resetVolumeDiscountForm = () => {
    setVolumeDiscountForm({
      min_areas: 1,
      max_areas: 5,
      discount_percentage: 5,
      is_active: true
    });
    setEditingVolumeDiscount(null);
  };

  const openVolumeDiscountDialog = (volumeDiscount?: VolumeDiscount) => {
    if (volumeDiscount) {
      setEditingVolumeDiscount(volumeDiscount);
      setVolumeDiscountForm({
        min_areas: volumeDiscount.min_areas,
        max_areas: volumeDiscount.max_areas || 0,
        discount_percentage: volumeDiscount.discount_percentage,
        is_active: volumeDiscount.is_active
      });
    } else {
      resetVolumeDiscountForm();
    }
    setIsVolumeDialogOpen(true);
  };

  const handleSaveVolumeDiscount = async () => {
    try {
      let error;
      
      if (editingVolumeDiscount) {
        const { error: updateError } = await supabase
          .from('volume_discounts')
          .update(volumeDiscountForm)
          .eq('id', editingVolumeDiscount.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('volume_discounts')
          .insert([volumeDiscountForm]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Volume discount ${editingVolumeDiscount ? 'updated' : 'created'} successfully.`
      });

      setIsVolumeDialogOpen(false);
      resetVolumeDiscountForm();
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save volume discount.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVolumeDiscount = async (volumeDiscountId: string) => {
    try {
      const { error } = await supabase
        .from('volume_discounts')
        .delete()
        .eq('id', volumeDiscountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Volume discount deleted successfully."
      });

      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete volume discount.",
        variant: "destructive"
      });
    }
  };

  // Special deal management functions
  const resetSpecialDealForm = () => {
    setSpecialDealForm({
      name: '',
      description: '',
      deal_type: 'percentage',
      deal_value: 0,
      min_areas: 1,
      valid_from: '',
      valid_until: '',
      is_active: true
    });
    setEditingSpecialDeal(null);
  };

  const openSpecialDealDialog = (specialDeal?: SpecialDeal) => {
    if (specialDeal) {
      setEditingSpecialDeal(specialDeal);
      setSpecialDealForm({
        name: specialDeal.name,
        description: specialDeal.description || '',
        deal_type: specialDeal.deal_type,
        deal_value: specialDeal.deal_value,
        min_areas: specialDeal.min_areas || 1,
        valid_from: specialDeal.valid_from ? specialDeal.valid_from.split('T')[0] : '',
        valid_until: specialDeal.valid_until ? specialDeal.valid_until.split('T')[0] : '',
        is_active: specialDeal.is_active
      });
    } else {
      resetSpecialDealForm();
    }
    setIsSpecialDealDialogOpen(true);
  };

  const handleSaveSpecialDeal = async () => {
    try {
      const dealData = {
        ...specialDealForm,
        valid_from: specialDealForm.valid_from || null,
        valid_until: specialDealForm.valid_until || null
      };

      let error;
      
      if (editingSpecialDeal) {
        const { error: updateError } = await supabase
          .from('special_deals')
          .update(dealData)
          .eq('id', editingSpecialDeal.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('special_deals')
          .insert([dealData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Special deal ${editingSpecialDeal ? 'updated' : 'created'} successfully.`
      });

      setIsSpecialDealDialogOpen(false);
      resetSpecialDealForm();
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save special deal.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSpecialDeal = async (specialDealId: string) => {
    try {
      const { error } = await supabase
        .from('special_deals')
        .delete()
        .eq('id', specialDealId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Special deal deleted successfully."
      });

      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete special deal.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">Loading subscription settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-community-navy flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Subscription Settings Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage subscription durations, volume discounts, and special deals
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="durations" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Durations
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Volume Discounts
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Special Deals
          </TabsTrigger>
        </TabsList>

        {/* Duration Management */}
        <TabsContent value="durations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subscription Durations ({durations.length})</span>
                <Dialog open={isDurationDialogOpen} onOpenChange={setIsDurationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openDurationDialog()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Duration
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDuration ? 'Edit Duration' : 'Add New Duration'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="duration_name">Duration Name *</Label>
                        <Input
                          id="duration_name"
                          value={durationForm.name}
                          onChange={(e) => setDurationForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., 6 Months"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration_type">Type</Label>
                          <select
                            id="duration_type"
                            className="w-full p-2 border rounded-md"
                            value={durationForm.duration_type}
                            onChange={(e) => setDurationForm(prev => ({ ...prev, duration_type: e.target.value }))}
                          >
                            <option value="fixed">Fixed (Issues)</option>
                            <option value="subscription">Subscription (Months)</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="duration_value">Value</Label>
                          <Input
                            id="duration_value"
                            type="number"
                            value={durationForm.duration_value}
                            onChange={(e) => setDurationForm(prev => ({ ...prev, duration_value: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration_discount">Discount (%)</Label>
                          <Input
                            id="duration_discount"
                            type="number"
                            step="0.1"
                            value={durationForm.discount_percentage}
                            onChange={(e) => setDurationForm(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration_sort">Sort Order</Label>
                          <Input
                            id="duration_sort"
                            type="number"
                            value={durationForm.sort_order}
                            onChange={(e) => setDurationForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="duration_active"
                          checked={durationForm.is_active}
                          onCheckedChange={(checked) => setDurationForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="duration_active">Active</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveDuration} className="flex-1">
                          {editingDuration ? 'Update' : 'Create'} Duration
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDurationDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {durations.map((duration) => (
                    <TableRow key={duration.id}>
                      <TableCell className="font-medium">{duration.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {duration.duration_type === 'subscription' ? 'Subscription' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {duration.duration_value} {duration.duration_type === 'subscription' ? 'months' : 'issues'}
                      </TableCell>
                      <TableCell>{duration.discount_percentage}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={duration.is_active ? "default" : "secondary"}
                          className={duration.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {duration.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDurationDialog(duration)}
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
                                <AlertDialogTitle>Delete Duration</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{duration.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDuration(duration.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volume Discounts Management */}
        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Volume Discounts ({volumeDiscounts.length})</span>
                <Dialog open={isVolumeDialogOpen} onOpenChange={setIsVolumeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openVolumeDiscountDialog()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Volume Discount
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingVolumeDiscount ? 'Edit Volume Discount' : 'Add New Volume Discount'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_areas">Min Areas</Label>
                          <Input
                            id="min_areas"
                            type="number"
                            value={volumeDiscountForm.min_areas}
                            onChange={(e) => setVolumeDiscountForm(prev => ({ ...prev, min_areas: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_areas">Max Areas</Label>
                          <Input
                            id="max_areas"
                            type="number"
                            value={volumeDiscountForm.max_areas}
                            onChange={(e) => setVolumeDiscountForm(prev => ({ ...prev, max_areas: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="volume_discount">Discount (%)</Label>
                        <Input
                          id="volume_discount"
                          type="number"
                          step="0.1"
                          value={volumeDiscountForm.discount_percentage}
                          onChange={(e) => setVolumeDiscountForm(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="volume_active"
                          checked={volumeDiscountForm.is_active}
                          onCheckedChange={(checked) => setVolumeDiscountForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="volume_active">Active</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveVolumeDiscount} className="flex-1">
                          {editingVolumeDiscount ? 'Update' : 'Create'} Volume Discount
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsVolumeDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area Range</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volumeDiscounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">
                        {discount.min_areas} - {discount.max_areas || '∞'} areas
                      </TableCell>
                      <TableCell>{discount.discount_percentage}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={discount.is_active ? "default" : "secondary"}
                          className={discount.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openVolumeDiscountDialog(discount)}
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
                                <AlertDialogTitle>Delete Volume Discount</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this volume discount? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVolumeDiscount(discount.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Deals Management */}
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Special Deals ({specialDeals.length})</span>
                <Dialog open={isSpecialDealDialogOpen} onOpenChange={setIsSpecialDealDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openSpecialDealDialog()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Special Deal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSpecialDeal ? 'Edit Special Deal' : 'Add New Special Deal'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="deal_name">Deal Name *</Label>
                        <Input
                          id="deal_name"
                          value={specialDealForm.name}
                          onChange={(e) => setSpecialDealForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Black Friday Special"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="deal_description">Description</Label>
                        <Input
                          id="deal_description"
                          value={specialDealForm.description}
                          onChange={(e) => setSpecialDealForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the deal"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deal_type">Deal Type</Label>
                          <select
                            id="deal_type"
                            className="w-full p-2 border rounded-md"
                            value={specialDealForm.deal_type}
                            onChange={(e) => setSpecialDealForm(prev => ({ ...prev, deal_type: e.target.value }))}
                          >
                            <option value="percentage">Percentage Off</option>
                            <option value="fixed">Fixed Amount Off</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="deal_value">
                            Deal Value {specialDealForm.deal_type === 'percentage' ? '(%)' : '(£)'}
                          </Label>
                          <Input
                            id="deal_value"
                            type="number"
                            step="0.01"
                            value={specialDealForm.deal_value}
                            onChange={(e) => setSpecialDealForm(prev => ({ ...prev, deal_value: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="deal_min_areas">Minimum Areas</Label>
                        <Input
                          id="deal_min_areas"
                          type="number"
                          value={specialDealForm.min_areas}
                          onChange={(e) => setSpecialDealForm(prev => ({ ...prev, min_areas: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="valid_from">Valid From</Label>
                          <Input
                            id="valid_from"
                            type="date"
                            value={specialDealForm.valid_from}
                            onChange={(e) => setSpecialDealForm(prev => ({ ...prev, valid_from: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="valid_until">Valid Until</Label>
                          <Input
                            id="valid_until"
                            type="date"
                            value={specialDealForm.valid_until}
                            onChange={(e) => setSpecialDealForm(prev => ({ ...prev, valid_until: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="deal_active"
                          checked={specialDealForm.is_active}
                          onCheckedChange={(checked) => setSpecialDealForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="deal_active">Active</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveSpecialDeal} className="flex-1">
                          {editingSpecialDeal ? 'Update' : 'Create'} Special Deal
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsSpecialDealDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {specialDeals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No special deals found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {deal.deal_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {deal.deal_type === 'percentage' ? `${deal.deal_value}%` : `£${deal.deal_value}`}
                        </TableCell>
                        <TableCell>
                          {deal.valid_from && deal.valid_until 
                            ? `${new Date(deal.valid_from).toLocaleDateString()} - ${new Date(deal.valid_until).toLocaleDateString()}`
                            : 'No expiry'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={deal.is_active ? "default" : "secondary"}
                            className={deal.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {deal.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSpecialDealDialog(deal)}
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
                                  <AlertDialogTitle>Delete Special Deal</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{deal.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSpecialDeal(deal.id)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionSettingsManagement;