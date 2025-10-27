import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { formatDateUK } from '@/lib/utils';
import { useLeafletAreas, useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { MobilePricingSummary } from '@/components/MobilePricingSummary';
import { getAreaGroupedSchedules } from '@/lib/issueSchedule';

// Helper function to format month display
const formatMonthDisplay = (monthString: string) => {
  if (!monthString) {
    return 'Invalid Date';
  }
  
  let year: string, month: string;
  
  if (monthString.includes('-')) {
    [year, month] = monthString.split('-');
  } else if (monthString.includes(' ')) {
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
        return monthString;
      }
    } else {
      return monthString;
    }
  } else {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.findIndex(name => name.toLowerCase() === monthString.toLowerCase());
    if (monthIndex !== -1) {
      return monthString;
    } else {
      return monthString;
    }
  }
  
  const monthNumber = parseInt(month, 10);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (monthNumber < 1 || monthNumber > 12 || !year) {
    return monthString;
  }
  
  return `${monthNames[monthNumber - 1]} ${year}`;
};

interface AreaAndScheduleStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedDuration: string;
  selectedMonths: Record<string, string[]>;
  onAreasChange: (areas: string[]) => void;
  onBogofAreasChange: (paidAreas: string[], freeAreas: string[]) => void;
  onDurationChange: (duration: string) => void;
  onMonthsChange: (months: Record<string, string[]>) => void;
  onPricingChange?: (pricingData: any) => void;
  onNext: () => void;
  campaignData?: any; // Add campaign data prop for mobile pricing summary
  currentStep?: number; // Add current step for mobile pricing summary
}

