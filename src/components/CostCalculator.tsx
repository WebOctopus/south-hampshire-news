
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { calculateAdvertisingPrice, formatPrice, calculateCPM, getRecommendedDuration } from '@/lib/pricingCalculator';
import { usePricingData } from '@/hooks/usePricingData';

interface CostCalculatorProps {
  children: React.ReactNode;
}

const CostCalculator = ({ children }: CostCalculatorProps) => {
  const { areas, adSizes, durations, volumeDiscounts, isLoading } = usePricingData();
  
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: '',
    selectedAreas: [] as string[],
    adSize: '',
    duration: ''
  });

  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('fixed');
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);



  const handleAreaChange = (areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: checked 
        ? [...prev.selectedAreas, areaId]
        : prev.selectedAreas.filter(id => id !== areaId)
    }));
  };

  // For BOGOF, use the paid areas for calculation
  const effectiveSelectedAreas = selectedPricingModel === 'bogof' ? bogofPaidAreas : formData.selectedAreas;
  
  const pricingBreakdown = calculateAdvertisingPrice(
    effectiveSelectedAreas,
    formData.adSize,
    formData.duration,
    areas,
    adSizes,
    durations,
    volumeDiscounts,
    selectedPricingModel === 'subscription' || selectedPricingModel === 'bogof'
  );

  const recommendedDurations = getRecommendedDuration(formData.selectedAreas.length, durations);

  // Auto-set duration for BOGOF
  useEffect(() => {
    if (selectedPricingModel === 'bogof') {
      const sixMonthDuration = durations.find(d => d.duration_value === 6 && d.duration_type === 'months');
      if (sixMonthDuration) {
        setFormData(prev => ({ ...prev, duration: sixMonthDuration.id }));
      }
    }
  }, [selectedPricingModel, durations]);

  if (isLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Loading pricing data...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

          {/* Select Payment Structure */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Select Payment Structure
              </h3>
              <RadioGroup
                value={selectedPricingModel}
                onValueChange={setSelectedPricingModel}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="fixed" className="font-medium cursor-pointer block">
                      Fixed No Contract Price
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay as you go with no long-term commitment. Flexible pricing based on your selections.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="subscription" id="subscription" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="subscription" className="font-medium cursor-pointer block">
                      Subscription Packages
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Monthly subscription plans with better rates and additional benefits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border-2 border-community-green rounded-lg hover:bg-gray-50 bg-gradient-to-r from-green-50 to-emerald-50">
                  <RadioGroupItem value="bogof" id="bogof" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bogof" className="font-medium cursor-pointer block">
                        SUBSCRIPTION ADVERTISING WITH DISCOVER - CURRENT OFFER - BOGOF FOR 3 ISSUES
                      </Label>
                      <Badge className="bg-red-500 text-white text-xs font-bold">LIMITED OFFER</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      🎉 A great opportunity to double the amount of advertising at no extra cost to you.
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Effectively, half price for six months! Monthly payment plan on direct debit.
                    </p>
                    
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-community-green">✓</span>
                        <span>Nominate at least 3 areas as "paid for" subscription</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-community-green">✓</span>
                        <span>We match with equal number of "free" areas</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-community-green">✓</span>
                        <span>Free areas run for first 6 months (3 bi-monthly issues)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-community-green">✓</span>
                        <span>Complimentary editorial after 4th issue</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Select Distribution Areas */}
          {selectedPricingModel !== 'bogof' && (
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
                         {area.postcodes?.join(', ')}
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
          )}

          {/* BOGOF Paid Areas Selection */}
          {selectedPricingModel === 'bogof' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  Select Your "Paid For" Areas
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose at least 3 areas that you'll pay monthly subscription for. We'll match this with an equal number of free areas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areas.map((area) => (
                    <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`paid-${area.id}`}
                        checked={bogofPaidAreas.includes(area.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBogofPaidAreas(prev => [...prev, area.id]);
                          } else {
                            setBogofPaidAreas(prev => prev.filter(id => id !== area.id));
                            // Also remove from free areas if it was selected
                            setBogofFreeAreas(prev => prev.filter(id => id !== area.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`paid-${area.id}`} className="font-bold text-community-navy cursor-pointer block">
                          {area.name}
                        </Label>
                         <p className="text-sm text-gray-700 font-medium mt-1">
                           {area.postcodes?.join(', ')}
                         </p>
                        <p className="text-sm text-community-green font-bold mt-2">
                          Circulation: {area.circulation.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">ℹ️</span>
                    <span className="text-sm font-medium text-blue-800">
                      Selected: {bogofPaidAreas.length} paid areas {bogofPaidAreas.length < 3 ? `(minimum 3 required)` : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BOGOF Free Areas Selection */}
          {selectedPricingModel === 'bogof' && bogofPaidAreas.length >= 3 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  Select Your FREE Areas (Up to {bogofPaidAreas.length})
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose up to {bogofPaidAreas.length} additional areas that you'll receive FREE for the first 6 months (3 bi-monthly issues).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areas
                    .filter(area => !bogofPaidAreas.includes(area.id))
                    .map((area) => (
                    <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 bg-gradient-to-r from-green-50 to-emerald-50">
                      <Checkbox
                        id={`free-${area.id}`}
                        checked={bogofFreeAreas.includes(area.id)}
                        onCheckedChange={(checked) => {
                          console.log('Free area change:', { checked, currentFreeCount: bogofFreeAreas.length, paidCount: bogofPaidAreas.length });
                          if (checked && bogofFreeAreas.length < bogofPaidAreas.length) {
                            setBogofFreeAreas(prev => [...prev, area.id]);
                          } else if (!checked) {
                            setBogofFreeAreas(prev => prev.filter(id => id !== area.id));
                          }
                        }}
                        disabled={!bogofFreeAreas.includes(area.id) && bogofFreeAreas.length >= bogofPaidAreas.length}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`free-${area.id}`} className="font-bold text-community-navy cursor-pointer block">
                            {area.name}
                          </Label>
                          <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                        </div>
                         <p className="text-sm text-gray-700 font-medium mt-1">
                           {area.postcodes?.join(', ')}
                         </p>
                        <p className="text-sm text-community-green font-bold mt-2">
                          Circulation: {area.circulation.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🎉</span>
                    <span className="text-sm font-medium text-green-800">
                      Selected: {bogofFreeAreas.length}/{bogofPaidAreas.length} free areas for 6 months
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    Total areas: {bogofPaidAreas.length + bogofFreeAreas.length} | 
                    Total circulation: {areas
                      .filter(area => [...bogofPaidAreas, ...bogofFreeAreas].includes(area.id))
                      .reduce((total, area) => total + area.circulation, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                         {size.name}
                        {(['sixth-page', 'eighth-page'].includes(size.id)) && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Subscription Only
                          </Badge>
                        )}
                      </Label>
                       <p className="text-xs text-gray-500 mt-1">{size.dimensions}</p>
                        <p className="text-sm text-community-green font-bold mt-2">
                          From {formatPrice(size.base_price_per_area)} per area
                        </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Campaign Duration */}
          {selectedPricingModel === 'fixed' && (
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
                             {duration.name}
                          </Label>
                          {recommendedDurations.includes(duration.id) && (
                            <Badge variant="default" className="text-xs bg-community-green">
                              Recommended
                            </Badge>
                          )}
                           {duration.duration_type === 'subscription' && (
                             <Badge variant="outline" className="text-xs">
                               Subscription
                             </Badge>
                           )}
                         </div>
                         <p className="text-sm text-gray-600 mt-1">
                           {duration.duration_value} {duration.duration_type}
                           {duration.discount_percentage > 0 && 
                             ` • ${duration.discount_percentage}% discount`
                           }
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Subscription Duration */}
          {selectedPricingModel === 'subscription' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  Subscription Duration
                </h3>
                <RadioGroup
                  value={formData.duration}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {durations.filter(d => d.duration_type === 'subscription' || d.duration_type === 'months').map((duration) => (
                    <div key={duration.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={duration.id} id={duration.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <Label htmlFor={duration.id} className="font-medium cursor-pointer">
                             {duration.name}
                          </Label>
                          <Badge variant="default" className="text-xs bg-community-green">
                            Subscription
                          </Badge>
                        </div>
                         <p className="text-sm text-gray-600 mt-1">
                           {duration.duration_value} {duration.duration_type} • Pay per issue
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Better rates with longer commitments
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* BOGOF Duration - Fixed 6 months */}
          {selectedPricingModel === 'bogof' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  BOGOF Offer Duration
                </h3>
                <div className="p-4 border-2 border-community-green rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-community-green rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">6 Months (3 Bi-monthly Issues)</Label>
                        <Badge className="bg-red-500 text-white text-xs">FIXED OFFER</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Your paid areas continue monthly • Free areas run for 3 issues only
                      </p>
                      <div className="mt-2 text-sm text-community-green">
                        ✓ Account manager will contact you after 3 issues to discuss continuing free areas
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <p className="text-sm text-gray-600">
                        {selectedPricingModel === 'bogof' ? 'Total Circulation (Paid + Free)' : 'Total Circulation'}
                      </p>
                      <p className="font-bold text-community-navy">
                        {selectedPricingModel === 'bogof' 
                          ? areas.filter(area => [...bogofPaidAreas, ...bogofFreeAreas].includes(area.id))
                              .reduce((total, area) => total + area.circulation, 0)
                              .toLocaleString()
                          : pricingBreakdown.totalCirculation.toLocaleString()
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost Per Thousand (CPM)</p>
                      <p className="font-bold text-community-navy">
                        {selectedPricingModel === 'bogof'
                          ? formatPrice(calculateCPM(pricingBreakdown.finalTotal, areas.filter(area => [...bogofPaidAreas, ...bogofFreeAreas].includes(area.id)).reduce((total, area) => total + area.circulation, 0)))
                          : formatPrice(calculateCPM(pricingBreakdown.finalTotal, pricingBreakdown.totalCirculation))
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedPricingModel === 'bogof' ? 'Areas (Paid/Free)' : 'Selected Areas'}
                      </p>
                      <p className="font-bold text-community-navy">
                        {selectedPricingModel === 'bogof' 
                          ? `${bogofPaidAreas.length}/${bogofFreeAreas.length} (${bogofPaidAreas.length + bogofFreeAreas.length} total)`
                          : effectiveSelectedAreas.length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedPricingModel === 'bogof' ? 'BOGOF Offer' : selectedPricingModel === 'subscription' ? 'Subscription' : 'Campaign'} Duration
                      </p>
                      <p className="font-bold text-community-navy">
                        {selectedPricingModel === 'bogof' 
                          ? '6 Months (3 Bi-monthly Issues)'
                          : selectedPricingModel === 'subscription' 
                           ? durations.find(d => d.id === formData.duration)?.name || 'Not selected'
                             : durations.find(d => d.id === formData.duration)?.name || 'Not selected'
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                     <div className="flex justify-between">
                       <span>
                         {selectedPricingModel === 'bogof' 
                           ? `Subtotal (${bogofPaidAreas.length} paid areas)`
                           : `Subtotal (${effectiveSelectedAreas.length} areas)`
                         }
                       </span>
                       <span className="font-medium">{formatPrice(pricingBreakdown.subtotal)}</span>
                     </div>
                     
                     {selectedPricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                       <div className="flex justify-between text-green-600">
                         <span>FREE Areas (6 months) - {bogofFreeAreas.length} areas</span>
                         <span className="font-medium">£0.00</span>
                       </div>
                     )}
                    
                    {pricingBreakdown.volumeDiscountPercent > 0 && (
                      <div className="flex justify-between text-community-green">
                        <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%)</span>
                        <span className="font-medium">-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>{selectedPricingModel === 'subscription' ? 'Total Issues' : 'Duration Multiplier'}</span>
                      <span className="font-medium">
                        {selectedPricingModel === 'subscription' ? `${pricingBreakdown.durationMultiplier} issues` : `×${pricingBreakdown.durationMultiplier}`}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-xl font-bold text-community-navy">
                      <span>Total Price:</span>
                      <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                    </div>
                  </div>

                  {/* Area Breakdown */}
                  {selectedPricingModel === 'bogof' ? (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-community-navy mb-3">
                        Paid vs Free Areas Breakdown
                      </h3>
                      <div className="space-y-4">
                        {/* Paid Areas */}
                        {bogofPaidAreas.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-community-navy mb-2">Paid Areas ({bogofPaidAreas.length})</h4>
                            <div className="space-y-2">
                              {areas.filter(area => bogofPaidAreas.includes(area.id)).map((area) => (
                                <div key={area.id} className="flex justify-between text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                                  <span className="truncate mr-2">{area.name}</span>
                                  <span className="font-medium text-blue-700">PAID</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Free Areas */}
                        {bogofFreeAreas.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-community-navy mb-2">Free Areas ({bogofFreeAreas.length})</h4>
                            <div className="space-y-2">
                              {areas.filter(area => bogofFreeAreas.includes(area.id)).map((area) => (
                                <div key={area.id} className="flex justify-between text-sm p-2 bg-green-50 rounded border-l-4 border-green-500">
                                  <span className="truncate mr-2">{area.name}</span>
                                  <span className="font-medium text-green-700">FREE (6 months)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    pricingBreakdown.areaBreakdown.length > 0 && (
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
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-gray-600">
                  <p>
                    {selectedPricingModel === 'subscription' 
                      ? 'Please select areas and ad size to get a subscription quote.'
                      : 'Please select areas, ad size, and duration to see pricing.'
                    }
                  </p>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Total Circulation</p>
                      <p className="font-bold">
                        {formData.selectedAreas.length > 0 
                          ? areas.filter(area => formData.selectedAreas.includes(area.id))
                              .reduce((total, area) => total + area.circulation, 0)
                              .toLocaleString()
                          : '-'
                        }
                      </p>
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
                  disabled={
                    !formData.fullName || 
                    !formData.emailAddress || 
                    !formData.adSize || 
                    !formData.duration ||
                    (selectedPricingModel === 'bogof' 
                      ? bogofPaidAreas.length === 0 
                      : effectiveSelectedAreas.length === 0
                    )
                  }
                >
                  {selectedPricingModel === 'bogof' 
                    ? 'Get BOGOF Quote' 
                    : selectedPricingModel === 'subscription' 
                      ? 'Get Subscription Quote' 
                      : 'Request Quote'
                  }
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
