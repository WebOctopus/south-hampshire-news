import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Edit, Trash2, Search, Filter, ArrowUpDown, CheckCircle, XCircle, Users, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { areas } from '@/data/advertisingPricing';

// Helper function to format month display
const formatMonthDisplay = (month: string, year: number) => {
  // Since month is already stored as full name (e.g., "June"), just return it with the year
  return `${month} ${year}`;
};

interface LocationData {
  id: string;
  name: string;
  postcodes: string[];
  circulation: number;
  base_price_multiplier: number;
  quarter_page_multiplier: number;
  half_page_multiplier: number;
  full_page_multiplier: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  schedule?: Array<{
    year: number;
    month: string;
    copyDeadline: string;
    printDeadline: string;
    deliveryDate: string;
  }>;
}

interface LocationsManagementProps {
  onStatsUpdate: () => void;
}

const LocationsManagement = ({ onStatsUpdate }: LocationsManagementProps) => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    postcodes: '',
    circulation: 0,
    base_price_multiplier: 1.0,
    quarter_page_multiplier: 1.0,
    half_page_multiplier: 1.0,
    full_page_multiplier: 1.0,
    is_active: true,
    sort_order: 0,
    schedule: []
  });
  const { toast } = useToast();

  // Helper functions for schedule management
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const availableYears = [2024, 2025, 2026];

  const addScheduleItem = (year: number, monthName: string) => {
    const newScheduleItem = {
      year,
      month: monthName,
      copyDeadline: '15th',
      printDeadline: '20th',
      deliveryDate: '25th'
    };
    const newSchedule = [...formData.schedule, newScheduleItem].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return allMonths.indexOf(a.month) - allMonths.indexOf(b.month);
    });
    setFormData(prev => ({ ...prev, schedule: newSchedule }));
  };

  const removeScheduleItem = (year: number, monthName: string) => {
    const newSchedule = formData.schedule.filter(item => 
      !(item.year === year && item.month === monthName)
    );
    setFormData(prev => ({ ...prev, schedule: newSchedule }));
  };

  const getAvailableYearMonths = () => {
    const usedCombinations = formData.schedule.map(item => `${item.year}-${item.month}`);
    const availableOptions: Array<{ year: number; month: string; label: string }> = [];
    
    availableYears.forEach(year => {
      allMonths.forEach(month => {
        const combination = `${year}-${month}`;
        if (!usedCombinations.includes(combination)) {
          availableOptions.push({
            year,
            month,
            label: `${month} ${year}`
          });
        }
      });
    });
    
    return availableOptions;
  };

  useEffect(() => {
    loadLocations();
    initializeDefaultLocations();
  }, []);

  const initializeDefaultLocations = async () => {
    try {
      // Check if locations already exist
      const { data: existingLocations } = await supabase
        .from('pricing_areas')
        .select('id')
        .limit(1);

      if (existingLocations && existingLocations.length === 0) {
        // Import default locations from advertisingPricing.ts
        const defaultLocations = areas.map((area, index) => ({
          name: area.name,
          postcodes: area.postcodes.split(' ').filter(pc => pc.trim()),
          circulation: area.circulation,
          base_price_multiplier: area.pricingMultipliers['quarter-page'] || 1.0,
          quarter_page_multiplier: area.pricingMultipliers['quarter-page'] || 1.0,
          half_page_multiplier: area.pricingMultipliers['half-page'] || 1.0,
          full_page_multiplier: area.pricingMultipliers['full-page'] || 1.0,
          is_active: true,
          sort_order: index + 1
        }));

        const { error } = await supabase
          .from('pricing_areas')
          .insert(defaultLocations);

        if (error) {
          console.error('Error initializing default locations:', error);
        } else {
          toast({
            title: "Default Locations Imported",
            description: `Successfully imported ${defaultLocations.length} default locations.`
          });
          loadLocations();
        }
      }
    } catch (error) {
      console.error('Error initializing default locations:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_areas')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      // Process the data to properly type the schedule field
      const processedLocations = (data || []).map(location => ({
        ...location,
        schedule: Array.isArray(location.schedule) ? location.schedule as Array<{
          year: number;
          month: string;
          copyDeadline: string;
          printDeadline: string;
          deliveryDate: string;
        }> : []
      })) as LocationData[];

      setLocations(processedLocations);
      onStatsUpdate();
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      postcodes: '',
      circulation: 0,
      base_price_multiplier: 1.0,
      quarter_page_multiplier: 1.0,
      half_page_multiplier: 1.0,
      full_page_multiplier: 1.0,
      is_active: true,
      sort_order: locations.length + 1,
      schedule: []
    });
    setEditingLocation(null);
  };

  const openDialog = (location?: LocationData) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        postcodes: location.postcodes.join(' '),
        circulation: location.circulation,
        base_price_multiplier: location.base_price_multiplier,
        quarter_page_multiplier: location.quarter_page_multiplier,
        half_page_multiplier: location.half_page_multiplier,
        full_page_multiplier: location.full_page_multiplier,
        is_active: location.is_active,
        sort_order: location.sort_order,
        schedule: location.schedule || []
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const locationData = {
        ...formData,
        postcodes: formData.postcodes.split(' ').filter(pc => pc.trim()),
        circulation: Number(formData.circulation),
        base_price_multiplier: Number(formData.base_price_multiplier),
        quarter_page_multiplier: Number(formData.quarter_page_multiplier),
        half_page_multiplier: Number(formData.half_page_multiplier),
        full_page_multiplier: Number(formData.full_page_multiplier),
        sort_order: Number(formData.sort_order),
        schedule: formData.schedule
      };

      let error;
      
      if (editingLocation) {
        const { error: updateError } = await supabase
          .from('pricing_areas')
          .update(locationData)
          .eq('id', editingLocation.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('pricing_areas')
          .insert([locationData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Location ${editingLocation ? 'updated' : 'created'} successfully.`
      });

      setIsDialogOpen(false);
      resetForm();
      loadLocations();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save location.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (locationId: string) => {
    try {
      const { error } = await supabase
        .from('pricing_areas')
        .delete()
        .eq('id', locationId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Location deleted successfully."
      });

      loadLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete location.",
        variant: "destructive"
      });
    }
  };

  const handleBulkStatusChange = async (active: boolean) => {
    if (selectedLocations.length === 0) return;

    try {
      const { error } = await supabase
        .from('pricing_areas')
        .update({ is_active: active })
        .in('id', selectedLocations);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${selectedLocations.length} locations ${active ? 'activated' : 'deactivated'} successfully.`
      });

      setSelectedLocations([]);
      loadLocations();
    } catch (error: any) {
      console.error('Error updating locations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update locations.",
        variant: "destructive"
      });
    }
  };

  // Filter and sort locations
  const filteredLocations = locations
    .filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.postcodes.some(pc => pc.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && location.is_active) ||
                           (statusFilter === 'inactive' && !location.is_active);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'circulation':
          aVal = a.circulation;
          bVal = b.circulation;
          break;
        case 'created_at':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-community-navy flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage advertising distribution areas and their pricing multipliers
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedLocations.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange(true)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Activate ({selectedLocations.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange(false)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Deactivate ({selectedLocations.length})
              </Button>
            </div>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., SOUTHAMPTON CITY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcodes">Postcodes *</Label>
                    <Input
                      id="postcodes"
                      value={formData.postcodes}
                      onChange={(e) => setFormData(prev => ({ ...prev, postcodes: e.target.value }))}
                      placeholder="e.g., SO15 SO16 SO17"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="circulation">Circulation *</Label>
                    <Input
                      id="circulation"
                      type="number"
                      value={formData.circulation}
                      onChange={(e) => setFormData(prev => ({ ...prev, circulation: parseInt(e.target.value) || 0 }))}
                      placeholder="10000"
                    />
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
                </div>

                <div className="space-y-3">
                  <Label>Pricing Multipliers</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quarter_page_multiplier" className="text-sm">Quarter Page</Label>
                      <Input
                        id="quarter_page_multiplier"
                        type="number"
                        step="0.01"
                        value={formData.quarter_page_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, quarter_page_multiplier: parseFloat(e.target.value) || 1.0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="half_page_multiplier" className="text-sm">Half Page</Label>
                      <Input
                        id="half_page_multiplier"
                        type="number"
                        step="0.01"
                        value={formData.half_page_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, half_page_multiplier: parseFloat(e.target.value) || 1.0 }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_page_multiplier" className="text-sm">Full Page</Label>
                      <Input
                        id="full_page_multiplier"
                        type="number"
                        step="0.01"
                        value={formData.full_page_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_page_multiplier: parseFloat(e.target.value) || 1.0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="base_price_multiplier" className="text-sm">Base Multiplier</Label>
                      <Input
                        id="base_price_multiplier"
                        type="number"
                        step="0.01"
                        value={formData.base_price_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price_multiplier: parseFloat(e.target.value) || 1.0 }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                {/* Schedule Management Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Monthly Schedule</Label>
                    <Badge variant="outline" className="text-xs">
                      {formData.schedule.length} months configured
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {formData.schedule.map((scheduleItem, index) => (
                       <div key={`${scheduleItem.year}-${scheduleItem.month}`} className="grid grid-cols-5 gap-2 items-center">
                         <div className="text-sm font-medium">{formatMonthDisplay(scheduleItem.month, scheduleItem.year)}</div>
                        <div>
                          <Label className="text-xs">Copy Deadline</Label>
                          <Input
                            value={scheduleItem.copyDeadline}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[index] = { ...scheduleItem, copyDeadline: e.target.value };
                              setFormData(prev => ({ ...prev, schedule: newSchedule }));
                            }}
                            placeholder="15th"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Print Deadline</Label>
                          <Input
                            value={scheduleItem.printDeadline}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[index] = { ...scheduleItem, printDeadline: e.target.value };
                              setFormData(prev => ({ ...prev, schedule: newSchedule }));
                            }}
                            placeholder="20th"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Delivery Date</Label>
                          <Input
                            value={scheduleItem.deliveryDate}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[index] = { ...scheduleItem, deliveryDate: e.target.value };
                              setFormData(prev => ({ ...prev, schedule: newSchedule }));
                            }}
                            placeholder="25th"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex justify-end">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => removeScheduleItem(scheduleItem.year, scheduleItem.month)}
                             className="h-8 w-8 p-0"
                             title={`Remove ${formatMonthDisplay(scheduleItem.month, scheduleItem.year)}`}
                           >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {formData.schedule.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No dates configured. Add year-month combinations below.
                      </div>
                    )}
                  </div>
                  
                  {/* Add Schedule Item Section */}
                  {getAvailableYearMonths().length > 0 && (
                    <div className="flex gap-2 items-center">
                      <Select onValueChange={(value) => {
                        const [year, month] = value.split('-');
                        addScheduleItem(parseInt(year), month);
                      }}>
                        <SelectTrigger className="w-48">
                          <Plus className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Add Date" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableYearMonths().map((option) => (
                            <SelectItem key={`${option.year}-${option.month}`} value={`${option.year}-${option.month}`}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-gray-500">
                        {getAvailableYearMonths().length} dates available
                      </span>
                    </div>
                  )}
                  
                  {getAvailableYearMonths().length === 0 && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      All available year-month combinations have been added to the schedule.
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    {editingLocation ? 'Update' : 'Create'} Location
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

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations or postcodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="circulation">Sort by Circulation</SelectItem>
                  <SelectItem value="created_at">Sort by Date</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Locations ({filteredLocations.length})</span>
            {filteredLocations.length > 0 && (
              <Badge variant="outline">
                Total Circulation: {filteredLocations.reduce((sum, loc) => sum + loc.circulation, 0).toLocaleString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No locations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedLocations.length === filteredLocations.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations(filteredLocations.map(loc => loc.id));
                          } else {
                            setSelectedLocations([]);
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Postcodes</TableHead>
                    <TableHead>Circulation</TableHead>
                    <TableHead>Multipliers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLocations(prev => [...prev, location.id]);
                            } else {
                              setSelectedLocations(prev => prev.filter(id => id !== location.id));
                            }
                          }}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {location.postcodes.slice(0, 3).map((postcode) => (
                            <Badge key={postcode} variant="outline" className="text-xs">
                              {postcode}
                            </Badge>
                          ))}
                          {location.postcodes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{location.postcodes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {location.circulation.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div>1/4: {location.quarter_page_multiplier}x</div>
                          <div>1/2: {location.half_page_multiplier}x</div>
                          <div>Full: {location.full_page_multiplier}x</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={location.is_active ? "default" : "secondary"}
                          className={location.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(location.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(location)}
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
                                <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{location.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(location.id)}
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
    </div>
  );
};

export default LocationsManagement;