import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';
import { calculateLeafletingPrice } from '@/lib/leafletingCalculator';
import { useLeafletAreas, useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { useStepForm } from './StepForm';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import AreaSelectionStep from './AreaSelectionStep';
import AdvertisementSizeStep from './AdvertisementSizeStep';
import DurationScheduleStep from './DurationScheduleStep';

// Helper function to format month display
const formatMonthDisplay = (monthString: string) => {
  if (!monthString) {
    return 'Invalid Date';
  }
  
  // Handle different possible formats
  let year: string, month: string;
  
  if (monthString.includes('-')) {
    // Parse "2025-09" or "2025-9" format
    [year, month] = monthString.split('-');
  } else if (monthString.includes(' ')) {
    // Parse "June 2026" format - convert to expected format
    const parts = monthString.split(' ');
    if (parts.length === 2) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthIndex = monthNames.findIndex(name => name.toLowerCase() === parts[0].toLowerCase());
      if (monthIndex !== -1) {
        month = String(monthIndex + 1).padStart(2, '0');
        year = parts[1];
      } else {
        return monthString; // Return original if we can't parse
      }
    } else {
      return monthString;
    }
  } else {
    // Check if it's just a standalone month name (e.g., "June")
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.findIndex(name => name.toLowerCase() === monthString.toLowerCase());
    if (monthIndex !== -1) {
      // It's a valid month name, return as-is
      return monthString;
    } else {
      return monthString; // Return original if we can't parse
    }
  }
  
  const monthNumber = parseInt(month, 10);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (monthNumber < 1 || monthNumber > 12 || !year) {
    return monthString; // Return original if invalid
  }
  
  const result = `${monthNames[monthNumber - 1]} ${year}`;
  return result;
};

interface CalculatorStepFormProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  onDataChange?: (data: any) => void;
  initialData?: {
    selectedAreas?: string[];
    bogofPaidAreas?: string[];
    bogofFreeAreas?: string[];
    selectedAdSize?: string;
    selectedDuration?: string;
    selectedMonths?: Record<string, string[]>;
  };
}

