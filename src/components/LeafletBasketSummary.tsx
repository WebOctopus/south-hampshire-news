import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricingCalculator';
import { useLeafletData } from '@/hooks/useLeafletData';
import { useStepForm } from '@/components/StepForm';
import { AlertCircle } from 'lucide-react';
import { getAreaGroupedSchedules } from '@/lib/issueSchedule';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface LeafletBasketSummaryProps {
  selectedAreas: string[];
  selectedLeafletSize: string;
  selectedDuration: string;
  selectedMonths: Record<string, string[]>;
  pricingBreakdown: any;
  onNext?: () => void;
  onMonthsChange?: (months: Record<string, string[]>) => void;
}

// Helper function to format month display
const formatMonthDisplay = (monthString: string) => {
  if (!monthString) return 'Invalid Date';
  
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

export const LeafletBasketSummary: React.FC<LeafletBasketSummaryProps> = ({
  selectedAreas,
  selectedLeafletSize,
  selectedDuration,
  selectedMonths,
  pricingBreakdown,
  onNext,
  onMonthsChange
}) => {
  const { leafletAreas, leafletSizes, leafletDurations } = useLeafletData();
  const { nextStep } = useStepForm();

  // Get display names
  const getLeafletSizeName = () => {
    const leafletSize = leafletSizes?.find(size => size.id === selectedLeafletSize);
    return leafletSize?.label || 'Unknown Size';
  };

  const getDurationName = () => {
    const duration = leafletDurations?.find(d => d.id === selectedDuration);
    return duration?.name || 'Unknown Duration';
  };

  const getAreaName = (areaId: string) => {
    const area = leafletAreas?.find(area => area.id === areaId);
    return `Area ${area?.area_number} - ${area?.name}` || 'Unknown Area';
  };

  // Get the starting issues grouped by area
  const getStartingIssues = () => {
    if (!selectedMonths || Object.keys(selectedMonths).length === 0) {
      return [];
    }
    
    // Get selected area data
    const selectedAreaData = leafletAreas?.filter(area => 
      selectedAreas.includes(area.id)
    ) || [];
    
    // Group areas by schedule
    const areaGroupedSchedules = getAreaGroupedSchedules(selectedAreaData);
    
    // Build starting issues display
    return areaGroupedSchedules.map(group => {
      const firstAreaId = group.areas[0]?.id;
      const firstAreaMonths = selectedMonths[firstAreaId];
      
      if (!firstAreaMonths || firstAreaMonths.length === 0) {
        return null;
      }
      
      return {
        areaNames: group.areaNames,
        startingMonth: formatMonthDisplay(firstAreaMonths[0])
      };
    }).filter(Boolean);
  };

  const startingIssues = getStartingIssues();

  const baseTotal = pricingBreakdown?.finalTotal || 0;

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">YOUR BASKET</h2>
        <p className="text-muted-foreground">Review your leafleting campaign details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Booking Details */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Leaflet Size</Label>
                  <p className="font-medium">{getLeafletSizeName()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="font-medium">{getDurationName()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Starting Issue Per Area</Label>
                <div className="space-y-3 mt-2">
                  {(() => {
                    const selectedAreaData = leafletAreas?.filter(a => selectedAreas.includes(a.id)) || [];
                    const groups = getAreaGroupedSchedules(selectedAreaData);
                    if (!groups.length) return (
                      <p className="text-sm text-muted-foreground">Not selected</p>
                    );
                    return groups.map((group, idx) => {
                      const firstAreaId = group.areas[0]?.id;
                      const value = selectedMonths[firstAreaId]?.[0] || '';
                      return (
                        <div key={idx} className="border rounded-lg p-4">
                          <p className="font-medium mb-2">{group.areaNames}</p>
                          <RadioGroup
                            value={value}
                            onValueChange={(month) => {
                              if (!month) return;
                              const next = { ...selectedMonths } as Record<string, string[]>;
                              group.areas.forEach((area: any) => {
                                next[area.id] = [month];
                              });
                              // If parent provided a handler, update upstream
                              // Otherwise this is just visual
                              if (typeof onNext === 'function' && !onMonthsChange) {
                                // no-op, keep compatibility
                              }
                              onMonthsChange?.(next);
                            }}
                            className="space-y-2"
                          >
                            {group.scheduleOptions.map((opt, i) => (
                              <div key={i} className="flex items-center space-x-2">
                                <RadioGroupItem id={`lb-${idx}-${i}`} value={opt.month} />
                                <Label htmlFor={`lb-${idx}-${i}`} className="cursor-pointer">{opt.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Distribution Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedAreas.map((areaId) => (
                  <div key={areaId} className="flex items-center gap-2">
                    <Badge variant="default" className="bg-primary">Paid</Badge>
                    <span className="text-sm">{getAreaName(areaId)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Circulation Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Label className="text-sm font-medium text-muted-foreground">Total Number of Homes Reached</Label>
                <p className="text-2xl font-bold text-primary">
                  {pricingBreakdown?.totalCirculation?.toLocaleString() || 0} homes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Terms */}
        <div className="space-y-6">
          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm leading-relaxed">
                  Payment is required <strong>25% at time of booking</strong> and <strong>75% 10 days prior to the delivery date</strong>.
                </p>
                <p className="text-sm leading-relaxed mt-3">
                  No monthly payment plan or extra discount for payment in full in advance.
                </p>
                <p className="text-sm leading-relaxed mt-3">
                  If the booking is made within the 10 days, then payment will be required in full.
                </p>
              </div>

              {/* Pricing Summary */}
              <div className="space-y-3 pt-4 border-t">
                {/* Show discount breakdown if combo discount is applied */}
                {pricingBreakdown?.comboDiscountPercent > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatPrice(pricingBreakdown.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Combo Discount ({pricingBreakdown.comboDiscountPercent}%):</span>
                      <span className="font-medium">-{formatPrice(pricingBreakdown.comboDiscount)}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                  </>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total Cost{pricingBreakdown?.designFee && pricingBreakdown.designFee > 0 ? ' (inc. Design Service)' : ''}:
                  </span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(baseTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>25% Deposit:</span>
                  <span className="font-medium">{formatPrice(baseTotal * 0.25)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Balance (75%):</span>
                  <span className="font-medium">{formatPrice(baseTotal * 0.75)}</span>
                </div>
              </div>

              {/* Amazing Value Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                <div className="text-center">
                  <h4 className="font-bold text-lg mb-2">🎯 Amazing Value!</h4>
                  <p className="text-xl font-bold text-primary">
                    {(() => {
                      if (pricingBreakdown?.totalCirculation && pricingBreakdown?.durationMultiplier) {
                        // Calculate cost per issue (bi-monthly)
                        const costPerIssue = baseTotal / pricingBreakdown.durationMultiplier;
                        // Calculate CPM for bi-monthly period
                        const costPer1000 = (costPerIssue / pricingBreakdown.totalCirculation) * 1000;
                        return `Only ${formatPrice(costPer1000)} + VAT per 1,000 homes reached`;
                      }
                      return 'Calculating...';
                    })()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-lg text-center">What to Do Next</h4>
                
                <button
                  onClick={() => {
                    window.open('tel:02380266388', '_self');
                  }}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80 font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Call Discover Team for Advice 023 8026 6388
                </button>
                
                <button
                  onClick={handleNext}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Save Quote
                </button>
                
                <button
                  onClick={handleNext}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Book Now
                </button>
              </div>

              {/* What You're Booking */}
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">📦</span>
                  <div>
                    <p className="font-medium">WHAT YOU'RE BOOKING:</p>
                    <p className="text-muted-foreground">Professional leaflet distribution service to your selected areas with guaranteed delivery to homes</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">💰</span>
                  <div>
                    <p className="font-medium">INVESTMENT SHOWN:</p>
                    <p className="text-muted-foreground">Your total includes all distribution costs and VAT. No hidden fees or surprise charges</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">⚡</span>
                  <div>
                    <p className="font-medium">IMMEDIATE CONFIRMATION:</p>
                    <p className="text-muted-foreground">Receive instant confirmation and campaign details after booking</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
