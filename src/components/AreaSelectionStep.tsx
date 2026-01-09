import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, MapPin, Users } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletAreas } from '@/hooks/useLeafletData';
import { formatDateUK } from '@/lib/utils';

interface AreaSelectionStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  onAreasChange: (areas: string[]) => void;
  onBogofAreasChange: (paidAreas: string[], freeAreas: string[]) => void;
  onPricingChange?: (pricingData: any) => void;
  onNext: () => void;
}

export const AreaSelectionStep: React.FC<AreaSelectionStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  onAreasChange,
  onBogofAreasChange,
  onPricingChange,
  onNext
}) => {
  const { areas, isLoading, isError } = usePricingData();
  const { data: leafletAreas, isLoading: leafletAreasLoading, error: leafletAreasError } = useLeafletAreas();

  const getEffectiveData = () => {
    if (pricingModel === 'leafleting') {
      return {
        areas: leafletAreas || [],
        isLoading: leafletAreasLoading,
        isError: !!leafletAreasError
      };
    }
    return {
      areas: areas || [],
      isLoading,
      isError
    };
  };

  const { areas: effectiveAreas, isLoading: effectiveLoading, isError: effectiveError } = getEffectiveData();
  const effectiveSelectedAreas = pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas;

  const handleAreaChange = (areaId: string, checked: boolean) => {
    if (pricingModel === 'leafleting' || pricingModel === 'fixed') {
      const newAreas = checked 
        ? [...selectedAreas, areaId]
        : selectedAreas.filter(id => id !== areaId);
      onAreasChange(newAreas);
      
      // Calculate and send total circulation to parent
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
      
      // Remove from free areas if it was there, add to paid areas
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
      // Remove from paid areas
      newPaidAreas = bogofPaidAreas.filter(id => id !== areaId);
      newFreeAreas = bogofFreeAreas;
    }
    
    onBogofAreasChange(newPaidAreas, newFreeAreas);
    
    // Calculate and send total circulation to parent
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
      // Remove from paid areas if it was there, add to free areas
      newPaidAreas = bogofPaidAreas.filter(id => id !== areaId);
      newFreeAreas = [...bogofFreeAreas, areaId];
    } else {
      // Remove from free areas
      newPaidAreas = bogofPaidAreas;
      newFreeAreas = bogofFreeAreas.filter(id => id !== areaId);
    }
    
    onBogofAreasChange(newPaidAreas, newFreeAreas);
    
    // Calculate and send total circulation to parent
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
      return bogofPaidAreas.length > 0;
    }
    return effectiveSelectedAreas.length > 0;
  };

  const getStepTitle = () => {
    switch (pricingModel) {
      case 'leafleting':
        return 'Select Leafleting Areas';
      case 'bogof':
        return 'Select Areas for 3+ Repeat Package';
      default:
        return 'Select Areas for Fixed Term';
    }
  };

  const getStepDescription = () => {
    switch (pricingModel) {
      case 'leafleting':
        return 'Choose the areas where you want to distribute your leaflets';
      case 'bogof':
        return 'Choose paid areas (you pay for these) and get free areas (6 months free)';
      default:
        return 'Choose the areas where you want your advertisement to appear';
    }
  };

  if (effectiveLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-lg">Loading available areas...</span>
      </div>
    );
  }

  if (effectiveError || !effectiveAreas || effectiveAreas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{getStepTitle()}</h2>
          <p className="text-muted-foreground">{getStepDescription()}</p>
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
          {getStepTitle()}
        </h2>
        <p className="text-muted-foreground">{getStepDescription()}</p>
      </div>

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
        <div className="grid grid-cols-2 gap-6 min-h-[400px] w-full">
          {/* Paid Areas Section */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Paid Areas</h3>
              <Badge variant="default">Required</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              These are the areas you will pay for throughout your campaign. Maximum 7 areas ({bogofPaidAreas.length}/7).
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
              {effectiveAreas.map((area) => (
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
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id={`paid-${area.id}`}
                        checked={bogofPaidAreas.includes(area.id)}
                        disabled={!bogofPaidAreas.includes(area.id) && bogofPaidAreas.length >= 7}
                        onCheckedChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 pointer-events-none"
                      />
                      <div className="flex-1 space-y-1 pointer-events-none">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium leading-tight">
                            {area.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {(area as any).circulation?.toLocaleString() || 0} homes
                          </Badge>
                        </div>
                        {(area as any).copy_deadline && (
                          <div className="text-xs text-muted-foreground">
                            Copy deadline: {formatDateUK((area as any).copy_deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Free Areas Section */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">FREE Bonus Areas</h3>
              <Badge variant="secondary">6 Months Free</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {bogofPaidAreas.length === 7 
                ? 'All remaining areas automatically selected as FREE bonus areas!'
                : bogofPaidAreas.length > 0 
                  ? `Select additional areas to receive for FREE for 6 months. You can choose up to ${bogofPaidAreas.length} free area${bogofPaidAreas.length > 1 ? 's' : ''}.`
                  : 'Select paid areas first to unlock free bonus areas.'
              }
            </p>
            
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2 ${
              bogofPaidAreas.length === 0 ? 'opacity-50' : ''
            }`}>
              {effectiveAreas
                .filter(area => !bogofPaidAreas.includes(area.id))
                .map((area) => {
                  const isSelected = bogofFreeAreas.includes(area.id);
                  const isDisabled = bogofPaidAreas.length === 7 || bogofPaidAreas.length === 0 || (!isSelected && bogofFreeAreas.length >= bogofPaidAreas.length);
                  
                  return (
                    <Card 
                      key={`free-${area.id}`} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected ? 'ring-2 ring-green-500 border-green-500' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isDisabled && handleBogofFreeAreaChange(area.id, !isSelected)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id={`free-${area.id}`}
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 pointer-events-none"
                          />
                          <div className="flex-1 space-y-1 pointer-events-none">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium leading-tight">
                                {area.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {(area as any).circulation?.toLocaleString() || 0} homes
                              </Badge>
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  FREE
                                </Badge>
                              )}
                            </div>
                            {(area as any).copy_deadline && (
                              <div className="text-xs text-muted-foreground">
                                Copy deadline: {formatDateUK((area as any).copy_deadline)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Area Selection for Fixed Term and Leafleting */
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
                    onCheckedChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 pointer-events-none"
                  />
                  <div className="flex-1 space-y-2 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {area.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {pricingModel === 'leafleting' 
                          ? (area as any).bimonthly_circulation?.toLocaleString() || 0
                          : (area as any).circulation?.toLocaleString() || 0
                        } homes
                      </Badge>
                    </div>
                    
                    {pricingModel === 'leafleting' ? (
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium text-primary">
                          £{(area as any).price_with_vat?.toFixed(2) || '0.00'}
                        </div>
                        <div>Postcodes: {(area as any).postcodes || 'N/A'}</div>
                      </div>
                    ) : (
                      (area as any).copy_deadline && (
                        <div className="text-xs text-muted-foreground">
                          Copy deadline: {formatDateUK((area as any).copy_deadline)}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {effectiveSelectedAreas.length > 0 && (
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
              <div>
                <div className="font-medium mb-2">Selected areas: {effectiveSelectedAreas.length}</div>
                <ul className="space-y-1 ml-4">
                  {effectiveAreas
                    .filter(area => effectiveSelectedAreas.includes(area.id))
                    .map(area => (
                      <li key={area.id}>• {area.name}</li>
                    ))}
                </ul>
              </div>
            )}
            <div className="mt-1">
              Total circulation: {effectiveAreas
                .filter(area => effectiveSelectedAreas.includes(area.id))
                .reduce((sum, area) => {
                  const areaCirculation = pricingModel === 'leafleting' 
                    ? (area as any).bimonthly_circulation || 0
                    : (area as any).circulation || 0;
                  return sum + areaCirculation;
                }, 0)
                .toLocaleString()} homes
            </div>
          </div>
        </div>
      )}

      {canProceed() && (
        <div className="flex justify-center pt-4">
          <Button onClick={onNext} size="lg" className="px-8">
            Continue to Advertisement Size
          </Button>
        </div>
      )}
    </div>
  );
};

export default AreaSelectionStep;