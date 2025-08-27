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
import { useLeafletAreas, useLeafletSizes, useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { useStepForm } from './StepForm';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Helper function to format month display
const formatMonthDisplay = (monthString: string) => {
  console.log('[formatMonthDisplay] Input monthString:', monthString);
  
  if (!monthString) {
    console.log('[formatMonthDisplay] Empty monthString provided');
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
        console.error('[formatMonthDisplay] Unrecognized month name:', parts[0]);
        return monthString; // Return original if we can't parse
      }
    } else {
      console.error('[formatMonthDisplay] Unexpected format with space:', monthString);
      return monthString;
    }
  } else {
    console.error('[formatMonthDisplay] Unrecognized format:', monthString);
    return monthString; // Return original if we can't parse
  }
  
  const monthNumber = parseInt(month, 10);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (monthNumber < 1 || monthNumber > 12 || !year) {
    console.error('[formatMonthDisplay] Invalid month number or year:', { monthNumber, year, original: monthString });
    return monthString; // Return original if invalid
  }
  
  const result = `${monthNames[monthNumber - 1]} ${year}`;
  console.log('[formatMonthDisplay] Formatted result:', result);
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
    error,
    refetch
  } = usePricingData();

  // Use leafleting data hooks
  const { data: leafletAreas, isLoading: leafletAreasLoading, error: leafletAreasError } = useLeafletAreas();
  const { data: leafletSizes, isLoading: leafletSizesLoading, error: leafletSizesError } = useLeafletSizes();
  const { data: leafletDurations, isLoading: leafletDurationsLoading, error: leafletDurationsError } = useLeafletCampaignDurations();

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setSelectedAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  }, []);

  const handleBogofPaidAreaChange = useCallback((areaId: string, checked: boolean) => {
    setBogofPaidAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
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

    console.log('Pricing breakdown calculation - inputs:', {
      effectiveSelectedAreas: effectiveSelectedAreas.length,
      selectedAdSize,
      selectedDuration,
      pricingModel,
      areasCount: areas?.length,
      adSizesCount: adSizes?.length,
      durationsCount: durations?.length
    });

    // Handle regular advertising pricing
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      console.log('Pricing breakdown conditions not met:', {
        selectedAdSize: !!selectedAdSize,
        selectedDuration: !!selectedDuration,
        effectiveSelectedAreas: effectiveSelectedAreas.length
      });
      return null;
    }

    const relevantDurations = pricingModel === 'bogof' ? subscriptionDurations : durations;
    
    console.log('About to call calculateAdvertisingPrice with:', {
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      isSubscription: pricingModel === 'bogof',
      areasData: areas?.map(a => ({ id: a.id, name: a.name })),
      adSizesData: adSizes?.map(a => ({ id: a.id, name: a.name })),
      durationsData: relevantDurations?.map(d => ({ id: d.id, name: d.name })),
      subscriptionDurationsData: subscriptionDurations?.map(d => ({ id: d.id, name: d.name })),
      volumeDiscountsData: volumeDiscounts?.length
    });
    
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
    
    console.log('calculateAdvertisingPrice result:', {
      result: !!result,
      resultData: result ? {
        subtotal: result.subtotal,
        finalTotal: result.finalTotal,
        totalCirculation: result.totalCirculation
      } : null,
      effectiveSelectedAreas: effectiveSelectedAreas.length,
      selectedAdSize,
      selectedDuration,
      pricingModel
    });
    
    return result;
  }, [effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, bogofPaidAreas, selectedAreas, leafletAreas, leafletDurations]);

  // Enhanced auto-duration selection with better state tracking
  useEffect(() => {
    console.log('Duration useEffect triggered:', {
      pricingModel,
      prevPricingModel,
      durationsLength: durations?.length,
      subscriptionDurationsLength: subscriptionDurations?.length,
      leafletDurationsLength: leafletDurations?.length,
      currentSelectedDuration: selectedDuration
    });

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
          console.log('Current duration selection invalid for', pricingModel, '- clearing');
          setSelectedDuration("");
        }
      }
      
      // Update previous model reference
      setPrevPricingModel(pricingModel);
    } catch (error) {
      console.error('Error in duration useEffect:', error);
    }
  }, [pricingModel, durations, subscriptionDurations, leafletDurations, selectedDuration, prevPricingModel]);

  // Sync with initial data when provided (only once)
  useEffect(() => {
    if (initialData && !initialDataSynced.current) {
      if (initialData.selectedAreas) setSelectedAreas(initialData.selectedAreas);
      if (initialData.bogofPaidAreas) setBogofPaidAreas(initialData.bogofPaidAreas);
      if (initialData.bogofFreeAreas) setBogofFreeAreas(initialData.bogofFreeAreas);
      if (initialData.selectedAdSize) setSelectedAdSize(initialData.selectedAdSize);
      if (initialData.selectedDuration) setSelectedDuration(initialData.selectedDuration);
      if (initialData.selectedMonths) setSelectedMonths(initialData.selectedMonths);
      initialDataSynced.current = true;
    }
  }, [initialData]);

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
          {error && (
            <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              {error.message}
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Your Paid Areas (Buy One Get One Free!)</h3>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-primary font-medium">
                  🎉 Special BOGOF Offer: For every area you select and pay for, you get an additional area FREE!
                </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areas.map((area) => (
                    <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`paid-${area.id}`}
                            checked={bogofPaidAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleBogofPaidAreaChange(area.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2" onClick={() => handleBogofPaidAreaChange(area.id, !bogofPaidAreas.includes(area.id))}>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`paid-${area.id}`} className="text-sm font-medium cursor-pointer">
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
              
              {/* Show Free Areas Selection when paid areas are selected */}
              {bogofPaidAreas.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-lg font-semibold text-green-600">Select Your FREE Areas!</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-3">
                      🎁 You can select up to {bogofPaidAreas.length} FREE area{bogofPaidAreas.length > 1 ? 's' : ''} to go with your {bogofPaidAreas.length} paid area{bogofPaidAreas.length > 1 ? 's' : ''}!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areas.filter(area => !bogofPaidAreas.includes(area.id)).map((area) => (
                        <div key={area.id} className="flex items-center space-x-3 p-3 bg-white rounded border border-green-200">
                          <Checkbox
                            id={`free-${area.id}`}
                            checked={bogofFreeAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleBogofFreeAreaChange(area.id, checked as boolean)}
                            disabled={!bogofFreeAreas.includes(area.id) && bogofFreeAreas.length >= bogofPaidAreas.length}
                          />
                          <Label htmlFor={`free-${area.id}`} className="text-sm cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{area.name}</span>
                              <Badge variant="secondary" className="text-xs text-green-700">FREE</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {area.circulation?.toLocaleString()} homes
                            </div>
                            {/* Schedule Information for Free Areas */}
                            {area.schedule && area.schedule.length > 0 && (
                              <div className="text-xs text-gray-600 mt-2">
                                <div className="font-medium mb-1">Publication Schedule:</div>
                                <div className="grid grid-cols-3 gap-1">
                                  <div>Copy: {area.schedule[0]?.copyDeadline}</div>
                                  <div>Print: {area.schedule[0]?.printDeadline}</div>
                                  <div>Delivery: {area.schedule[0]?.deliveryDate}</div>
                                </div>
                              </div>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
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
                            
                            // Add debugging for month data structure
                            console.log(`[LeafletAreas] Area ${area.area_number} schedule:`, availableMonths);
                            if (availableMonths.length > 0) {
                              console.log(`[LeafletAreas] First month sample:`, availableMonths[0]);
                            }
                            
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
                                                 console.log(`[MonthDisplay] Raw month data:`, monthData);
                                                 console.log(`[MonthDisplay] monthData.month:`, monthData.month);
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
              leafletSizesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading leaflet sizes...
                </div>
              ) : leafletSizesError || !leafletSizes || leafletSizes.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {leafletSizesError ? `Failed to load leaflet sizes: ${leafletSizesError.message}` : 'No leaflet sizes available.'}
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose leaflet size" />
                  </SelectTrigger>
                  <SelectContent>
                    {leafletSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{size.label}</span>
                          <span className="ml-4 text-muted-foreground">
                            {size.description || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                Select the months you want your advertising to run for each selected area:
              </p>
              
              {(() => {
                // Get campaign duration info
                const relevantDurations = pricingModel === 'bogof' ? subscriptionDurations : durations;
                const durationData = relevantDurations?.find(d => d.id === selectedDuration);
                const maxSelectableMonths = durationData?.duration_value || 1;
                
                // For BOGOF, we need to show both paid and free areas
                const areasToShow = pricingModel === 'bogof' 
                  ? [
                      ...bogofPaidAreas.map(id => ({ id, type: 'paid' as const })),
                      ...bogofFreeAreas.map(id => ({ id, type: 'free' as const }))
                    ]
                  : effectiveSelectedAreas.map(id => ({ id, type: 'regular' as const }));
                
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
                              {type === 'free' && (
                                <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                                  FREE AREA
                                </Badge>
                              )}
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
                                             console.log(`[MonthDisplay2] Raw month data:`, monthData);
                                             console.log(`[MonthDisplay2] monthData.month:`, monthData.month);
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
                {pricingModel === 'fixed' ? 'SUMMARY & COST TO BOOK' : 'Pricing Summary'}
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
