
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { areas, adSizes, durations } from '@/data/advertisingPricing';
import { calculateAdvertisingPrice, formatPrice, calculateCPM, getRecommendedDuration } from '@/lib/pricingCalculator';

interface CostCalculatorProps {
  children: React.ReactNode;
}

const CostCalculator = ({ children }: CostCalculatorProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: '',
    selectedAreas: [] as string[],
    adSize: '',
    duration: ''
  });



  const handleAreaChange = (areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: checked 
        ? [...prev.selectedAreas, areaId]
        : prev.selectedAreas.filter(id => id !== areaId)
    }));
  };

  const pricingBreakdown = calculateAdvertisingPrice(
    formData.selectedAreas,
    formData.adSize,
    formData.duration
  );

  const recommendedDurations = getRecommendedDuration(formData.selectedAreas.length);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-community-navy">
            Advertising Cost Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Select Distribution Areas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Select Distribution Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={area.id}
                      checked={formData.selectedAreas.includes(area.id)}
                      onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={area.id} className="font-bold text-community-navy cursor-pointer block">
                        {area.name}
                      </Label>
                      <p className="text-sm text-gray-700 font-medium mt-1">
                        {area.postcodes}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {area.townsVillages}
                      </p>
                      <p className="text-sm text-community-green font-bold mt-2">
                        Circulation: {area.circulation.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Select Advertisement Size */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Select Advertisement Size
              </h3>
              <RadioGroup
                value={formData.adSize}
                onValueChange={(value) => setFormData(prev => ({ ...prev, adSize: value }))}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {adSizes.map((size) => (
                  <div key={size.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={size.id} id={size.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={size.id} className="font-medium cursor-pointer block">
                        {size.label}
                      </Label>
                      {size.description && (
                        <p className="text-sm text-gray-600 mt-1">{size.description}</p>
                      )}
                      {size.dimensions && (
                        <p className="text-xs text-gray-500 mt-1">{size.dimensions}</p>
                      )}
                      <p className="text-sm text-community-green font-bold mt-2">
                        From {formatPrice(size.basePrice)} per area
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Campaign Duration */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Campaign Duration
              </h3>
              <RadioGroup
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {durations.map((duration) => (
                  <div key={duration.id} className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 ${
                    recommendedDurations.includes(duration.id) ? 'border-community-green border-2' : ''
                  }`}>
                    <RadioGroupItem value={duration.id} id={duration.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={duration.id} className="font-medium cursor-pointer">
                          {duration.label}
                        </Label>
                        {recommendedDurations.includes(duration.id) && (
                          <Badge variant="default" className="text-xs bg-community-green">
                            Recommended
                          </Badge>
                        )}
                        {duration.isSubscription && (
                          <Badge variant="outline" className="text-xs">
                            Subscription
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {duration.months} month{duration.months > 1 ? 's' : ''}
                        {duration.discountMultiplier < duration.months && 
                          ` • ${Math.round((1 - duration.discountMultiplier / duration.months) * 100)}% discount`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Pricing Summary
              </h3>
              
              {pricingBreakdown ? (
                <div className="space-y-4">
                  {/* Campaign Overview */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Circulation</p>
                      <p className="font-bold text-community-navy">{pricingBreakdown.totalCirculation.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost Per Thousand (CPM)</p>
                      <p className="font-bold text-community-navy">{formatPrice(calculateCPM(pricingBreakdown.finalTotal, pricingBreakdown.totalCirculation))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Selected Areas</p>
                      <p className="font-bold text-community-navy">{formData.selectedAreas.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Campaign Duration</p>
                      <p className="font-bold text-community-navy">
                        {durations.find(d => d.id === formData.duration)?.label || 'Not selected'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({formData.selectedAreas.length} areas)</span>
                      <span className="font-medium">{formatPrice(pricingBreakdown.subtotal)}</span>
                    </div>
                    
                    {pricingBreakdown.volumeDiscountPercent > 0 && (
                      <div className="flex justify-between text-community-green">
                        <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%)</span>
                        <span className="font-medium">-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Duration Multiplier</span>
                      <span className="font-medium">×{pricingBreakdown.durationMultiplier}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-xl font-bold text-community-navy">
                      <span>Total Price:</span>
                      <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                    </div>
                  </div>

                  {/* Area Breakdown */}
                  {pricingBreakdown.areaBreakdown.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-community-navy hover:text-community-green">
                        View Area-by-Area Breakdown
                      </summary>
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {pricingBreakdown.areaBreakdown.map(({ area, basePrice, multipliedPrice }) => (
                          <div key={area.id} className="flex justify-between text-sm p-2 bg-white rounded">
                            <span className="truncate mr-2">{area.name}</span>
                            <span className="font-medium">
                              {formatPrice(basePrice)} → {formatPrice(multipliedPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-gray-600">
                  <p>Please select areas, ad size, and duration to see pricing.</p>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Total Circulation</p>
                      <p className="font-bold">-</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Selected Areas</p>
                      <p className="font-bold">{formData.selectedAreas.length}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full bg-community-green hover:bg-green-600"
                  disabled={!formData.fullName || !formData.emailAddress || !formData.selectedAreas.length || !formData.adSize || !formData.duration}
                >
                  Request Quote
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  * This is an estimated price. Final pricing may vary based on specific requirements and current promotions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CostCalculator;
