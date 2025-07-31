import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, MapPin, DollarSign, Clock, Percent } from 'lucide-react';

const PricingManagement = () => {
  const [areas, setAreas] = useState<any[]>([]);
  const [adSizes, setAdSizes] = useState<any[]>([]);
  const [durations, setDurations] = useState<any[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<any[]>([]);
  const [specialDeals, setSpecialDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('areas');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadAreas(),
      loadAdSizes(), 
      loadDurations(),
      loadVolumeDiscounts(),
      loadSpecialDeals()
    ]);
    setIsLoading(false);
  };

  const loadAreas = async () => {
    const { data, error } = await supabase
      .from('pricing_areas')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast({
        title: "Error loading areas",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      setAreas(data);
    }
  };

  const loadAdSizes = async () => {
    const { data, error } = await supabase
      .from('ad_sizes')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast({
        title: "Error loading ad sizes",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      setAdSizes(data);
    }
  };

  const loadDurations = async () => {
    const { data, error } = await supabase
      .from('pricing_durations')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast({
        title: "Error loading durations",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      setDurations(data);
    }
  };

  const loadVolumeDiscounts = async () => {
    const { data, error } = await supabase
      .from('volume_discounts')
      .select('*')
      .order('min_areas', { ascending: true });
    
    if (error) {
      toast({
        title: "Error loading volume discounts",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      setVolumeDiscounts(data);
    }
  };

  const loadSpecialDeals = async () => {
    const { data, error } = await supabase
      .from('special_deals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error loading special deals",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      setSpecialDeals(data);
    }
  };

  const handleSaveArea = async (data: any) => {
    setIsLoading(true);
    
    try {
      if (editingItem?.id) {
        const { error } = await supabase
          .from('pricing_areas')
          .update(data)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pricing_areas')
          .insert([data]);
        
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Area saved successfully"
      });
      
      setIsDialogOpen(false);
      setEditingItem(null);
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this area?')) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('pricing_areas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Area deleted successfully"
      });
      
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdSize = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad size?')) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('ad_sizes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Ad size deleted successfully"
      });
      
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDuration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this duration?')) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('pricing_durations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Duration deleted successfully"
      });
      
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVolumeDiscount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volume discount?')) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('volume_discounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Volume discount deleted successfully"
      });
      
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpecialDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this special deal?')) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('special_deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Special deal deleted successfully"
      });
      
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (section: string, item: any = null) => {
    setActiveSection(section);
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const renderAreasTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Distribution Areas
          </div>
          <Button onClick={() => openDialog('areas')} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Area
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Postcodes</TableHead>
                <TableHead>Circulation</TableHead>
                <TableHead>Base Multiplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.postcodes?.join(', ')}</TableCell>
                  <TableCell>{area.circulation?.toLocaleString()}</TableCell>
                  <TableCell>{area.base_price_multiplier}x</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      area.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {area.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog('areas', area)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteArea(area.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdSizesTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Ad Sizes & Pricing
          </div>
          <Button onClick={() => openDialog('adSizes')} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Ad Size
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Base Price/Month</TableHead>
                <TableHead>Base Price/Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adSizes.map((size) => (
                <TableRow key={size.id}>
                  <TableCell className="font-medium">{size.name}</TableCell>
                  <TableCell>{size.dimensions}</TableCell>
                  <TableCell>£{size.base_price_per_month}</TableCell>
                  <TableCell>£{size.base_price_per_area}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      size.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {size.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog('adSizes', size)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAdSize(size.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="areas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="sizes">Ad Sizes</TabsTrigger>
          <TabsTrigger value="durations">Durations</TabsTrigger>
          <TabsTrigger value="discounts">Volume Discounts</TabsTrigger>
          <TabsTrigger value="deals">Special Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="space-y-6">
          {renderAreasTable()}
        </TabsContent>

        <TabsContent value="sizes" className="space-y-6">
          {renderAdSizesTable()}
        </TabsContent>

        <TabsContent value="durations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Campaign Durations
                </div>
                <Button onClick={() => openDialog('durations')} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Duration
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
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
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            duration.duration_type === 'subscription' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {duration.duration_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          {duration.duration_value} {duration.duration_type === 'subscription' ? 'months' : 'issues'}
                        </TableCell>
                        <TableCell>{duration.discount_percentage}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            duration.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {duration.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog('durations', duration)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteDuration(duration.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Percent className="h-5 w-5 mr-2 text-orange-600" />
                  Volume Discounts
                </div>
                <Button onClick={() => openDialog('discounts')} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Discount
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min Areas</TableHead>
                      <TableHead>Max Areas</TableHead>
                      <TableHead>Discount %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volumeDiscounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell>{discount.min_areas}</TableCell>
                        <TableCell>{discount.max_areas || '∞'}</TableCell>
                        <TableCell>{discount.discount_percentage}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            discount.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {discount.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog('discounts', discount)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteVolumeDiscount(discount.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-red-600" />
                  Special Deals & Promotions
                </div>
                <Button onClick={() => openDialog('deals')} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Deal
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Min Areas</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            deal.deal_type === 'bogof' 
                              ? 'bg-red-100 text-red-800' 
                              : deal.deal_type === 'percentage_discount'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {deal.deal_type.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {deal.deal_type === 'percentage_discount' ? `${deal.deal_value}%` : 
                           deal.deal_type === 'fixed_discount' ? `£${deal.deal_value}` : 
                           'BOGOF'}
                        </TableCell>
                        <TableCell>{deal.min_areas}</TableCell>
                        <TableCell>
                          {deal.valid_until ? new Date(deal.valid_until).toLocaleDateString() : 'No expiry'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            deal.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {deal.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog('deals', deal)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSpecialDeal(deal.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generic Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {activeSection === 'areas' ? 'Area' : 
                                              activeSection === 'adSizes' ? 'Ad Size' : 
                                              activeSection === 'durations' ? 'Duration' : 
                                              activeSection === 'discounts' ? 'Volume Discount' : 
                                              'Special Deal'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form fields will be added based on activeSection */}
            <p className="text-muted-foreground">
              Form fields for {activeSection} will be implemented in the next update.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingManagement;