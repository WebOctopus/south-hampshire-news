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
import { Clock, Plus, Edit, Trash2, Percent, Target, Gift, CreditCard } from 'lucide-react';
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

interface PaymentOption {
  id: string;
  option_type: string;
  display_name: string;
  description: string;
  discount_percentage: number;
  minimum_payments: number;
  additional_fee_percentage: number;
  is_active: boolean;
  sort_order: number;
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
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('durations');

  // Dialog states
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const [isVolumeDialogOpen, setIsVolumeDialogOpen] = useState(false);
  const [isSpecialDealDialogOpen, setIsSpecialDealDialogOpen] = useState(false);
  const [isPaymentOptionDialogOpen, setIsPaymentOptionDialogOpen] = useState(false);

  // Editing states
  const [editingDuration, setEditingDuration] = useState<Duration | null>(null);
  const [editingVolumeDiscount, setEditingVolumeDiscount] = useState<VolumeDiscount | null>(null);
  const [editingSpecialDeal, setEditingSpecialDeal] = useState<SpecialDeal | null>(null);
  const [editingPaymentOption, setEditingPaymentOption] = useState<PaymentOption | null>(null);

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

  const [paymentOptionForm, setPaymentOptionForm] = useState({
    option_type: '',
    display_name: '',
    description: '',
    discount_percentage: 0,
    minimum_payments: 6,
    additional_fee_percentage: 0,
    is_active: true,
    sort_order: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  // This function is removed to prevent auto-recreation of deleted data
  // Default data should be handled during initial database setup, not in the UI

  const loadAllData = async () => {
    try {
      const [durationsData, volumeDiscountsData, specialDealsData, paymentOptionsData] = await Promise.all([
        supabase.from('pricing_durations').select('*').order('sort_order'),
        supabase.from('volume_discounts').select('*').order('min_areas'),
        supabase.from('special_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('payment_options').select('*').order('sort_order')
      ]);

      setDurations(durationsData.data || []);
      setVolumeDiscounts(volumeDiscountsData.data || []);
      setSpecialDeals(specialDealsData.data || []);
      setPaymentOptions(paymentOptionsData.data || []);
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

  // Payment option management functions
  const resetPaymentOptionForm = () => {
    setPaymentOptionForm({
      option_type: '',
      display_name: '',
      description: '',
      discount_percentage: 0,
      minimum_payments: 6,
      additional_fee_percentage: 0,
      is_active: true,
      sort_order: paymentOptions.length + 1
    });
    setEditingPaymentOption(null);
  };

  const openPaymentOptionDialog = (paymentOption?: PaymentOption) => {
    if (paymentOption) {
      setEditingPaymentOption(paymentOption);
      setPaymentOptionForm({
        option_type: paymentOption.option_type,
        display_name: paymentOption.display_name,
        description: paymentOption.description || '',
        discount_percentage: paymentOption.discount_percentage,
        minimum_payments: paymentOption.minimum_payments || 6,
        additional_fee_percentage: paymentOption.additional_fee_percentage,
        is_active: paymentOption.is_active,
        sort_order: paymentOption.sort_order
      });
    } else {
      resetPaymentOptionForm();
    }
    setIsPaymentOptionDialogOpen(true);
  };

  const handleSavePaymentOption = async () => {
    try {
      let error;
      
      if (editingPaymentOption) {
        const { error: updateError } = await supabase
          .from('payment_options')
          .update(paymentOptionForm)
          .eq('id', editingPaymentOption.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('payment_options')
          .insert([paymentOptionForm]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment option ${editingPaymentOption ? 'updated' : 'created'} successfully.`
      });

      setIsPaymentOptionDialogOpen(false);
      resetPaymentOptionForm();
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save payment option.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePaymentOption = async (paymentOptionId: string) => {
    try {
      const { error } = await supabase
        .from('payment_options')
        .delete()
        .eq('id', paymentOptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment option deleted successfully."
      });

      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment option.",
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
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Options
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

        {/* Payment Options Management */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Payment Options ({paymentOptions.length})</span>
                <Dialog open={isPaymentOptionDialogOpen} onOpenChange={setIsPaymentOptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openPaymentOptionDialog()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Payment Option
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPaymentOption ? 'Edit Payment Option' : 'Add New Payment Option'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="option_type">Option Type *</Label>
                        <Input
                          id="option_type"
                          value={paymentOptionForm.option_type}
                          onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, option_type: e.target.value }))}
                          placeholder="e.g., 6_months_full, 12_months_full, monthly"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display_name">Display Name *</Label>
                        <Input
                          id="display_name"
                          value={paymentOptionForm.display_name}
                          onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, display_name: e.target.value }))}
                          placeholder="e.g., Pay in full for 6 months"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={paymentOptionForm.description}
                          onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discount_percentage">Discount (%)</Label>
                          <Input
                            id="discount_percentage"
                            type="number"
                            step="0.1"
                            value={paymentOptionForm.discount_percentage}
                            onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="additional_fee_percentage">Additional Fee (%)</Label>
                          <Input
                            id="additional_fee_percentage"
                            type="number"
                            step="0.1"
                            value={paymentOptionForm.additional_fee_percentage}
                            onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, additional_fee_percentage: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minimum_payments">Minimum Payments</Label>
                          <Input
                            id="minimum_payments"
                            type="number"
                            value={paymentOptionForm.minimum_payments || ''}
                            onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, minimum_payments: e.target.value ? parseInt(e.target.value) : 0 }))}
                            placeholder="Leave empty if not applicable"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sort_order">Sort Order</Label>
                          <Input
                            id="sort_order"
                            type="number"
                            value={paymentOptionForm.sort_order}
                            onChange={(e) => setPaymentOptionForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="payment_active"
                          checked={paymentOptionForm.is_active}
                          onCheckedChange={(checked) => setPaymentOptionForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="payment_active">Active</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSavePaymentOption} className="flex-1">
                          {editingPaymentOption ? 'Update' : 'Create'} Payment Option
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsPaymentOptionDialogOpen(false)}
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
              {paymentOptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment options found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Min Payments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentOptions.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.display_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {option.option_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {option.discount_percentage > 0 ? `${option.discount_percentage}%` : 
                           option.additional_fee_percentage > 0 ? `+${option.additional_fee_percentage}%` :
                           option.additional_fee_percentage < 0 ? `${option.additional_fee_percentage}%` : 'None'}
                        </TableCell>
                        <TableCell>
                          {option.minimum_payments || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={option.is_active ? "default" : "secondary"}
                            className={option.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {option.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentOptionDialog(option)}
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
                                  <AlertDialogTitle>Delete Payment Option</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{option.display_name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePaymentOption(option.id)}
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