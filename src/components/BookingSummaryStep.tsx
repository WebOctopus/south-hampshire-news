import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricingCalculator';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletData } from '@/hooks/useLeafletData';
import { usePaymentOptions } from '@/hooks/usePaymentOptions';
import { useStepForm } from '@/components/StepForm';
import { getAvailableIssueOptions } from '@/lib/issueSchedule';

interface BookingSummaryStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  pricingBreakdown: any;
  selectedPaymentOption?: string;
  onPaymentOptionChange: (option: string) => void;
  selectedStartingIssue?: string;
  onStartingIssueChange?: (option: string) => void;
  onNext?: () => void;
}

export const BookingSummaryStep: React.FC<BookingSummaryStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedAdSize,
  selectedDuration,
  pricingBreakdown,
  selectedPaymentOption,
  onPaymentOptionChange,
  selectedStartingIssue,
  onStartingIssueChange,
  onNext
}) => {
  const { areas, adSizes, durations } = usePricingData();
  const { leafletAreas, leafletSizes } = useLeafletData();
  const { data: paymentOptions = [] } = usePaymentOptions();
  const { nextStep } = useStepForm();

  // Calculate available starting issue options
  const effectiveAreas = pricingModel === 'leafleting' ? leafletAreas : areas;
  const effectiveSelectedAreas = pricingModel === 'bogof' ? 
    [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas;
  const selectedAreaData = effectiveAreas?.filter(area => 
    effectiveSelectedAreas.includes(area.id)
  ) || [];
  
  const availableIssueOptions = getAvailableIssueOptions(selectedAreaData);

  // Get display names
  const getAdSizeName = () => {
    if (pricingModel === 'leafleting') {
      const leafletSize = leafletSizes?.find(size => size.id === selectedAdSize);
      return leafletSize?.label || 'Unknown Size';
    } else {
      const adSize = adSizes?.find(size => size.id === selectedAdSize);
      return adSize?.name || 'Unknown Size';
    }
  };

  const getDurationName = () => {
    if (pricingModel === 'bogof') {
      return '6 months';
    }
    const duration = durations?.find(d => d.id === selectedDuration);
    return duration?.name || 'Unknown Duration';
  };

  const getAreaName = (areaId: string) => {
    if (pricingModel === 'leafleting') {
      const area = leafletAreas?.find(area => area.id === areaId);
      return `Area ${area?.area_number} - ${area?.name}` || 'Unknown Area';
    } else {
      const area = areas?.find(area => area.id === areaId);
      return area?.name || 'Unknown Area';
    }
  };

  const getAreaNumber = (areaId: string) => {
    if (pricingModel === 'leafleting') {
      const area = leafletAreas?.find(area => area.id === areaId);
      return area?.area_number || 'N/A';
    } else {
      return 'N/A';
    }
  };

  // Calculate pricing options based on admin-configured payment options
  const baseTotal = pricingBreakdown?.finalTotal || 0;
  const cpmRate = pricingBreakdown?.cpm || 0;

  const calculatePaymentAmount = (option: any) => {
    let amount = baseTotal;
    
    // For 3+ package (BOGOF) monthly payments, show 6-month total (half of base)
    if (pricingModel === 'bogof' && option.option_type === 'monthly') {
      amount = baseTotal / 2;
    }
    
    // For 3+ package (BOGOF) 6-month full payment, calculate as monthly * 6
    if (pricingModel === 'bogof' && option.display_name?.includes('6 Months')) {
      amount = baseTotal / 2;
    }
    
    // For 12-month options, double the base amount (assuming baseTotal is 6 months)
    if (option.display_name?.includes('12 Months') || option.option_type?.includes('12')) {
      amount = baseTotal * 2;
    }
    
    // Apply discount
    if (option.discount_percentage > 0) {
      amount = amount * (1 - option.discount_percentage / 100);
    }
    
    // Apply additional fee
    if (option.additional_fee_percentage !== 0) {
      amount = amount * (1 + option.additional_fee_percentage / 100);
    }
    
    // For monthly payments, divide by minimum payments
    if (option.minimum_payments && option.option_type === 'monthly') {
      return amount / option.minimum_payments;
    }
    
    return amount;
  };

  const effectivePaidAreas = pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;
  const effectiveFreeAreas = pricingModel === 'bogof' ? bogofFreeAreas : [];

  const handleNext = () => {
    if (!selectedPaymentOption) {
      return; // Validation handled by form
    }
    nextStep();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">YOUR BASKET</h2>
        <p className="text-muted-foreground">Review your selection and choose your payment option</p>
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
                  <Label className="text-sm font-medium text-muted-foreground">Advert Size</Label>
                  <p className="font-medium">{getAdSizeName()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {pricingModel === 'bogof' ? 'Minimum Duration: 3 issues per area = 6 months' : 'Duration'}
                  </Label>
                  <p className="font-medium">{pricingModel === 'bogof' ? '' : getDurationName()}</p>
                </div>
              </div>
              
              {pricingModel === 'bogof' && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Booking Type</Label>
                  <p className="font-medium">3+ Repeat Package including Buy One Get One Free</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Starting Issue</Label>
                {availableIssueOptions.length > 0 ? (
                  <div className="mt-2">
                    <RadioGroup 
                      value={selectedStartingIssue || availableIssueOptions[0]?.value} 
                      onValueChange={onStartingIssueChange}
                      className="space-y-2"
                    >
                      {availableIssueOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm font-medium cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <p className="font-medium">Next available issue</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Paid Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected "Paid For" Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                 {effectivePaidAreas.map((areaId) => (
                   <div key={areaId} className="flex items-center gap-2">
                     <Badge variant="default" className="bg-primary">Paid</Badge>
                     <span className="text-sm">{getAreaName(areaId)}</span>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          {/* Free Areas (BOGOF only) */}
          {pricingModel === 'bogof' && effectiveFreeAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Selected FREE Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                   {effectiveFreeAreas.map((areaId) => (
                     <div key={areaId} className="flex items-center gap-2">
                       <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>
                       <span className="text-sm">{getAreaName(areaId)}</span>
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Commitment Terms (BOGOF only) */}
          {pricingModel === 'bogof' && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-800">Commitment Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-700 space-y-3">
                <p className="font-medium">After six months you have three choices:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Continue with the paid for areas at the same cost</li>
                  <li>Change your campaign at a revised cost</li>
                  <li>Cancel and nothing more to pay!</li>
                </ol>
                <p className="text-xs">
                  Hopefully, you will want to continue and we'll do all we can to ensure you get the best from your investment in Discover.
                </p>
                <p className="font-medium">
                  Minimum commitment: 3 issues in each area = 6 months of advertising
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">3 Payment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedPaymentOption} 
                onValueChange={onPaymentOptionChange}
                className="space-y-4"
              >
                {paymentOptions
                  .sort((a, b) => {
                    // Custom sorting: monthly first, then 6 months, then 12 months
                    const getOrder = (option: any) => {
                      if (option.option_type === 'monthly') return 1;
                      if (option.display_name?.includes('6 Months')) return 2;
                      if (option.display_name?.includes('12 Months')) return 3;
                      return 4; // fallback for any other options
                    };
                    return getOrder(a) - getOrder(b);
                  })
                  .map((option) => {
                  const amount = calculatePaymentAmount(option);
                  const savings = option.discount_percentage > 0 ? baseTotal - amount : 0;
                  
                  return (
                      <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option.option_type} id={option.option_type} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.option_type} className="font-medium cursor-pointer">
                            {option.option_type === 'monthly' ? 'Monthly Payment Plan' : option.display_name}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.option_type === 'monthly' ? 'Direct debit or debit/credit card' : option.description}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(amount)} + VAT
                          </p>
                          {savings > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Save {formatPrice(savings)}
                            </Badge>
                          )}
                          {option.minimum_payments && (
                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                              <p>• Minimum number of payments = {option.minimum_payments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                  );
                })}
              </RadioGroup>

              {/* Amazing Value Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                <div className="text-center">
                  <h4 className="font-bold text-lg mb-2">🎯 Amazing Value!</h4>
                  <p className="text-xl font-bold text-primary">
                    {(() => {
                      if (selectedPaymentOption && pricingBreakdown?.totalCirculation) {
                        const selectedOption = paymentOptions.find(opt => opt.option_type === selectedPaymentOption);
                        if (selectedOption) {
                          let selectedAmount = calculatePaymentAmount(selectedOption);
                          
                          // For monthly payments, calculate annual cost for cost per 1,000
                          if (selectedOption.option_type === 'monthly' && selectedOption.minimum_payments) {
                            selectedAmount = selectedAmount * selectedOption.minimum_payments;
                          }
                          
                          // For 12-month options, double the circulation since campaign runs twice
                          let circulation = pricingBreakdown.totalCirculation;
                          if (selectedOption.display_name?.includes('12 Months') || selectedOption.option_type?.includes('12')) {
                            circulation = circulation * 2;
                          }
                          
                          const costPer1000 = (selectedAmount / circulation) * 1000;
                          return `Only ${formatPrice(costPer1000)} + VAT per 1,000 homes reached`;
                        }
                      }
                      return `Only ${formatPrice(cpmRate)} + VAT per 1,000 homes reached`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-lg text-center">What to Do Next</h4>
                
                <button
                  onClick={() => {
                    window.open('tel:01234567890', '_self');
                  }}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80 font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Call Discover Team
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedPaymentOption}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Quote
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedPaymentOption}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="text-muted-foreground">A complete advertising package including professional ad design, guaranteed distribution to your selected areas, and placement in our trusted local publication</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">💰</span>
                  <div>
                    <p className="font-medium">INVESTMENT SHOWN:</p>
                    <p className="text-muted-foreground">Your total includes all costs - ad creation, distribution, and VAT. No hidden fees or surprise charges</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">⚡</span>
                  <div>
                    <p className="font-medium">IMMEDIATE CONFIRMATION:</p>
                    <p className="text-muted-foreground">Book now for instant campaign confirmation and priority page position or call us for help and advice.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">🎨</span>
                  <div>
                    <p className="font-medium">FREE DESIGN SERVICE:</p>
                    <p className="text-muted-foreground">By booking online you get free advert design. Our professional design team creates stunning ads at no extra cost - just provide your content, images, logo and branding kit if you have one.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-primary font-medium">🎯</span>
                  <div>
                    <p className="font-medium">GUARANTEED REACH:</p>
                    <p className="text-muted-foreground">Your ad will reach every household in your selected areas during the scheduled distribution period, on time, every time.</p>
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

export default BookingSummaryStep;