export const AreaAndScheduleStep: React.FC<AreaAndScheduleStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedDuration,
  selectedMonths,
  onAreasChange,
  onBogofAreasChange,
  onDurationChange,
  onMonthsChange,
  onPricingChange,
  onNext,
  campaignData,
  currentStep = 2
}) => {
  const { areas, durations, subscriptionDurations, isLoading, isError } = usePricingData();
  const { data: leafletAreas, isLoading: leafletAreasLoading, error: leafletAreasError } = useLeafletAreas();
  const { data: leafletDurations, isLoading: leafletDurationsLoading, error: leafletDurationsError } = useLeafletCampaignDurations();

  const getEffectiveData = () => {
    if (pricingModel === 'leafleting') {
      // For leafleting, use leaflet areas but with schedule from magazine areas
      // This ensures leaflets follow the same publication schedule as magazines
      const leafletAreasWithMagazineSchedule = (leafletAreas || []).map(leafletArea => {
        // Find corresponding magazine area by name or just use first area's schedule
        const magazineArea = areas?.find(a => 
          a.name.toLowerCase().includes(leafletArea.name.toLowerCase()) || 
          leafletArea.name.toLowerCase().includes(a.name.toLowerCase())
        ) || areas?.[0];
        
        return {
          ...leafletArea,
          schedule: magazineArea?.schedule || leafletArea.schedule || []
        };
      });
      
      return {
        areas: leafletAreasWithMagazineSchedule,
        isLoading: leafletAreasLoading || isLoading,
        isError: !!leafletAreasError || isError
      };
    }
    return {
      areas: areas || [],
      isLoading,
      isError
    };
  };

  const { areas: effectiveAreas, isLoading: effectiveAreasLoading, isError: effectiveAreasError } = getEffectiveData();
  const effectiveSelectedAreas = pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas;

  const getRelevantDurations = () => {
    if (pricingModel === 'leafleting') return leafletDurations || [];
    if (pricingModel === 'bogof') return subscriptionDurations || [];
    return durations || [];
  };

  const relevantDurations = getRelevantDurations();
  const isLoadingDurations = pricingModel === 'leafleting' ? leafletDurationsLoading : isLoading;

  const handleAreaChange = (areaId: string, checked: boolean) => {
    if (pricingModel === 'leafleting' || pricingModel === 'fixed') {
      const newAreas = checked 
        ? [...selectedAreas, areaId]
        : selectedAreas.filter(id => id !== areaId);
      onAreasChange(newAreas);
      
      // Calculate and send total circulation to parent immediately
      if (onPricingChange && effectiveAreas) {
        const totalCirculation = effectiveAreas
          .filter(area => newAreas.includes(area.id))
          .reduce((sum, area) => {
            const areaCirculation = pricingModel === 'leafleting' 
              ? (area as any).bimonthly_circulation || 0
              : (area as any).circulation || 0;
            return sum + areaCirculation;
          }, 0);
        
        onPricingChange({
          selectedModel: pricingModel,
          selectedAreas: newAreas,
          bogofPaidAreas: [],
          bogofFreeAreas: [],
          pricingBreakdown: { totalCirculation }
        });
      }
    }
  };

  const handleBogofPaidAreaChange = (areaId: string, checked: boolean) => {
    let newPaidAreas: string[];
    let newFreeAreas: string[];
    
    if (checked) {
      // Don't allow more than 7 paid areas
      if (bogofPaidAreas.length >= 7) {
        return;
      }
      
      newFreeAreas = bogofFreeAreas.filter(id => id !== areaId);
      newPaidAreas = [...bogofPaidAreas, areaId];
      
      // If we now have 7 paid areas, automatically select all remaining areas as free
      if (newPaidAreas.length === 7) {
        const allRemainingAreas = effectiveAreas
          .filter(area => !newPaidAreas.includes(area.id))
          .map(area => area.id);
        newFreeAreas = allRemainingAreas;
      }
    } else {
      newPaidAreas = bogofPaidAreas.filter(id => id !== areaId);
      newFreeAreas = bogofFreeAreas;
    }
    
    onBogofAreasChange(newPaidAreas, newFreeAreas);
    
    // Calculate and send total circulation to parent immediately
    if (onPricingChange && effectiveAreas) {
      const allSelectedAreas = [...newPaidAreas, ...newFreeAreas];
      const totalCirculation = effectiveAreas
        .filter(area => allSelectedAreas.includes(area.id))
        .reduce((sum, area) => {
          return sum + ((area as any).circulation || 0);
        }, 0);
      
      onPricingChange({
        selectedModel: pricingModel,
        selectedAreas: [],
        bogofPaidAreas: newPaidAreas,
        bogofFreeAreas: newFreeAreas,
        pricingBreakdown: { totalCirculation }
      });
    }
  };

  const handleBogofFreeAreaChange = (areaId: string, checked: boolean) => {
    let newPaidAreas: string[];
    let newFreeAreas: string[];
    
    if (checked) {
      newPaidAreas = bogofPaidAreas.filter(id => id !== areaId);
      newFreeAreas = [...bogofFreeAreas, areaId];
    } else {
      newPaidAreas = bogofPaidAreas;
      newFreeAreas = bogofFreeAreas.filter(id => id !== areaId);
    }
    
    onBogofAreasChange(newPaidAreas, newFreeAreas);
    
    // Calculate and send total circulation to parent immediately
    if (onPricingChange && effectiveAreas) {
      const allSelectedAreas = [...newPaidAreas, ...newFreeAreas];
      const totalCirculation = effectiveAreas
        .filter(area => allSelectedAreas.includes(area.id))
        .reduce((sum, area) => {
          return sum + ((area as any).circulation || 0);
        }, 0);
      
      onPricingChange({
        selectedModel: pricingModel,
        selectedAreas: [],
        bogofPaidAreas: newPaidAreas,
        bogofFreeAreas: newFreeAreas,
        pricingBreakdown: { totalCirculation }
      });
    }
  };

  const canProceed = () => {
    if (pricingModel === 'bogof') {
      return bogofPaidAreas.length > 0 && selectedDuration && Object.keys(selectedMonths).length > 0;
    }
    return effectiveSelectedAreas.length > 0 && selectedDuration && 
           effectiveSelectedAreas.every(areaId => selectedMonths[areaId]?.length > 0);
  };

  const renderScheduleSection = () => {
    if (!selectedDuration || effectiveSelectedAreas.length === 0) return null;

    const durationData = relevantDurations?.find(d => d.id === selectedDuration);
    
    if (pricingModel === 'bogof') {
      const allAreas = [
        ...bogofPaidAreas.map(id => effectiveAreas?.find(a => a.id === id)).filter(Boolean),
        ...bogofFreeAreas.map(id => effectiveAreas?.find(a => a.id === id)).filter(Boolean)
      ];
      
      // Get the next 3 available start dates from all areas
      const availableStartDates = (() => {
        if (allAreas.length === 0 || !allAreas[0]?.schedule) return [];
        
        // Get all unique months from all areas
        const allMonths = allAreas
          .flatMap(area => area.schedule.map((s: any) => s.month))
          .filter((month, index, self) => self.indexOf(month) === index);
        
        // Sort chronologically
        const sortedMonths = allMonths.sort();
        
        // Filter out past months and take only the next 3
        const today = new Date();
        const futureMonths = sortedMonths.filter(month => {
          const [year, monthNum] = month.split('-').map(Number);
          const monthDate = new Date(year, monthNum - 1);
          return monthDate >= new Date(today.getFullYear(), today.getMonth());
        });
        
        return futureMonths.slice(0, 3);
      })();
      
      const globalStartDate = Object.keys(selectedMonths).length > 0 
        ? selectedMonths[Object.keys(selectedMonths)[0]]?.[0] || null
        : null;
      
      return (
        <div className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-primary">
              📅 Select your campaign start month - this will apply to ALL {allAreas.length} selected areas
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campaign start month:
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

    // For leafleting, group areas by schedule and show radio buttons for starting month
    if (pricingModel === 'leafleting') {
      const selectedAreaData = effectiveAreas?.filter(area => 
        effectiveSelectedAreas.includes(area.id)
      ) || [];
      
      const areaGroupedSchedules = getAreaGroupedSchedules(selectedAreaData);
      
      return (
        <div className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-primary">
              📅 Select starting issue for each area group
            </p>
          </div>
          
          <h4 className="font-semibold text-lg">Starting Issue Per Area</h4>
          
          {areaGroupedSchedules.map((group, groupIndex) => {
            const firstAreaId = group.areas[0]?.id;
            const selectedStartingMonth = selectedMonths[firstAreaId]?.[0] || '';
            
            return (
              <Card key={groupIndex} className="border-2">
                <CardContent className="p-6">
                  <h5 className="font-medium text-base mb-2">
                    {group.areaNames}
                  </h5>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select starting issue for this area
                  </p>
                  
                  <RadioGroup
                    value={selectedStartingMonth}
                    onValueChange={(month) => {
                      const newSelectedMonths = { ...selectedMonths };
                      group.areas.forEach(area => {
                        newSelectedMonths[area.id] = [month];
                      });
                      onMonthsChange(newSelectedMonths);
                    }}
                    className="space-y-3"
                  >
                    {group.scheduleOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.month} id={`${groupIndex}-option-${index}`} />
                        <Label htmlFor={`${groupIndex}-option-${index}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-primary">
            📅 Select the months you want your advertising to run for each selected area
          </p>
        </div>
        
        {effectiveSelectedAreas.map((areaId) => {
          const area = effectiveAreas?.find(a => a.id === areaId);
          if (!area) return null;

          const availableMonths = area.schedule || [];
          const areaSelectedMonths = selectedMonths[areaId] || [];
          const maxSelectableMonths = (durationData as any)?.duration_value || (durationData as any)?.months || 1;

          return (
            <div key={areaId} className="border rounded-lg p-6">
              <h4 className="font-medium text-lg mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Area: {area.name}
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
                              Copy deadline: {formatDateUK(monthData.copy_deadline)}
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

  if (effectiveAreasLoading || isLoadingDurations) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-lg">Loading areas and durations...</span>
      </div>
    );
  }

  if (effectiveAreasError || isError || !effectiveAreas || effectiveAreas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Select Areas & Publication Schedule</h2>
          <p className="text-muted-foreground">Choose your areas and schedule your campaign</p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load available areas. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6" />
          Select Areas & Publication Schedule
        </h2>
        <p className="text-muted-foreground">
          Choose your areas and set up your campaign timeline
        </p>
      </div>

      {/* Area Selection Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {pricingModel === 'bogof' ? 'Select Areas for 3+ Repeat Package' : 
           pricingModel === 'leafleting' ? 'Select Leafleting Areas' : 'Select Areas for Fixed Term'}
        </h3>

        {pricingModel === 'bogof' && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>3+ Repeat Package:</strong> For every "paid for" area, choose a "free for 3 issues" area. 
              Select your paid areas first, then choose your free areas.
            </AlertDescription>
          </Alert>
        )}

        {pricingModel === 'bogof' ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6 min-h-[400px] w-full">
            {/* Paid Areas Section */}
            <div className="space-y-3 md:space-y-4 min-w-0">
              <div className="flex items-center gap-1 md:gap-2">
                <h4 className="font-medium text-sm md:text-base">Paid Areas</h4>
                <Badge variant="default" className="text-xs">Required</Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                These are the areas you will pay for throughout your campaign. Maximum 7 areas ({bogofPaidAreas.length}/7).
              </p>
              
              <div className="grid grid-cols-1 gap-2 md:gap-4">
                {effectiveAreas
                  .filter(area => !bogofFreeAreas.includes(area.id))
                  .map((area) => (
                  <Card 
                    key={`paid-${area.id}`} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      bogofPaidAreas.includes(area.id) ? 'ring-2 ring-primary border-primary' : ''
                    } ${!bogofPaidAreas.includes(area.id) && bogofPaidAreas.length >= 7 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (!bogofPaidAreas.includes(area.id) && bogofPaidAreas.length >= 7) return;
                      handleBogofPaidAreaChange(area.id, !bogofPaidAreas.includes(area.id));
                    }}
                  >
                    <CardContent className="p-2 md:p-4">
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <Checkbox
                          id={`paid-${area.id}`}
                          checked={bogofPaidAreas.includes(area.id)}
                          disabled={!bogofPaidAreas.includes(area.id) && bogofPaidAreas.length >= 7}
                          onCheckedChange={(checked) => {
                            if (!bogofPaidAreas.includes(area.id) && bogofPaidAreas.length >= 7) return;
                            handleBogofPaidAreaChange(area.id, checked as boolean);
                          }}
                          className="mt-0.5 md:mt-1 scale-75 md:scale-100"
                        />
                        <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
                          <div className="space-y-1">
                            <Label htmlFor={`paid-${area.id}`} className="text-xs md:text-sm font-medium cursor-pointer leading-tight block">
                              {area.name}
                            </Label>
                            <Badge variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">
                              {(area as any).circulation?.toLocaleString() || 0} homes
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Free Areas Section */}
            {bogofPaidAreas.length > 0 && (
              <div className="space-y-3 md:space-y-4 min-w-0">
                <div className="flex items-center gap-1 md:gap-2">
                  <h4 className="font-medium text-sm md:text-base">FREE Bonus Areas</h4>
                  <Badge variant="secondary" className="text-xs">6 Months Free</Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {bogofPaidAreas.length === 7 
                    ? 'All remaining areas automatically selected as FREE bonus areas!'
                    : `Select additional areas to receive for FREE for 6 months. 
                      You can choose up to ${bogofPaidAreas.length} free area${bogofPaidAreas.length > 1 ? 's' : ''}.`
                  }
                </p>
                
                <div className="grid grid-cols-1 gap-2 md:gap-4">
                  {effectiveAreas
                    .filter(area => !bogofPaidAreas.includes(area.id))
                    .map((area) => {
                      const isSelected = bogofFreeAreas.includes(area.id);
                      const isDisabled = bogofPaidAreas.length === 7 || (!isSelected && bogofFreeAreas.length >= bogofPaidAreas.length);
                      
                      return (
                        <Card 
                          key={`free-${area.id}`} 
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected ? 'ring-2 ring-green-500 border-green-500' : ''
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isDisabled && handleBogofFreeAreaChange(area.id, !isSelected)}
                        >
                          <CardContent className="p-2 md:p-4">
                            <div className="flex items-start space-x-2 md:space-x-3">
                              <Checkbox
                                id={`free-${area.id}`}
                                checked={isSelected}
                                disabled={isDisabled}
                                onCheckedChange={(checked) => handleBogofFreeAreaChange(area.id, checked as boolean)}
                                className="mt-0.5 md:mt-1 scale-75 md:scale-100"
                              />
                              <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
                                <div className="space-y-1">
                                  <Label htmlFor={`free-${area.id}`} className="text-xs md:text-sm font-medium cursor-pointer leading-tight block">
                                    {area.name}
                                  </Label>
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <Badge variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">
                                      {(area as any).circulation?.toLocaleString() || 0} homes
                                    </Badge>
                                    {isSelected && (
                                      <Badge variant="secondary" className="text-[10px] md:text-xs bg-green-100 text-green-800">
                                        FREE
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {effectiveAreas.map((area) => (
              <Card 
                key={area.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedAreas.includes(area.id) ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => handleAreaChange(area.id, !selectedAreas.includes(area.id))}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={area.id}
                      checked={selectedAreas.includes(area.id)}
                      onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor={area.id} className="text-sm font-medium cursor-pointer block">
                          {area.name}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {pricingModel === 'leafleting' 
                            ? (area as any).bimonthly_circulation?.toLocaleString() || 0
                            : (area as any).circulation?.toLocaleString() || 0
                          } homes
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Selection Summary */}
        {((pricingModel === 'bogof' && (bogofPaidAreas.length > 0 || bogofFreeAreas.length > 0)) || 
          (pricingModel !== 'bogof' && selectedAreas.length > 0)) && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Selection Summary</h4>
            <div className="text-sm text-muted-foreground">
              {pricingModel === 'bogof' ? (
                <>
                  <div>Paid areas: {bogofPaidAreas.length}</div>
                  <div>Free bonus areas: {bogofFreeAreas.length}</div>
                  <div>Total areas: {bogofPaidAreas.length + bogofFreeAreas.length}</div>
                </>
              ) : (
                <div>Selected areas: {selectedAreas.length}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Duration Selection - Hidden for BOGOF as it's fixed to 6 months */}
      {effectiveSelectedAreas.length > 0 && pricingModel !== 'bogof' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Campaign Duration
          </h3>
          
          <Select value={selectedDuration} onValueChange={onDurationChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select campaign duration" />
            </SelectTrigger>
            <SelectContent>
              {relevantDurations.map((duration) => {
                // For leafleting, show "X Issue(s) - X delivery slot(s) per area selected"
                if (pricingModel === 'leafleting') {
                  const issues = (duration as any).issues || 1;
                  return (
                    <SelectItem key={duration.id} value={duration.id}>
                      {issues} {issues === 1 ? 'Issue' : 'Issues'} – {issues} delivery {issues === 1 ? 'slot' : 'slots'} per area selected
                    </SelectItem>
                  );
                }
                // For advertising, keep the existing format
                return (
                  <SelectItem key={duration.id} value={duration.id}>
                    {duration.name} of advertising
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Schedule Selection */}
      {renderScheduleSection()}

      {/* Mobile Pricing Summary */}
      {campaignData && (
        <MobilePricingSummary 
          campaignData={campaignData} 
          currentStep={currentStep} 
        />
      )}
    </div>
  );
};

export default AreaAndScheduleStep;