import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Calendar, Clock } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';

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

interface DurationScheduleStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  selectedMonths: Record<string, string[]>;
  onDurationChange: (duration: string) => void;
  onMonthsChange: (months: Record<string, string[]>) => void;
  onNext: () => void;
}

export const DurationScheduleStep: React.FC<DurationScheduleStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedAdSize,
  selectedDuration,
  selectedMonths,
  onDurationChange,
  onMonthsChange,
  onNext
}) => {
  const { areas, adSizes, durations, subscriptionDurations, volumeDiscounts, isLoading, isError } = usePricingData();
  const { data: leafletDurations, isLoading: leafletDurationsLoading, error: leafletDurationsError } = useLeafletCampaignDurations();

  const getEffectiveSelectedAreas = () => {
    return pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas;
  };

  const getRelevantDurations = () => {
    if (pricingModel === 'leafleting') return leafletDurations || [];
    if (pricingModel === 'bogof') return subscriptionDurations || [];
    return durations || [];
  };

  const getIsLoadingDurations = () => {
    if (pricingModel === 'leafleting') return leafletDurationsLoading;
    return isLoading;
  };

  const getDurationsError = () => {
    if (pricingModel === 'leafleting') return leafletDurationsError;
    return null;
  };

  const effectiveSelectedAreas = getEffectiveSelectedAreas();
  const relevantDurations = getRelevantDurations();
  const isLoadingDurations = getIsLoadingDurations();
  const durationsError = getDurationsError();

  const canProceed = () => {
    if (!selectedDuration) return false;
    
    if (pricingModel === 'leafleting') {
      return effectiveSelectedAreas.length > 0 && 
             effectiveSelectedAreas.every(areaId => selectedMonths[areaId]?.length > 0);
    }
    
    if (pricingModel === 'bogof') {
      return Object.keys(selectedMonths).length > 0 && 
             Object.values(selectedMonths).some(months => months.length > 0);
    }
    
    return effectiveSelectedAreas.every(areaId => selectedMonths[areaId]?.length > 0);
  };

  const renderPricingSummary = () => {
    if (pricingModel === 'leafleting' || !selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }

    const pricingBreakdown = calculateAdvertisingPrice(
      pricingModel === 'bogof' ? bogofPaidAreas : effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      pricingModel === 'bogof',
      areas || [],
      adSizes || [],
      pricingModel === 'bogof' ? subscriptionDurations || [] : durations || [],
      subscriptionDurations || [],
      volumeDiscounts || []
    );

    if (!pricingBreakdown) return null;

    return (
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">SUMMARY & COST TO BOOK</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <div className="mb-2"><span className="font-medium">Booking Type:</span> {pricingModel === 'bogof' ? '3+ Repeat Package' : 'Fixed Term'}</div>
            
            <div className="mb-2"><span className="font-medium">Advert Size:</span> {adSizes?.find(size => size.id === selectedAdSize)?.name || 'Selected size'}</div>
            
            {pricingModel === 'bogof' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="mb-2"><span className="font-medium">Where:</span></div>
                {effectiveSelectedAreas.map((areaId, index) => {
                  const area = areas?.find(a => a.id === areaId);
                  return area ? (
                    <div key={areaId} className="ml-2">
                      Area {index + 1} {area.name}
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
              {formatPrice(pricingBreakdown.finalTotal)} + vat ({formatPrice(pricingBreakdown.finalTotal * 1.2)}) per insertion in {effectiveSelectedAreas.length} area{effectiveSelectedAreas.length > 1 ? 's' : ''} reaching {pricingBreakdown.totalCirculation.toLocaleString()} homes
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleSection = () => {
    if (!selectedDuration || effectiveSelectedAreas.length === 0) return null;

    const durationData = relevantDurations?.find(d => d.id === selectedDuration);
    
    if (pricingModel === 'bogof') {
      // For 3+ Repeat Package, show single start date selection
      const maxSelectableMonths = Math.floor(((durationData as any)?.duration_value || (durationData as any)?.months || 6) / 2);
      const allAreas = [
        ...bogofPaidAreas.map(id => areas?.find(a => a.id === id)).filter(Boolean),
        ...bogofFreeAreas.map(id => areas?.find(a => a.id === id)).filter(Boolean)
      ];
      
      const availableStartDates = allAreas.length > 0 && allAreas[0]?.schedule 
        ? allAreas[0].schedule.map((monthData: any) => monthData.month)
        : [];
      
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
                          const newSelectedMonths: { [key: string]: string[] } = {};
                          [...bogofPaidAreas, ...bogofFreeAreas].forEach(areaId => {
                            newSelectedMonths[areaId] = [month];
                          });
                          onMonthsChange(newSelectedMonths);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2" onClick={() => {
                        const newSelectedMonths: { [key: string]: string[] } = {};
                        [...bogofPaidAreas, ...bogofFreeAreas].forEach(areaId => {
                          newSelectedMonths[areaId] = [month];
                        });
                        onMonthsChange(newSelectedMonths);
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
          </div>
        </div>
      );
    }

    // For fixed term and leafleting - show area-by-area selection
    return (
      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-primary">
            📅 Select the months you want your {pricingModel === 'leafleting' ? 'leafleting' : 'advertising'} to run for each selected area
          </p>
        </div>
        
        {effectiveSelectedAreas.map((areaId) => {
          const area = (pricingModel === 'leafleting' ? areas : areas)?.find(a => a.id === areaId);
          if (!area) return null;

          const availableMonths = area.schedule || [];
          const areaSelectedMonths = selectedMonths[areaId] || [];
          const maxSelectableMonths = (durationData as any)?.duration_value || (durationData as any)?.months || 1;

          return (
            <div key={areaId} className="border rounded-lg p-6">
              <h4 className="font-medium text-lg mb-4 flex items-center justify-between">
                <div>Area: {area.name}</div>
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
                      ${isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-muted hover:border-primary/50'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`month-${areaId}-${index}`}
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const newAreaMonths = e.target.checked
                              ? [...areaSelectedMonths, monthData.month]
                              : areaSelectedMonths.filter(m => m !== monthData.month);
                            
                            onMonthsChange({
                              ...selectedMonths,
                              [areaId]: newAreaMonths
                            });
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="font-medium text-sm">
                            {formatMonthDisplay(monthData.month)}
                          </div>
                          {monthData.copy_deadline && (
                            <div className="text-xs text-muted-foreground">
                              Copy deadline: {monthData.copy_deadline}
                            </div>
                          )}
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
  };

  if (isLoadingDurations) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-lg">Loading campaign durations...</span>
      </div>
    );
  }

  if (durationsError || isError || !relevantDurations || relevantDurations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign Duration & Schedule</h2>
          <p className="text-muted-foreground">
            Set up your campaign timeline and publication schedule
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load campaign durations. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Clock className="h-6 w-6" />
          Campaign Duration & Schedule
        </h2>
        <p className="text-muted-foreground">
          Choose your campaign duration and select publication dates
        </p>
      </div>

      {/* Duration Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Campaign Duration</h3>
        
        <Select value={selectedDuration} onValueChange={onDurationChange}>
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
                      : (duration as any).description
                    }
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedule Management */}
      {selectedDuration && effectiveSelectedAreas.length > 0 && (
        <div className="bg-background border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publication Schedule
          </h3>
          <p className="text-sm text-muted-foreground">
            {pricingModel === 'bogof' 
              ? 'Select ONE publication start date that will apply to ALL your selected areas:'
              : `Select the months you want your ${pricingModel === 'leafleting' ? 'leafleting' : 'advertising'} to run for each selected area:`}
          </p>
          
          {renderScheduleSection()}
        </div>
      )}

      {/* Pricing Summary */}
      {renderPricingSummary()}

      {canProceed() && (
        <div className="flex justify-center pt-4">
          <Button onClick={onNext} size="lg" className="px-8">
            Continue to Contact Information
          </Button>
        </div>
      )}
    </div>
  );
};

export default DurationScheduleStep;