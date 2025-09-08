import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Ruler, Eye, Palette } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';
import { cn } from '@/lib/utils';

interface AdvertisementSizeStepProps {
  selectedAdSize: string;
  onAdSizeChange: (sizeId: string) => void;
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedDuration: string;
  onPricingChange?: (breakdown: any) => void;
  showSummary?: boolean;
  onNext: () => void;
}

export const AdvertisementSizeStep: React.FC<AdvertisementSizeStepProps> = ({
  selectedAdSize,
  onAdSizeChange,
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedDuration,
  onPricingChange,
  showSummary = false,
  onNext
}) => {
  const { areas, adSizes, durations, subscriptionDurations, volumeDiscounts, isLoading, isError } = usePricingData();
  const [previewMode, setPreviewMode] = useState<'grid' | 'magazine'>('grid');

  // Calculate and notify pricing changes
  useEffect(() => {
    if (onPricingChange && selectedAdSize && selectedDuration && 
        (pricingModel === 'bogof' ? bogofPaidAreas.length > 0 : selectedAreas.length > 0) &&
        areas && adSizes && durations && subscriptionDurations && volumeDiscounts) {
      
      const pricingBreakdown = calculateAdvertisingPrice(
        pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas,
        selectedAdSize,
        selectedDuration,
        pricingModel === 'bogof',
        areas,
        adSizes,
        pricingModel === 'bogof' ? subscriptionDurations : durations,
        subscriptionDurations,
        volumeDiscounts
      );
      
      if (pricingBreakdown) {
        onPricingChange(pricingBreakdown);
      }
    }
  }, [selectedAdSize, selectedDuration, selectedAreas, bogofPaidAreas, bogofFreeAreas, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, onPricingChange]);

  const handleSizeSelect = (sizeId: string) => {
    onAdSizeChange(sizeId);
  };

  const renderAdSizeVisual = (size: any, isSelected: boolean) => {
    // Calculate visual dimensions for display (scaled down)
    const dimensions = size.dimensions?.split('x') || ['100', '100'];
    const width = parseInt(dimensions[0]) || 100;
    const height = parseInt(dimensions[1]) || 100;
    
    // Scale down for display - use a max of 120px for width
    const scale = Math.min(120 / width, 80 / height);
    const displayWidth = width * scale;
    const displayHeight = height * scale;

    return (
      <div className="flex flex-col items-center space-y-3">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg flex items-center justify-center transition-all",
            isSelected 
              ? "border-primary bg-primary/10 shadow-lg" 
              : "border-muted-foreground/30 bg-muted/20"
          )}
          style={{ 
            width: `${displayWidth}px`, 
            height: `${displayHeight}px`,
            minWidth: '60px',
            minHeight: '40px'
          }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {size.name}
          </span>
        </div>
        
        {(
          (pricingModel === 'bogof' && size.subscription_pricing_per_issue) || 
          (pricingModel !== 'bogof' && size.base_price_per_area)
        ) && (
          <Badge variant="outline" className="text-xs">
            From £{(() => {
              if (pricingModel === 'bogof') {
                if (typeof size.subscription_pricing_per_issue === 'number') {
                  return size.subscription_pricing_per_issue;
                }
                if (typeof size.subscription_pricing_per_issue === 'object' && size.subscription_pricing_per_issue && 'price' in size.subscription_pricing_per_issue) {
                  return size.subscription_pricing_per_issue.price;
                }
                return size.base_price_per_area || 0;
              }
              return size.base_price_per_area || 0;
            })()}
          </Badge>
        )}
      </div>
    );
  };

  const renderMagazinePreview = () => {
    const selectedSize = adSizes?.find(size => size.id === selectedAdSize);
    if (!selectedSize) return null;

    return (
      <div className="bg-background border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          A5 Magazine Preview
        </h3>
        
        <div className="flex justify-center">
          <div className="relative">
            {/* A5 Magazine representation (148mm x 210mm scaled down) */}
            <div 
              className="border-2 border-gray-300 bg-white shadow-lg rounded-sm relative"
              style={{ width: '200px', height: '284px' }}
            >
              {/* Magazine header */}
              <div className="bg-primary text-primary-foreground text-xs font-bold p-2 text-center">
                Your Local Magazine
              </div>
              
              {/* Sample content area */}
              <div className="p-3 space-y-2">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
              </div>
              
              {/* Advertisement placement */}
              <div 
                className="absolute border-2 border-primary bg-primary/10 rounded flex items-center justify-center"
                style={{
                  // Position based on typical ad placements
                  top: selectedSize.name.includes('Full Page') ? '0' : '80px',
                  left: selectedSize.name.includes('Full Page') ? '0' : '10px',
                  right: selectedSize.name.includes('Full Page') ? '0' : '10px',
                  width: selectedSize.name.includes('Full Page') ? '100%' : 
                         selectedSize.name.includes('1/2') ? '180px' :
                         selectedSize.name.includes('1/4') ? '90px' :
                         selectedSize.name.includes('1/6') ? '60px' :
                         selectedSize.name.includes('1/8') ? '90px' : '120px',
                  height: selectedSize.name.includes('Full Page') ? '100%' :
                          selectedSize.name.includes('1/2') ? '120px' :
                          selectedSize.name.includes('1/4') ? '120px' :
                          selectedSize.name.includes('1/6') ? '80px' :
                          selectedSize.name.includes('1/8') ? '60px' : '100px',
                }}
              >
                <div className="text-center p-2">
                  <p className="text-xs font-bold text-primary">YOUR AD</p>
                  <p className="text-xs text-primary/80">{selectedSize.name}</p>
                  <p className="text-xs text-primary/60">{selectedSize.dimensions}</p>
                </div>
              </div>
            </div>
            
            {/* Size indicator */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <Badge variant="outline" className="text-xs">
                {selectedSize.name} - {selectedSize.dimensions}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          This preview shows approximately how your {selectedSize.name} advertisement 
          would appear in our A5 magazine format.
        </div>
      </div>
    );
  };

  if (pricingModel === 'leafleting') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Advertisement Size</h2>
          <p className="text-muted-foreground">
            Advertisement size selection is not applicable for leafleting services.
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Leafleting services use your own printed materials. Please proceed to the next step.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button onClick={onNext} size="lg">
            Continue to Campaign Details
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-lg">Loading advertisement sizes...</span>
      </div>
    );
  }

  if (isError || !adSizes || adSizes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Advertisement Size</h2>
          <p className="text-muted-foreground">
            Choose the perfect size for your advertisement
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load advertisement sizes. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderSummary = () => {
    if (!selectedAdSize || !pricingModel || 
        (pricingModel === 'bogof' ? bogofPaidAreas.length === 0 : selectedAreas.length === 0)) {
      return null;
    }

    const pricingBreakdown = calculateAdvertisingPrice(
      pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas,
      selectedAdSize,
      selectedDuration || '',
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
                {selectedAreas.map((areaId, index) => {
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
              {formatPrice(pricingBreakdown.finalTotal)} + vat ({formatPrice(pricingBreakdown.finalTotal * 1.2)}) per insertion in {(pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas).length} area{(pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas).length > 1 ? 's' : ''} reaching {pricingBreakdown.totalCirculation.toLocaleString()} homes
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Palette className="h-6 w-6" />
          Choose Your Advertisement Size
        </h2>
        <p className="text-muted-foreground">
          Select the size that best fits your advertising needs
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex">
          <Button
            variant={previewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('grid')}
            className="rounded-md"
          >
            Size Comparison
          </Button>
          <Button
            variant={previewMode === 'magazine' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('magazine')}
            className="rounded-md"
            disabled={!selectedAdSize}
          >
            Magazine Preview
          </Button>
        </div>
      </div>

      {previewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adSizes
            .filter((size) => {
              // Filter sizes based on pricing model using available_for array
              if (pricingModel === 'bogof') {
                // For 3+ Repeat Package (bogof), only show sizes available for subscription pricing
                return size.available_for?.includes('subscription');
              } else {
                // For fixed pricing, show sizes with fixed pricing
                return size.available_for?.includes('fixed') || size.base_price_per_area > 0;
              }
            })
            .sort((a, b) => {
              // Calculate area for each ad size to sort by size (largest to smallest)
              const getArea = (size: any) => {
                const dimensions = size.dimensions?.split('x') || ['0', '0'];
                const width = parseFloat(dimensions[0].replace('mm', '').trim()) || 0;
                const height = parseFloat(dimensions[1].replace('mm', '').trim()) || 0;
                return width * height;
              };
              return getArea(b) - getArea(a); // Sort descending (largest first)
            })
            .map((size) => {
            const isSelected = selectedAdSize === size.id;
            
            return (
              <Card
                key={size.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  isSelected 
                    ? "ring-2 ring-primary ring-offset-2 shadow-lg border-primary" 
                    : "hover:border-primary/50"
                )}
                onClick={() => handleSizeSelect(size.id)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-center">{size.name}</CardTitle>
                  <CardDescription className="text-center">
                    {size.dimensions}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  {renderAdSizeVisual(size, isSelected)}
                  
                  <div className={cn(
                    "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  )}>
                    {isSelected ? 'Selected' : 'Select This Size'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        renderMagazinePreview()
      )}

      {/* Summary Section */}
      {showSummary && renderSummary()}
    </div>
  );
};

export default AdvertisementSizeStep;