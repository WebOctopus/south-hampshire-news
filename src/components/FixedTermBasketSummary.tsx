import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricingCalculator';
import { usePricingData } from '@/hooks/usePricingData';
import { useStepForm } from '@/components/StepForm';
import { Separator } from '@/components/ui/separator';

interface FixedTermBasketSummaryProps {
  selectedAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  pricingBreakdown: any;
  onNext?: () => void;
}

export const FixedTermBasketSummary: React.FC<FixedTermBasketSummaryProps> = ({
  selectedAreas,
  selectedAdSize,
  selectedDuration,
  pricingBreakdown,
  onNext
}) => {
  const { areas, adSizes, durations } = usePricingData();
  const { nextStep } = useStepForm();

  // Get display names
  const getAdSizeName = () => {
    const adSize = adSizes?.find(size => size.id === selectedAdSize);
    return adSize?.name || 'Unknown Size';
  };

  const getAreaName = (areaId: string) => {
    const area = areas?.find(area => area.id === areaId);
    return area?.name || 'Unknown Area';
  };

  const getRateCardPrice = () => {
    const adSize = adSizes?.find(size => size.id === selectedAdSize);
    return adSize?.base_price_per_area || 0;
  };

  const getDurationValue = () => {
    const duration = durations?.find(d => d.id === selectedDuration);
    return duration?.duration_value || 0;
  };

  const getDurationName = () => {
    const duration = durations?.find(d => d.id === selectedDuration);
    return duration?.name || 'Unknown Duration';
  };

  // Calculate values
  const rateCardPrice = getRateCardPrice();
  const numberOfAreas = selectedAreas.length;
  const numberOfIssues = getDurationValue();
  const totalInsertions = numberOfAreas * numberOfIssues;
  
  // Cost calculations
  const baseTotal = pricingBreakdown?.baseTotal || 0;
  const finalTotal = pricingBreakdown?.finalTotal || 0;
  const totalWithVAT = finalTotal * 1.20;
  const costPerInsert = finalTotal / totalInsertions;
  const saving = baseTotal - finalTotal;

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">YOUR BASKET</h2>
        <p className="text-muted-foreground">Review your Fixed Term booking details</p>
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
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Booking Type</Label>
                <p className="font-medium">Fixed Term</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Advert Size</Label>
                <p className="font-medium">{getAdSizeName()}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rate Card Price Per Insert</Label>
                <p className="font-medium">{formatPrice(rateCardPrice)}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Number of Areas</Label>
                <p className="font-medium">{numberOfAreas}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Selected Areas</Label>
                <div className="space-y-1 mt-2">
                  {selectedAreas.map((areaId, index) => (
                    <div key={areaId} className="text-sm">
                      {getAreaName(areaId)}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Number of Issues in Each Area</Label>
                <p className="font-medium">{numberOfIssues}</p>
                <p className="text-xs text-muted-foreground mt-1">Duration: {getDurationName()}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Total Number of Insertions in Booking</Label>
                <p className="text-xl font-bold text-primary">{totalInsertions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({numberOfAreas} areas × {numberOfIssues} issues)
                </p>
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

        {/* Right Column - Pricing Details */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cost of This Booking</span>
                  <span className="font-medium">{formatPrice(finalTotal)}</span>
                </div>

                {saving > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saving</span>
                      <span className="font-medium text-green-600">-{formatPrice(saving)}</span>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Subtotal (Excl. VAT)</span>
                  <span className="font-bold">{formatPrice(finalTotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">VAT (20%)</span>
                  <span className="font-medium">{formatPrice(finalTotal * 0.20)}</span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total (Incl. VAT)</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalWithVAT)}</span>
                </div>

                <Separator className="my-3" />

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cost Per Insert in This Booking</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(costPerInsert)}</span>
                  </div>
                </div>

                {saving > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-800">Total Saving</p>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(saving)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Amazing Value Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                <div className="text-center">
                  <h4 className="font-bold text-lg mb-2">🎯 Amazing Value!</h4>
                  <p className="text-xl font-bold text-primary">
                    {(() => {
                      if (pricingBreakdown?.totalCirculation) {
                        const costPer1000 = (finalTotal / pricingBreakdown.totalCirculation) * 1000;
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
                    window.open('tel:01234567890', '_self');
                  }}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80 font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Call Discover Team
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
                    <p className="text-muted-foreground">A Fixed Term advertising package with guaranteed distribution to your selected areas</p>
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