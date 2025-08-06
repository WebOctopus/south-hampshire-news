import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface CostCalculatorProps {
  children: React.ReactNode;
}

const CostCalculatorOptimized = ({ children }: CostCalculatorProps) => {
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
  
  const { toast } = useToast();
  
  // Use optimized data fetching
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

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: checked 
        ? [...prev.selectedAreas, areaId]
        : prev.selectedAreas.filter(id => id !== areaId)
    }));
  }, []);

  // Memoized calculations
  const effectiveSelectedAreas = useMemo(() => 
    selectedPricingModel === 'bogof' ? bogofPaidAreas : formData.selectedAreas,
    [selectedPricingModel, bogofPaidAreas, formData.selectedAreas]
  );
  
  const pricingBreakdown = useMemo(() => 
    calculateAdvertisingPrice(
      effectiveSelectedAreas,
      formData.adSize,
      formData.duration,
      selectedPricingModel === 'subscription' || selectedPricingModel === 'bogof',
      areas,
      adSizes,
      durations,
      subscriptionDurations,
      volumeDiscounts
    ),
    [effectiveSelectedAreas, formData.adSize, formData.duration, selectedPricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts]
  );

  const recommendedDurations = useMemo(() => 
    getRecommendedDuration(formData.selectedAreas.length),
    [formData.selectedAreas.length]
  );

  // Auto-set duration for BOGOF
  React.useEffect(() => {
    if (selectedPricingModel === 'bogof' && subscriptionDurations.length > 0) {
      const sixMonthDuration = subscriptionDurations.find(d => d.duration_value === 6);
      if (sixMonthDuration) {
        setFormData(prev => ({ ...prev, duration: sixMonthDuration.id }));
      }
    }
  }, [selectedPricingModel, subscriptionDurations]);

  const handleSubmit = () => {
    if (!formData.fullName || !formData.emailAddress || !formData.phoneNumber) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required contact fields.",
      });
      return;
    }

    if (effectiveSelectedAreas.length === 0) {
      toast({
        variant: "destructive",
        title: "No Areas Selected",
        description: "Please select at least one distribution area.",
      });
      return;
    }

    if (!formData.adSize) {
      toast({
        variant: "destructive",
        title: "No Ad Size Selected",
        description: "Please select an advertisement size.",
      });
      return;
    }

    toast({
      title: "Quote Request Submitted",
      description: "We'll get back to you with a detailed quote within 24 hours.",
    });
  };

  // Error state
  if (isError) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Loading Error
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ErrorBoundary>
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-community-navy">
              Advertising Cost Calculator
            </DialogTitle>
            <DialogDescription>
              Calculate your advertising costs across different areas and pricing models
            </DialogDescription>
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

                  <div className="flex items-start space-x-3 p-4 border-2 border-community-green rounded-lg hover:bg-gray-50 bg-gradient-to-r from-green-50 to-emerald-50">
                    <RadioGroupItem value="bogof" id="bogof" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="bogof" className="font-medium cursor-pointer block">
                          SUBSCRIPTION ADVERTISING WITH DISCOVER - BOGOF FOR 3 ISSUES
                        </Label>
                        <Badge className="bg-community-green text-white text-xs font-bold">SUBSCRIPTION SPECIAL</Badge>
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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading distribution areas...</span>
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
                              {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : area.postcodes}
                            </p>
                            <p className="text-sm text-community-green font-bold mt-2">
                              Circulation: {area.circulation.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* BOGOF Areas Selection */}
            {selectedPricingModel === 'bogof' && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                      Select Your "Paid For" Areas
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose at least 3 areas that you'll pay monthly subscription for. We'll match this with an equal number of free areas.
                    </p>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading areas...</span>
                      </div>
                    ) : (
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
                                {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : area.postcodes}
                              </p>
                              <p className="text-sm text-community-green font-bold mt-2">
                                Circulation: {area.circulation.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {bogofPaidAreas.length >= 3 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                        Select Your "Free" Areas
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose up to {bogofPaidAreas.length} areas that you'll get for FREE for the first 6 months.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {areas
                          .filter(area => !bogofPaidAreas.includes(area.id))
                          .map((area) => (
                            <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                              <Checkbox
                                id={`free-${area.id}`}
                                checked={bogofFreeAreas.includes(area.id)}
                                disabled={bogofFreeAreas.length >= bogofPaidAreas.length && !bogofFreeAreas.includes(area.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setBogofFreeAreas(prev => [...prev, area.id]);
                                  } else {
                                    setBogofFreeAreas(prev => prev.filter(id => id !== area.id));
                                  }
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <Label htmlFor={`free-${area.id}`} className="font-bold text-community-navy cursor-pointer block">
                                  {area.name}
                                </Label>
                                <p className="text-sm text-gray-700 font-medium mt-1">
                                  {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : area.postcodes}
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
              </>
            )}

            {/* Advertisement Size Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  Select Advertisement Size
                </h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading ad sizes...</span>
                  </div>
                ) : (
                  <RadioGroup
                    value={formData.adSize}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, adSize: value }))}
                    className="grid grid-cols-1 gap-4"
                  >
                    {adSizes
                      .filter(size => {
                        if (selectedPricingModel === 'bogof') {
                          return size.available_for.includes('subscription');
                        }
                        return size.available_for.includes(selectedPricingModel);
                      })
                      .map((size) => (
                        <div key={size.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={size.id} id={size.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={size.id} className="font-bold text-community-navy cursor-pointer block">
                              {size.name}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{size.dimensions}</p>
                          </div>
                        </div>
                      ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Campaign Duration */}
            {selectedPricingModel !== 'bogof' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                    Select Campaign Duration
                  </h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading duration options...</span>
                    </div>
                  ) : (
                    <RadioGroup
                      value={formData.duration}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                      className="grid grid-cols-1 gap-4"
                    >
                      {(selectedPricingModel === 'subscription' ? subscriptionDurations : durations).map((duration) => (
                        <div key={duration.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={duration.id} id={duration.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={duration.id} className="font-bold text-community-navy cursor-pointer block">
                              {duration.name}
                            </Label>
                            {duration.discount_percentage > 0 && (
                              <Badge className="mt-1 bg-community-green text-white">
                                {duration.discount_percentage}% discount
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pricing Summary */}
            {pricingBreakdown && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                    Pricing Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-bold">{formatPrice(pricingBreakdown.subtotal)}</span>
                    </div>
                    
                    {pricingBreakdown.durationMultiplier < 1 && (
                      <div className="flex justify-between items-center py-2 border-b text-green-600">
                        <span>Duration Discount:</span>
                        <span>-{formatPrice(pricingBreakdown.subtotal * (1 - pricingBreakdown.durationMultiplier))}</span>
                      </div>
                    )}
                    
                    {pricingBreakdown.volumeDiscount > 0 && (
                      <div className="flex justify-between items-center py-2 border-b text-green-600">
                        <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                        <span>-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-bold text-community-navy">Total:</span>
                      <span className="text-lg font-bold text-community-green">
                        {formatPrice(pricingBreakdown.finalTotal)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Total Circulation: {pricingBreakdown.totalCirculation.toLocaleString()}</p>
                      <p>Cost Per Thousand (CPM): {formatPrice(calculateCPM(pricingBreakdown.finalTotal, pricingBreakdown.totalCirculation))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={
                  !formData.fullName || 
                  !formData.emailAddress || 
                  !formData.phoneNumber || 
                  effectiveSelectedAreas.length === 0 || 
                  !formData.adSize ||
                  (!formData.duration && selectedPricingModel !== 'bogof') ||
                  (selectedPricingModel === 'bogof' && bogofPaidAreas.length < 3)
                }
                className="bg-community-green hover:bg-community-green/90 text-white px-8 py-2"
              >
                Request Quote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default CostCalculatorOptimized;