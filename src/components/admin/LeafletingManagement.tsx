import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  MapPin, 
  FileText, 
  Calendar as CalendarIcon, 
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import {
  useLeafletAreas,
  useLeafletCampaignDurations,
  type LeafletArea,
  type LeafletDuration,
  type LeafletScheduleItem
} from '@/hooks/useLeafletData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeafletingManagementProps {
  onStatsUpdate?: () => void;
}

const allMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const availableYears = [2025, 2026, 2027];

const LeafletingManagement: React.FC<LeafletingManagementProps> = ({ onStatsUpdate }) => {
  const [activeTab, setActiveTab] = useState('areas');
  const [editingArea, setEditingArea] = useState<LeafletArea | null>(null);
  const [editingDuration, setEditingDuration] = useState<LeafletDuration | null>(null);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [areaSchedule, setAreaSchedule] = useState<LeafletScheduleItem[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Supabase hooks
  const { data: areas = [], isLoading: areasLoading, isError: areasError, refetch: refetchAreas } = useLeafletAreas();
  const { data: durations = [], isLoading: durationsLoading, isError: durationsError, refetch: refetchDurations } = useLeafletCampaignDurations();

  // Ensure arrays are always defined to prevent undefined.length errors
  const safeAreas = areas || [];
  const safeDurations = durations || [];

  const dataLoading = areasLoading || durationsLoading;
  const hasError = areasError || durationsError;

  // Initialize schedule when editing area changes
  useEffect(() => {
    if (editingArea) {
      setAreaSchedule(editingArea.schedule || []);
    } else {
      setAreaSchedule([]);
    }
  }, [editingArea]);

  // Schedule management functions
  const addScheduleItem = (year: number, monthName: string) => {
    const monthIndex = allMonths.indexOf(monthName);
    // Set default dates: 15th for leaflets req'd by, 25th for w/c delivery
    const copyDate = new Date(year, monthIndex, 15);
    const deliveryDate = new Date(year, monthIndex, 25);
    
    const newScheduleItem: LeafletScheduleItem = {
      year,
      month: monthName,
      copyDeadline: format(copyDate, 'dd.MM.yyyy'),
      deliveryDate: format(deliveryDate, 'dd.MM.yyyy')
    };
    const newSchedule = [...areaSchedule, newScheduleItem].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return allMonths.indexOf(a.month) - allMonths.indexOf(b.month);
    });
    setAreaSchedule(newSchedule);
  };

  const removeScheduleItem = (year: number, monthName: string) => {
    const newSchedule = areaSchedule.filter(item => 
      !(item.year === year && item.month === monthName)
    );
    setAreaSchedule(newSchedule);
  };

  const getAvailableYearMonths = () => {
    const usedCombinations = areaSchedule.map(item => `${item.year}-${item.month}`);
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

  const formatMonthDisplay = (month: string, year: number) => {
    if (month.includes('-')) {
      const parts = month.split('-');
      const monthNumber = parseInt(parts[1], 10);
      return `${allMonths[monthNumber - 1]} ${year}`;
    }
    return `${month} ${year}`;
  };

  // Area management functions
  const handleSaveArea = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const areaData = {
        area_number: parseInt(formData.get('area_number') as string),
        name: formData.get('name') as string,
        postcodes: formData.get('postcodes') as string,
        bimonthly_circulation: parseInt(formData.get('bimonthly_circulation') as string) || 0,
        price_with_vat: parseFloat(formData.get('price_with_vat') as string) || 0,
        is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true',
        schedule: areaSchedule as unknown as null
      };

      if (editingArea) {
        const { error } = await supabase
          .from('leaflet_areas')
          .update({ ...areaData, schedule: areaSchedule as any })
          .eq('id', editingArea.id);

        if (error) throw error;
        toast({ title: "Area updated successfully" });
      } else {
        const { error } = await supabase
          .from('leaflet_areas')
          .insert([{ ...areaData, schedule: areaSchedule as any }]);

        if (error) throw error;
        toast({ title: "Area created successfully" });
      }

      setIsAreaDialogOpen(false);
      setEditingArea(null);
      setAreaSchedule([]);
      refetchAreas();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error saving area:', error);
      toast({ 
        title: "Error saving area", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArea = async (area: LeafletArea) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('leaflet_areas')
        .delete()
        .eq('id', area.id);

      if (error) throw error;

      toast({ title: "Area deleted successfully" });
      refetchAreas();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error deleting area:', error);
      toast({ 
        title: "Error deleting area", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Duration management functions
  const handleSaveDuration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const durationData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        months: parseInt(formData.get('months') as string),
        issues: parseInt(formData.get('issues') as string),
        is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true'
      };

      if (editingDuration) {
        const { error } = await supabase
          .from('leaflet_campaign_durations')
          .update(durationData)
          .eq('id', editingDuration.id);

        if (error) throw error;
        toast({ title: "Duration updated successfully" });
      } else {
        const { error } = await supabase
          .from('leaflet_campaign_durations')
          .insert([durationData]);

        if (error) throw error;
        toast({ title: "Duration created successfully" });
      }

      setIsDurationDialogOpen(false);
      setEditingDuration(null);
      refetchDurations();
    } catch (error) {
      console.error('Error saving duration:', error);
      toast({ 
        title: "Error saving duration", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDuration = async (duration: LeafletDuration) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('leaflet_campaign_durations')
        .delete()
        .eq('id', duration.id);

      if (error) throw error;

      toast({ title: "Duration deleted successfully" });
      refetchDurations();
    } catch (error) {
      console.error('Error deleting duration:', error);
      toast({ 
        title: "Error deleting duration", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Parse date helper
  const parseDate = (dateStr: string, year: number, month: string): Date | undefined => {
    if (!dateStr) return undefined;
    try {
      if (dateStr.includes('.')) {
        const parsed = parse(dateStr, 'dd.MM.yyyy', new Date());
        return isNaN(parsed.getTime()) ? undefined : parsed;
      }
      const dayMatch = dateStr.match(/\d+/);
      if (dayMatch) {
        const monthIndex = allMonths.indexOf(month);
        if (monthIndex === -1) return undefined;
        const day = parseInt(dayMatch[0]);
        const date = new Date(year, monthIndex, day);
        return isNaN(date.getTime()) ? undefined : date;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading leafleting data...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <p className="text-lg font-medium text-destructive mb-2">Error Loading Data</p>
        <p className="text-sm text-muted-foreground">Failed to load leafleting management data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-community-navy">
            Leafleting Service Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage distribution areas and campaign settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Distribution Areas ({safeAreas.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Campaign Settings ({safeDurations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Distribution Areas</CardTitle>
              <Dialog open={isAreaDialogOpen} onOpenChange={(open) => {
                setIsAreaDialogOpen(open);
                if (!open) {
                  setEditingArea(null);
                  setAreaSchedule([]);
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingArea(null);
                      setAreaSchedule([]);
                      setIsAreaDialogOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Area
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleSaveArea}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingArea ? 'Edit Area' : 'Add New Area'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure the distribution area details, pricing, and schedule.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="area_number">Area Number</Label>
                          <Input
                            id="area_number"
                            name="area_number"
                            type="number"
                            defaultValue={editingArea?.area_number || ''}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Area Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingArea?.name || ''}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="postcodes">Postcodes</Label>
                        <Textarea
                          id="postcodes"
                          name="postcodes"
                          placeholder="Enter postcodes separated by commas"
                          defaultValue={editingArea?.postcodes || ''}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bimonthly_circulation">Circulation (Bi-monthly)</Label>
                          <Input
                            id="bimonthly_circulation"
                            name="bimonthly_circulation"
                            type="number"
                            defaultValue={editingArea?.bimonthly_circulation || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price_with_vat">Price (with VAT)</Label>
                          <Input
                            id="price_with_vat"
                            name="price_with_vat"
                            type="number"
                            step="0.01"
                            defaultValue={editingArea?.price_with_vat || ''}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          value="true"
                          defaultChecked={editingArea?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>

                      {/* Schedule Management Section */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Monthly Schedule</Label>
                          <Badge variant="outline" className="text-xs">
                            {areaSchedule.length} months configured
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto border rounded-md p-4 bg-muted/20">
                          {areaSchedule.map((scheduleItem, index) => {
                            const copyDate = parseDate(scheduleItem.copyDeadline, scheduleItem.year, scheduleItem.month);
                            const deliveryDate = parseDate(scheduleItem.deliveryDate, scheduleItem.year, scheduleItem.month);

                            return (
                              <div key={`${scheduleItem.year}-${scheduleItem.month}`} className="bg-background rounded-lg border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-foreground">
                                    {formatMonthDisplay(scheduleItem.month, scheduleItem.year)}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeScheduleItem(scheduleItem.year, scheduleItem.month)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    title={`Remove ${formatMonthDisplay(scheduleItem.month, scheduleItem.year)}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  {/* Leaflets req'd by */}
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Leaflets req'd by</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal text-sm h-9",
                                            !copyDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                          {copyDate ? format(copyDate, 'dd.MM.yyyy') : "Pick date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={copyDate}
                                          onSelect={(date) => {
                                            const newSchedule = [...areaSchedule];
                                            newSchedule[index] = { 
                                              ...scheduleItem, 
                                              copyDeadline: date ? format(date, 'dd.MM.yyyy') : '' 
                                            };
                                            setAreaSchedule(newSchedule);
                                          }}
                                          initialFocus
                                          className="pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>

                                  {/* w/c delivery */}
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">w/c delivery</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal text-sm h-9",
                                            !deliveryDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                          {deliveryDate ? format(deliveryDate, 'dd.MM.yyyy') : "Pick date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={deliveryDate}
                                          onSelect={(date) => {
                                            const newSchedule = [...areaSchedule];
                                            newSchedule[index] = { 
                                              ...scheduleItem, 
                                              deliveryDate: date ? format(date, 'dd.MM.yyyy') : '' 
                                            };
                                            setAreaSchedule(newSchedule);
                                          }}
                                          initialFocus
                                          className="pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {areaSchedule.length === 0 && (
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
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAreaDialogOpen(false);
                          setEditingArea(null);
                          setAreaSchedule([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          editingArea ? 'Update Area' : 'Create Area'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {safeAreas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No distribution areas configured yet.
                </div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area #</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Postcodes</TableHead>
                        <TableHead>Circulation</TableHead>
                        <TableHead>Price (VAT inc.)</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeAreas.map((area) => (
                        <TableRow key={area.id}>
                          <TableCell className="font-medium">{area.area_number}</TableCell>
                          <TableCell>{area.name}</TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate" title={area.postcodes}>
                              {area.postcodes}
                            </div>
                          </TableCell>
                          <TableCell>{area.bimonthly_circulation?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell>£{area.price_with_vat}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {area.schedule?.length || 0} months
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={area.is_active ? "default" : "secondary"}>
                              {area.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingArea(area);
                                setAreaSchedule(area.schedule || []);
                                setIsAreaDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Area</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{area.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteArea(area)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Duration Settings</CardTitle>
              <Dialog open={isDurationDialogOpen} onOpenChange={setIsDurationDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingDuration(null);
                      setIsDurationDialogOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Duration
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleSaveDuration}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDuration ? 'Edit Duration' : 'Add New Duration'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure the campaign duration options.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration_name">Duration Name</Label>
                        <Input
                          id="duration_name"
                          name="name"
                          placeholder="e.g., 6 Months"
                          defaultValue={editingDuration?.name || ''}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="duration_description">Description</Label>
                        <Textarea
                          id="duration_description"
                          name="description"
                          placeholder="Brief description"
                          defaultValue={editingDuration?.description || ''}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="months">Months</Label>
                          <Input
                            id="months"
                            name="months"
                            type="number"
                            defaultValue={editingDuration?.months || ''}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issues">Issues</Label>
                          <Input
                            id="issues"
                            name="issues"
                            type="number"
                            defaultValue={editingDuration?.issues || ''}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="duration_is_active"
                          name="is_active"
                          value="true"
                          defaultChecked={editingDuration?.is_active ?? true}
                        />
                        <Label htmlFor="duration_is_active">Active</Label>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDurationDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          editingDuration ? 'Update Duration' : 'Create Duration'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {safeDurations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No campaign durations configured yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Duration</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Months</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeDurations.map((duration) => (
                      <TableRow key={duration.id}>
                        <TableCell className="font-medium">{duration.name}</TableCell>
                        <TableCell>{duration.description || '-'}</TableCell>
                        <TableCell>{duration.months}</TableCell>
                        <TableCell>{duration.issues}</TableCell>
                        <TableCell>
                          <Badge variant={duration.is_active ? "default" : "secondary"}>
                            {duration.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingDuration(duration);
                                setIsDurationDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
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
                                    onClick={() => handleDeleteDuration(duration)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default LeafletingManagement;