export const CalculatorStepForm: React.FC<CalculatorStepFormProps> = ({ pricingModel, onDataChange, initialData }) => {
  const { nextStep } = useStepForm();
  
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);
  const [selectedAdSize, setSelectedAdSize] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedMonths, setSelectedMonths] = useState<Record<string, string[]>>({});
  const [prevPricingModel, setPrevPricingModel] = useState<string>(pricingModel);
  const initialDataSynced = useRef(false);

  // Use the pricing data hook
  const {
    areas,
    adSizes,
    durations,
    subscriptionDurations,
    volumeDiscounts,
    isLoading,
    isError,
    refetch
  } = usePricingData();

  // Use leafleting data hooks
  const { data: leafletAreas, isLoading: leafletAreasLoading, error: leafletAreasError } = useLeafletAreas();
  const { data: leafletDurations, isLoading: leafletDurationsLoading, error: leafletDurationsError } = useLeafletCampaignDurations();

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setSelectedAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  }, []);

  const handleBogofPaidAreaChange = useCallback((areaId: string, checked: boolean) => {
    setBogofPaidAreas(prev => {
      const newPaidAreas = checked ? [...prev, areaId] : prev.filter(id => id !== areaId);
      
      // If we're reducing paid areas, also reduce free areas to match
      if (!checked && newPaidAreas.length < prev.length) {
        setBogofFreeAreas(currentFreeAreas => {
          // If we have more free areas than paid areas after reduction, trim the free areas
          if (currentFreeAreas.length > newPaidAreas.length) {
            const excessCount = currentFreeAreas.length - newPaidAreas.length;
            // Remove the excess free areas (from the end of the array)
            return currentFreeAreas.slice(0, currentFreeAreas.length - excessCount);
          }
          return currentFreeAreas;
        });
      }
      
      return newPaidAreas;
    });
  }, []);

  const handleBogofFreeAreaChange = useCallback((areaId: string, checked: boolean) => {
    setBogofFreeAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  }, []);

  const effectiveSelectedAreas = useMemo(() => {
    return pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;
  }, [pricingModel, selectedAreas, bogofPaidAreas]);

  const pricingBreakdown = useMemo(() => {
    // Handle leafleting service pricing
    if (pricingModel === 'leafleting') {
      if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
        return null;
      }
      const selectedLeafletDurationData = leafletDurations?.find(d => d.id === selectedDuration);
      const durationMultiplier = selectedLeafletDurationData?.months || 1;
      return calculateLeafletingPrice(effectiveSelectedAreas, leafletAreas || [], durationMultiplier);
    }

    // Handle regular advertising pricing
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }

    const relevantDurations = pricingModel === 'bogof' ? subscriptionDurations : durations;
    
    
    const result = calculateAdvertisingPrice(
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      pricingModel === 'bogof',
      areas,
      adSizes,
      relevantDurations,
      subscriptionDurations,
      volumeDiscounts
    );
    
    return result;
  }, [effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, bogofPaidAreas, selectedAreas, leafletAreas, leafletDurations]);

  // Enhanced auto-duration selection with better state tracking
  useEffect(() => {

    try {
      // Handle leafleting service
      if (pricingModel === 'leafleting' && leafletDurations && leafletDurations.length > 0) {
        // Only clear duration when pricing model actually changes
        if (pricingModel !== prevPricingModel && prevPricingModel !== pricingModel) {
          setSelectedDuration("");
          setPrevPricingModel(pricingModel);
          return;
        }
        
        // Auto-select if only one duration option and no duration currently selected
        if (leafletDurations.length === 1 && !selectedDuration) {
          const defaultDuration = leafletDurations[0];
          setSelectedDuration(defaultDuration.id);
        } else if (!selectedDuration) {
          const defaultDuration = leafletDurations.find(d => (d as any).is_default) || leafletDurations[0];
          if (defaultDuration) {
            setSelectedDuration(defaultDuration.id);
          }
        }
      } 
      // Handle BOGOF subscription
      else if (pricingModel === 'bogof' && subscriptionDurations && subscriptionDurations.length > 0) {
        // Only clear duration when pricing model actually changes
        if (pricingModel !== prevPricingModel && prevPricingModel !== null) {
          setSelectedDuration("");
          setPrevPricingModel(pricingModel);
          return;
        }
        
        // Auto-set BOGOF to 6 months
        const sixMonthDuration = subscriptionDurations.find(d => d.duration_value === 6);
        if (sixMonthDuration) {
          setSelectedDuration(sixMonthDuration.id);
        }
      } 
      // Handle fixed pricing
      else if (pricingModel === 'fixed') {
        // Only clear duration when pricing model actually changes
        if (pricingModel !== prevPricingModel && prevPricingModel !== null) {
          setSelectedDuration("");
          setPrevPricingModel(pricingModel);
          return;
        }
        
        // Auto-select if only one duration option and no duration currently selected
        if (durations?.length === 1 && !selectedDuration) {
          setSelectedDuration(durations[0].id);
        }
        
        // Validate current selection is still valid for fixed
        if (selectedDuration) {
          const isValidForFixed = durations?.some(d => d.id === selectedDuration);
          if (!isValidForFixed) {
            setSelectedDuration('');
          }
        }
      }
      
      // Validate current selection is still valid for the current model
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations :
        pricingModel === 'bogof' ? subscriptionDurations : durations;
        
      if (selectedDuration && relevantDurations && relevantDurations.length > 0) {
        const isValidSelection = relevantDurations.some(d => d.id === selectedDuration);
        if (!isValidSelection) {
          
          setSelectedDuration("");
        }
      }
      
      // Update previous model reference
      setPrevPricingModel(pricingModel);
    } catch (error) {
      console.error('Error in duration useEffect:', error);
    }
  }, [pricingModel, durations, subscriptionDurations, leafletDurations, selectedDuration, prevPricingModel]);

  // Sync with initial data when provided
  useEffect(() => {
    if (initialData && !initialDataSynced.current) {
      if (initialData.selectedAreas) setSelectedAreas(initialData.selectedAreas);
      if (initialData.bogofPaidAreas) setBogofPaidAreas(initialData.bogofPaidAreas);
      if (initialData.bogofFreeAreas) setBogofFreeAreas(initialData.bogofFreeAreas);
      if (initialData.selectedAdSize) setSelectedAdSize(initialData.selectedAdSize);
      
      // Handle duration syncing with pricing model compatibility
      if (initialData.selectedDuration) {
        const relevantDurations = pricingModel === 'leafleting' ? leafletDurations :
          pricingModel === 'bogof' ? subscriptionDurations : durations;
          
        if (relevantDurations && relevantDurations.length > 0) {
          // Check if the initial duration is valid for current pricing model
          const isValidDuration = relevantDurations.some(d => d.id === initialData.selectedDuration);
          if (isValidDuration) {
            setSelectedDuration(initialData.selectedDuration);
          } else {
            // For BOGOF, try to select the first available subscription duration
            if (pricingModel === 'bogof' && subscriptionDurations && subscriptionDurations.length > 0) {
              setSelectedDuration(subscriptionDurations[0].id);
            }
          }
        }
      }
      
      if (initialData.selectedMonths) setSelectedMonths(initialData.selectedMonths);
      
      initialDataSynced.current = true;
    }
  }, [initialData, pricingModel, durations, subscriptionDurations, leafletDurations]);

  // Pass data to parent component
  useEffect(() => {
    onDataChange?.({
      selectedAreas,
      bogofPaidAreas,
      bogofFreeAreas,
      selectedAdSize,
      selectedDuration,
      selectedMonths,
      pricingBreakdown
    });
  }, [selectedAreas, bogofPaidAreas, bogofFreeAreas, selectedAdSize, selectedDuration, selectedMonths, pricingBreakdown, onDataChange]);

  // Enhanced error state with retry functionality
  if (isError) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Loading Error
          </CardTitle>
          <CardDescription>
            Unable to load pricing data. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Unable to load pricing data. Please try again.
          </p>
        {isError && (
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            Failed to load pricing data
          </div>
        )}
          <Button onClick={() => refetch()} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Configure Your Campaign</h2>
          <p className="text-muted-foreground">
            Complete your {pricingModel === 'fixed' ? 'Fixed Term' : 
                          pricingModel === 'bogof' ? 'BOGOF Subscription' : 
                          'Leafleting Service'} setup
          </p>
        </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          
          
          {/* Distribution Areas */}
          {pricingModel === 'fixed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Distribution Areas</h3>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading distribution areas...
                </div>
              ) : areas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No distribution areas available</p>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areas.map((area) => (
                    <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={area.id}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2" onClick={() => handleAreaChange(area.id, !selectedAreas.includes(area.id))}>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={area.id} className="text-sm font-medium cursor-pointer">
                                {area.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {area.circulation?.toLocaleString()} homes
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {(area as any).description || 'Area description'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Postcodes: {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : 'N/A'}</span>
                            </div>
                            {/* Schedule Information */}
                            {area.schedule && area.schedule.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="text-xs font-medium text-gray-700 mb-1">Publication Schedule:</div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium">Copy:</span> {area.schedule[0]?.copyDeadline || 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Print:</span> {area.schedule[0]?.printDeadline || 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Delivery:</span> {area.schedule[0]?.deliveryDate || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOGOF Areas Selection */}
          {pricingModel === 'bogof' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">3+ Repeat Package Areas Selection</h3>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-primary font-medium">
                    🎉 Special BOGOF Offer: For every area you select and pay for, you get an additional area FREE!
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading distribution areas...
                </div>
              ) : areas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No distribution areas available</p>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Paid Areas Section */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-primary">Select Your Paid Areas</h4>
                      <p className="text-sm text-muted-foreground">Choose the areas you want to pay for</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {areas.map((area) => (
                        <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id={`paid-${area.id}`}
                                checked={bogofPaidAreas.includes(area.id)}
                                onCheckedChange={(checked) => handleBogofPaidAreaChange(area.id, checked as boolean)}
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-1" onClick={() => handleBogofPaidAreaChange(area.id, !bogofPaidAreas.includes(area.id))}>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`paid-${area.id}`} className="text-sm font-medium cursor-pointer">
                                    {area.name}
                                  </Label>
                                  <Badge variant="outline" className="text-xs">
                                    {area.circulation?.toLocaleString()} homes
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {(area as any).description || 'Area description'}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  Postcodes: {Array.isArray(area.postcodes) ? area.postcodes.slice(0, 2).join(', ') : 'N/A'}
                                  {Array.isArray(area.postcodes) && area.postcodes.length > 2 && '...'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Free Areas Section */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-green-600">Select Your FREE Areas</h4>
                      <p className="text-sm text-muted-foreground">
                        {bogofPaidAreas.length > 0 
                          ? `Choose up to ${bogofPaidAreas.length} FREE area${bogofPaidAreas.length > 1 ? 's' : ''}`
                          : 'Select paid areas first to unlock free areas'
                        }
                      </p>
                    </div>
                    
                    {bogofPaidAreas.length > 0 ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {areas.filter(area => !bogofPaidAreas.includes(area.id)).map((area) => (
                          <Card key={area.id} className={`cursor-pointer transition-all ${
                            bogofFreeAreas.includes(area.id) || bogofFreeAreas.length < bogofPaidAreas.length
                              ? 'hover:shadow-md' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}>
                            <CardContent className="p-3 bg-green-50/50">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  id={`free-${area.id}`}
                                  checked={bogofFreeAreas.includes(area.id)}
                                  onCheckedChange={(checked) => handleBogofFreeAreaChange(area.id, checked as boolean)}
                                  disabled={!bogofFreeAreas.includes(area.id) && bogofFreeAreas.length >= bogofPaidAreas.length}
                                  className="mt-1"
                                />
                                <div className="flex-1 space-y-1" onClick={() => {
                                  if (bogofFreeAreas.includes(area.id) || bogofFreeAreas.length < bogofPaidAreas.length) {
                                    handleBogofFreeAreaChange(area.id, !bogofFreeAreas.includes(area.id));
                                  }
                                }}>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor={`free-${area.id}`} className="text-sm font-medium cursor-pointer">
                                      {area.name}
                                    </Label>
                                    <Badge variant="outline" className="text-xs">
                                      {area.circulation?.toLocaleString()} homes
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {(area as any).description || 'Area description'}
                                  </p>
                                  <div className="text-xs text-muted-foreground">
                                    Postcodes: {Array.isArray(area.postcodes) ? area.postcodes.slice(0, 2).join(', ') : 'N/A'}
                                    {Array.isArray(area.postcodes) && area.postcodes.length > 2 && '...'}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                        <p className="text-sm">Select paid areas above to unlock free area selection</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Leafleting Areas */}
          {pricingModel === 'leafleting' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Leaflet Distribution Areas</h3>
              {leafletAreasLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading leaflet areas...
                </div>
              ) : leafletAreasError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load leaflet areas: {leafletAreasError.message}
                  </AlertDescription>
                </Alert>
              ) : !leafletAreas || leafletAreas.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No leaflet areas available. Please check the admin configuration.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leafletAreas.map((area) => (
                    <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`leaflet-${area.id}`}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2" onClick={() => handleAreaChange(area.id, !selectedAreas.includes(area.id))}>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`leaflet-${area.id}`} className="text-sm font-medium cursor-pointer">
                                {area.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {(area as any).circulation?.toLocaleString() || 0} homes
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div>Copy: {(area as any).copy_deadline || 'N/A'}</div>
                              <div>Print: {(area as any).print_deadline || 'N/A'}</div>
                              <div>Delivery: {(area as any).delivery_date || 'N/A'}</div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Price per 1000:</span>
                              <span className="font-medium">£{(area as any).price_per_thousand || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Publication Schedule for Leafleting */}
              {selectedAreas.length > 0 && selectedDuration && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Publication Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select the months you want your leafleting to run for each selected area:
                  </p>

                  {(() => {
                    // Get leaflet campaign duration info  
                    const durationData = leafletDurations?.find(d => d.id === selectedDuration);
                    const maxSelectableMonths = durationData?.months || 1;
                    
                    return (
                      <div className="space-y-6">
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                          <p className="text-sm font-medium text-primary">
                            📅 You can select up to {maxSelectableMonths} month{maxSelectableMonths > 1 ? 's' : ''} for each area based on your selected campaign duration
                          </p>
                        </div>
                        
                        {leafletAreas
                          ?.filter(area => selectedAreas.includes(area.id))
                          .map((area) => {
                             const availableMonths = area.schedule || [];
                             const areaSelectedMonths = selectedMonths[area.id] || [];
                             
                             if (availableMonths.length === 0) {
                              return (
                                <div key={area.id} className="border rounded-lg p-4">
                                  <h4 className="font-medium text-lg mb-2">Area {area.area_number}: {area.name}</h4>
                                  <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4" />
                                      Schedule information not available for this area. Please contact our team for details.
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div key={area.id} className="border rounded-lg p-4">
                                <h4 className="font-medium text-lg mb-4 flex items-center justify-between">
                                  <div>Area {area.area_number}: {area.name}</div>
                                  <Badge variant="outline" className="text-xs">
                                    {areaSelectedMonths.length}/{maxSelectableMonths} selected
                                  </Badge>
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {availableMonths.map((monthData: any, index: number) => {
                                    const isSelected = areaSelectedMonths.includes(monthData.month);
                                    const isDisabled = !isSelected && areaSelectedMonths.length >= maxSelectableMonths;
                                    
                                    return (
                                      <div key={index} className={`
                                        border rounded-lg p-4 cursor-pointer transition-all
                                        ${isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                      `}>
                                        <div className="flex items-start space-x-3">
                                          <Checkbox
                                            id={`leaflet-month-${area.id}-${index}`}
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onCheckedChange={(checked) => {
                                              setSelectedMonths(prev => {
                                                const currentAreaMonths = prev[area.id] || [];
                                                if (checked) {
                                                  if (currentAreaMonths.length < maxSelectableMonths) {
                                                    return {
                                                      ...prev,
                                                      [area.id]: [...currentAreaMonths, monthData.month]
                                                    };
                                                  }
                                                } else {
                                                  return {
                                                    ...prev,
                                                    [area.id]: currentAreaMonths.filter(m => m !== monthData.month)
                                                  };
                                                }
                                                return prev;
                                              });
                                            }}
                                            className="mt-1"
                                          />
                                          <div className="flex-1 space-y-2" onClick={() => {
                                            if (isDisabled) return;
                                            setSelectedMonths(prev => {
                                              const currentAreaMonths = prev[area.id] || [];
                                              const isCurrentlySelected = currentAreaMonths.includes(monthData.month);
                                              if (isCurrentlySelected) {
                                                return {
                                                  ...prev,
                                                  [area.id]: currentAreaMonths.filter(m => m !== monthData.month)
                                                };
                                              } else if (currentAreaMonths.length < maxSelectableMonths) {
                                                return {
                                                  ...prev,
                                                  [area.id]: [...currentAreaMonths, monthData.month]
                                                };
                                              }
                                              return prev;
                                            });
                                           }}>
                                             <div className="font-medium text-sm">
                                               {(() => {
                                                 return formatMonthDisplay(monthData.month);
                                               })()}
                                             </div>
                                            <div className="space-y-1 text-xs">
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Copy Deadline:</span>
                                                <span>{monthData.copyDeadline || 'TBA'}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Print Deadline:</span>
                                                <span>{monthData.printDeadline || 'TBA'}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Delivery:</span>
                                                <span>{monthData.deliveryDate || 'TBA'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })()}
                  
                  <div className="text-xs text-muted-foreground">
                    * Schedule may vary by area and is subject to change. Final schedules will be confirmed upon booking.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ad Size Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {pricingModel === 'leafleting' ? 'Select Leaflet Size' : 'Select Advertisement Size'}
            </h3>
            
            {pricingModel === 'leafleting' ? (
              // Leaflet sizes
              leafletAreasLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading areas...
                </div>
              ) : leafletAreasError || !leafletAreas || leafletAreas.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {leafletAreasError ? `Failed to load leaflet areas: ${leafletAreasError.message}` : 'No leaflet areas available.'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Ad size selection not applicable for leafleting service
                </div>
              )
            ) : (
              // Regular ad sizes
              isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading ad sizes...
                </div>
              ) : adSizes.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No ad sizes available. Please check the admin configuration.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose advertisement size" />
                  </SelectTrigger>
                  <SelectContent>
                    {adSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{size.name}</span>
                          <span className="ml-4 text-muted-foreground">
                            {size.dimensions} - £{(size as any).base_price || 0}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Campaign Duration</h3>
            
            {(() => {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations :
        pricingModel === 'bogof' ? subscriptionDurations : durations;
              const isLoadingDurations = pricingModel === 'leafleting' ? leafletDurationsLoading : isLoading;
              const durationsError = pricingModel === 'leafleting' ? leafletDurationsError : null;

              if (isLoadingDurations) {
                return (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading campaign durations...
                  </div>
                );
              }

              if (durationsError || !relevantDurations || relevantDurations.length === 0) {
                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {durationsError ? `Failed to load durations: ${durationsError.message}` : 'No campaign durations available.'}
                    </AlertDescription>
                  </Alert>
                );
              }

              return (
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose campaign duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantDurations.map((duration) => (
                      <SelectItem key={duration.id} value={duration.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{duration.name}</span>
                          <span className="ml-4 text-muted-foreground">
                            {pricingModel === 'leafleting' 
                              ? `${(duration as any).months || 1} month${((duration as any).months || 1) > 1 ? 's' : ''}`
                              : duration.description
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
          </div>

          {/* Schedule Management - Per Area */}
          {((pricingModel === 'bogof' && (bogofPaidAreas.length > 0 || bogofFreeAreas.length > 0)) || 
            (pricingModel !== 'bogof' && effectiveSelectedAreas.length > 0)) && 
           pricingModel !== 'leafleting' && selectedDuration && (
            <div className="bg-background border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold">Publication Schedule</h3>
              <p className="text-sm text-muted-foreground">
                {pricingModel === 'bogof' 
                  ? 'Select ONE publication start date that will apply to ALL your selected areas:'
                  : 'Select the months you want your advertising to run for each selected area:'}
              </p>
              
              {(() => {
                // Get campaign duration info
                const relevantDurations = pricingModel === 'bogof' ? subscriptionDurations : durations;
                const durationData = relevantDurations?.find(d => d.id === selectedDuration);
                
                if (pricingModel === 'bogof') {
                  // For 3+ Repeat Package, show single start date selection
                  const maxSelectableMonths = Math.floor((durationData?.duration_value || 6) / 2); // Convert months to issues
                  const allAreas = [
                    ...bogofPaidAreas.map(id => areas.find(a => a.id === id)).filter(Boolean),
                    ...bogofFreeAreas.map(id => areas.find(a => a.id === id)).filter(Boolean)
                  ];
                  
                  // Get all available months from all areas to find common start dates
                  const availableStartDates = allAreas.length > 0 && allAreas[0]?.schedule 
                    ? allAreas[0].schedule.map((monthData: any) => monthData.month)
                    : [];
                  
                  // Get the first selected area's selected month as the global start date
                  const globalStartDate = Object.keys(selectedMonths).length > 0 
                    ? selectedMonths[Object.keys(selectedMonths)[0]]?.[0] || null
                    : null;
                  
                  return (
                    <div className="space-y-6">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm font-medium text-primary">
                          📅 Select your campaign start date - this will apply to ALL {allAreas.length} selected areas
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h4 className="font-medium text-lg mb-4">
                          Campaign Start Date for All Areas
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          This start date will be used for all {allAreas.length} areas in your campaign.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {availableStartDates.map((month: string, index: number) => {
                            const isSelected = globalStartDate === month;
                            
                            return (
                              <div key={index} className={`
                                border rounded-lg p-4 cursor-pointer transition-all
                                ${isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-muted hover:border-primary/50'}
                              `}>
                                <div className="flex items-start space-x-3">
                                  <input
                                    type="radio"
                                    id={`global-start-${index}`}
                                    name="global-start-date"
                                    checked={isSelected}
                                    onChange={() => {
                                      // Set the same start date for all areas
                                      const newSelectedMonths: { [key: string]: string[] } = {};
                                      [...bogofPaidAreas, ...bogofFreeAreas].forEach(areaId => {
                                        newSelectedMonths[areaId] = [month];
                                      });
                                      setSelectedMonths(newSelectedMonths);
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 space-y-2" onClick={() => {
                                    // Set the same start date for all areas
                                    const newSelectedMonths: { [key: string]: string[] } = {};
                                    [...bogofPaidAreas, ...bogofFreeAreas].forEach(areaId => {
                                      newSelectedMonths[areaId] = [month];
                                    });
                                    setSelectedMonths(newSelectedMonths);
                                  }}>
                                    <div className="font-medium text-sm">
                                      {formatMonthDisplay(month)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Applies to all {allAreas.length} selected areas
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {allAreas.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium mb-2">Areas included in this campaign:</h5>
                            <div className="flex flex-wrap gap-2">
                              {allAreas.map((area) => (
                                <Badge key={area?.id} variant="outline" className="text-xs">
                                  {area?.name}
                                  {bogofFreeAreas.includes(area?.id || '') && (
                                    <span className="ml-1 text-green-600">(FREE)</span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // Regular pricing model logic (unchanged)
                const maxSelectableMonths = (durationData?.duration_value || 1);
                const areasToShow = effectiveSelectedAreas.map(id => ({ id, type: 'regular' as const }));
                
                return (
                  <div className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-primary">
                        📅 You can select up to {maxSelectableMonths} month{maxSelectableMonths > 1 ? 's' : ''} for each area based on your selected campaign duration
                      </p>
                    </div>
                    
                    {areasToShow.map(({ id: areaId, type }) => {
                      const area = areas.find(a => a.id === areaId);
                      const availableMonths = area?.schedule || [];
                      const areaSelectedMonths = selectedMonths[areaId] || [];
                      
                      if (!area || availableMonths.length === 0) {
                        return (
                          <div key={areaId} className="border rounded-lg p-4">
                            <h4 className="font-medium text-lg mb-2">{area?.name || 'Unknown Area'}</h4>
                            <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-md">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Schedule information not available for this area. Please contact our team for details.
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={areaId} className="border rounded-lg p-4">
                          <h4 className="font-medium text-lg mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {area.name}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {areaSelectedMonths.length}/{maxSelectableMonths} selected
                            </Badge>
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableMonths.map((monthData: any, index: number) => {
                              const isSelected = areaSelectedMonths.includes(monthData.month);
                              const isDisabled = !isSelected && areaSelectedMonths.length >= maxSelectableMonths;
                              
                              return (
                                <div key={index} className={`
                                  border rounded-lg p-4 cursor-pointer transition-all
                                  ${isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
                                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}>
                                  <div className="flex items-start space-x-3">
                                    <Checkbox
                                      id={`month-${areaId}-${index}`}
                                      checked={isSelected}
                                      disabled={isDisabled}
                                      onCheckedChange={(checked) => {
                                        setSelectedMonths(prev => {
                                          const currentAreaMonths = prev[areaId] || [];
                                          if (checked) {
                                            if (currentAreaMonths.length < maxSelectableMonths) {
                                              return {
                                                ...prev,
                                                [areaId]: [...currentAreaMonths, monthData.month]
                                              };
                                            }
                                          } else {
                                            return {
                                              ...prev,
                                              [areaId]: currentAreaMonths.filter(m => m !== monthData.month)
                                            };
                                          }
                                          return prev;
                                        });
                                      }}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 space-y-2" onClick={() => {
                                      if (isDisabled) return;
                                      setSelectedMonths(prev => {
                                        const currentAreaMonths = prev[areaId] || [];
                                        const isCurrentlySelected = currentAreaMonths.includes(monthData.month);
                                        if (isCurrentlySelected) {
                                          return {
                                            ...prev,
                                            [areaId]: currentAreaMonths.filter(m => m !== monthData.month)
                                          };
                                        } else if (currentAreaMonths.length < maxSelectableMonths) {
                                          return {
                                            ...prev,
                                            [areaId]: [...currentAreaMonths, monthData.month]
                                          };
                                        }
                                        return prev;
                                      });
                                       }}>
                                         <div className="font-medium text-sm">
                                           {(() => {
                                             return formatMonthDisplay(monthData.month);
                                           })()}
                                         </div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Copy Deadline:</span>
                                          <span>{monthData.copyDeadline || 'TBA'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Print Deadline:</span>
                                          <span>{monthData.printDeadline || 'TBA'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Delivery:</span>
                                          <span>{monthData.deliveryDate || 'TBA'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              
              <div className="text-xs text-muted-foreground">
                * Schedule may vary by area and is subject to change. Final schedules will be confirmed upon booking.
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          {pricingBreakdown && (
            <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {(pricingModel === 'fixed' || pricingModel === 'bogof') ? 'SUMMARY & COST TO BOOK' : 'Pricing Summary'}
              </h3>
              
              {pricingModel === 'fixed' ? (
                // Fixed Term specific format
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="mb-2"><span className="font-medium">Booking Type:</span> Fixed Term</div>
                    <div className="mb-2"><span className="font-medium">Where:</span></div>
                    {selectedAreas.map((areaId, index) => {
                      const area = areas?.find(a => a.id === areaId);
                      return area ? (
                        <div key={areaId} className="ml-2">
                          Area {index + 1} {area.name}
                        </div>
                      ) : null;
                    })}
                    <div className="mt-2">
                      <span className="font-medium">Total Circulation per selection of area/s = </span>
                      {pricingBreakdown.totalCirculation.toLocaleString()} homes
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Advert Size = </span>
                      {adSizes?.find(size => size.id === selectedAdSize)?.name || 'Selected size'}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium">Pre-payment Required = </span>
                      {formatPrice(pricingBreakdown.finalTotal)} + vat ({formatPrice(pricingBreakdown.finalTotal * 1.2)}) per insertion in {selectedAreas.length} area{selectedAreas.length > 1 ? 's' : ''} reaching {pricingBreakdown.totalCirculation.toLocaleString()} homes
                    </div>
                  </div>
                </div>
              ) : pricingModel === 'bogof' ? (
                // 3+ Repeat Package specific format
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="mb-2"><span className="font-medium">Booking Type:</span> 3+ Repeat Package</div>
                    
                    <div className="mb-2"><span className="font-medium">Advert Size:</span> {adSizes?.find(size => size.id === selectedAdSize)?.name || 'Selected size'}</div>
                    
                    <div className="mb-2"><span className="font-medium">Paid Area Locations:</span></div>
                    {bogofPaidAreas.map((areaId, index) => {
                      const area = areas?.find(a => a.id === areaId);
                      return area ? (
                        <div key={areaId} className="ml-2">
                          Paid - Area {index + 1} - {area.name}
                        </div>
                      ) : null;
                    })}
                    
                    {bogofFreeAreas.length > 0 && (
                      <>
                        <div className="mb-1 mt-3 font-medium">FREE Area Locations:</div>
                        <div className="ml-2 text-sm text-muted-foreground mb-2">
                          - These are the free areas that you'll get for the next 3 Issues/6 Months<br/>
                          - To keep these areas after 6 months, you'll need to purchase them separately<br/>
                          - Use these areas to experiment with new customer generation.
                        </div>
                        {bogofFreeAreas.map((areaId, index) => {
                          const area = areas?.find(a => a.id === areaId);
                          return area ? (
                            <div key={areaId} className="ml-2 text-green-600">
                              Free - Area {index + 1} - {area.name}
                            </div>
                          ) : null;
                        })}
                      </>
                    )}
                    
                    <div className="mt-3">
                      <span className="font-medium">Total Circulation per selection of area/s = </span>
                      {pricingBreakdown.totalCirculation.toLocaleString()} homes
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium">Pre-payment Required = </span>
                      {formatPrice(pricingBreakdown.finalTotal)} + vat ({formatPrice(pricingBreakdown.finalTotal * 1.2)}) per insertion in {bogofPaidAreas.length + bogofFreeAreas.length} area{(bogofPaidAreas.length + bogofFreeAreas.length) > 1 ? 's' : ''} reaching {pricingBreakdown.totalCirculation.toLocaleString()} homes
                    </div>
                  </div>
                </div>
              ) : (
                // Standard format for other pricing models
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(pricingBreakdown.subtotal)}</span>
                  </div>
                  
                  {pricingBreakdown.volumeDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                      <span>-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                    </div>
                  )}
                  
                  {(pricingBreakdown as any).durationDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Duration Discount:</span>
                      <span>-{formatPrice((pricingBreakdown as any).durationDiscount)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Total Circulation: {pricingBreakdown.totalCirculation.toLocaleString()} homes
                  </div>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
    </ErrorBoundary>
  );
};

export default CalculatorStepForm;
