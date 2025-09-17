
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CostCalculatorProps {
  children: React.ReactNode;
}

interface Area {
  id: string;
  name: string;
  postcodes: string[];
  circulation: number;
  base_price_multiplier: number;
  quarter_page_multiplier: number;
  half_page_multiplier: number;
  full_page_multiplier: number;
}

interface Duration {
  id: string;
  name: string;
  duration_value: number;
  discount_percentage: number;
  duration_type: string;
}

interface VolumeDiscount {
  id: string;
  min_areas: number;
  max_areas: number | null;
  discount_percentage: number;
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

  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('fixed');
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);
  const [dbAdSizes, setDbAdSizes] = useState<any[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [subscriptionDurations, setSubscriptionDurations] = useState<Duration[]>([]);
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>([]);
  const [agencyDiscountPercent, setAgencyDiscountPercent] = useState<number>(0);
  
  // Enhanced loading states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { toast } = useToast();

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: checked 
        ? [...prev.selectedAreas, areaId]
        : prev.selectedAreas.filter(id => id !== areaId)
    }));
  }, []);

  // Memoized calculations to prevent unnecessary re-renders
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
      dbAdSizes,
      durations,
      subscriptionDurations,
      volumeDiscounts,
      bogofFreeAreas,
      agencyDiscountPercent
    ),
    [effectiveSelectedAreas, formData.adSize, formData.duration, selectedPricingModel, areas, dbAdSizes, durations, subscriptionDurations, volumeDiscounts, bogofFreeAreas, agencyDiscountPercent]
  );

  const recommendedDurations = useMemo(() => 
    getRecommendedDuration(formData.selectedAreas.length),
    [formData.selectedAreas.length]
  );
  
  // Enhanced data loading with retry logic and timeout
  const loadPricingData = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
        setHasError(false);
      } else {
        setIsLoading(true);
        setRetryCount(0);
      }
      
      // Load user's agency discount if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('agency_discount_percent, is_agency_member')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileData?.is_agency_member && profileData?.agency_discount_percent) {
          setAgencyDiscountPercent(profileData.agency_discount_percent);
        }
      }
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
      });
      
      // Load data in parallel with timeout
      const dataPromise = Promise.all([
        supabase
          .from('ad_sizes')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        
        supabase
          .from('pricing_areas')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        
        supabase
          .from('pricing_durations')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        
        supabase
          .from('volume_discounts')
          .select('*')
          .eq('is_active', true)
          .order('min_areas')
      ]);

      const [adSizesResult, areasResult, durationsResult, volumeDiscountsResult] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any[];

      // Check for errors
      const errors = [adSizesResult.error, areasResult.error, durationsResult.error, volumeDiscountsResult.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.message).join(', ')}`);
      }

      

      // Process the data
      const transformedAdSizes = (adSizesResult.data || []).map(item => ({
        ...item,
        available_for: Array.isArray(item.available_for) 
          ? item.available_for 
          : ['fixed', 'subscription']
      }));

      const fixedDurations = (durationsResult.data || []).filter(d => d.duration_type === 'fixed');
      const subDurations = (durationsResult.data || []).filter(d => d.duration_type === 'subscription');

      // Validate data integrity
      if (!transformedAdSizes.length || !areasResult.data?.length) {
        throw new Error('No data available. Please contact support.');
      }

      // Update all state atomically
      setDbAdSizes(transformedAdSizes);
      setAreas(areasResult.data || []);
      setDurations(fixedDurations);
      setSubscriptionDurations(subDurations);
      setVolumeDiscounts(volumeDiscountsResult.data || []);
      setHasError(false);
      setErrorDetails('');
      setIsLoading(false);
      setIsRetrying(false);
      

      if (isRetry) {
        toast({
          title: "Data loaded successfully",
          description: "Pricing information has been refreshed.",
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error loading pricing data:', error);
      
      setHasError(true);
      setErrorDetails(error.message || 'Failed to load pricing data');
      setIsLoading(false);
      setIsRetrying(false);
      
      if (isRetry) {
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: error.message || 'Unable to load pricing information. Please try again.',
        });
      }
    }
  }, [retryCount, toast]);

  // Auto-retry logic
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      loadPricingData(true);
    }
  }, [loadPricingData, retryCount]);

  // Initial data load
  useEffect(() => {
    loadPricingData();
  }, []);

  // Auto-set duration for BOGOF
  useEffect(() => {
    if (selectedPricingModel === 'bogof' && subscriptionDurations.length > 0) {
      // Find the 6-month subscription duration
      const sixMonthDuration = subscriptionDurations.find(d => d.duration_value === 6);
      if (sixMonthDuration) {
        setFormData(prev => ({ ...prev, duration: sixMonthDuration.id }));
      }
    }
  }, [selectedPricingModel, subscriptionDurations]);

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
                        <span>Nominate at least 1 area as "paid for" subscription</span>
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
                <div className="text-center py-4">
                  <div className="animate-pulse">Loading distribution areas...</div>
                </div>
              ) : areas.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No distribution areas available. Please try refreshing.
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

          {/* BOGOF Paid Areas Selection */}
          {selectedPricingModel === 'bogof' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  Select Your "Paid For" Areas
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose at least 1 area that you'll pay monthly subscription for. We'll match this with an equal number of free areas.
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
                          {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : area.postcodes}
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
                      Selected: {bogofPaidAreas.length} paid areas {bogofPaidAreas.length < 1 ? `(minimum 1 required)` : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BOGOF Free Areas Selection */}
          {selectedPricingModel === 'bogof' && bogofPaidAreas.length >= 1 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                  Select Your FREE Areas (Up to {bogofPaidAreas.length})
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose up to {bogofPaidAreas.length} additional areas that you'll receive FREE for the first 6 months (3 bi-monthly issues).
                  Available free areas: {areas.filter(area => !bogofPaidAreas.includes(area.id)).length}
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
                          {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : area.postcodes}
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
               {(() => {
                if (isLoading || isRetrying) {
                  return (
                    <div className="text-center py-8 space-y-4">
                      <div className="animate-spin w-8 h-8 border-4 border-community-green border-t-transparent rounded-full mx-auto"></div>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {isRetrying ? 'Retrying data load...' : 'Loading ad sizes and pricing...'}
                        </p>
                        <p className="text-sm text-gray-500">
                          This may take a few moments
                        </p>
                      </div>
                    </div>
                  );
                }
                
                if (hasError) {
                  return (
                    <div className="text-center py-8 space-y-4">
                      <div className="text-red-500 space-y-2">
                        <p className="font-medium">❌ Failed to load pricing data</p>
                        <p className="text-sm">{errorDetails}</p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        {retryCount < 3 && (
                          <Button 
                            onClick={handleRetry}
                            variant="outline" 
                            size="sm"
                            className="bg-community-green/10 hover:bg-community-green/20"
                          >
                            Retry ({3 - retryCount} left)
                          </Button>
                        )}
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline" 
                          size="sm"
                        >
                          Refresh Page
                        </Button>
                      </div>
                    </div>
                  );
                }
                
                if (dbAdSizes.length === 0) {
                  return (
                    <div className="text-center py-8 space-y-3">
                      <p className="text-gray-500">No ad sizes available</p>
                      <Button 
                        onClick={handleRetry}
                        variant="outline" 
                        size="sm"
                      >
                        Retry Loading
                      </Button>
                    </div>
                  );
                }
                
                return (
                <RadioGroup
                  value={formData.adSize}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, adSize: value }))}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                {dbAdSizes
                   .filter(size => {
                     // Filter based on available_for field in database
                     const pricingType = selectedPricingModel === 'bogof' ? 'subscription' : selectedPricingModel;
                     return size.available_for && size.available_for.includes(pricingType);
                   })
                  .map((size) => {
                    // Map database ad size to expected format
                    const mappedSize = {
                      id: size.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      label: size.name,
                      dimensions: size.dimensions
                    };
                     return (
                      <div key={mappedSize.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={mappedSize.id} id={mappedSize.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={mappedSize.id} className="font-medium cursor-pointer block">
                            {mappedSize.label}
                            {(selectedPricingModel === 'fixed' && !size.available_for.includes('fixed')) && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Subscription Only
                              </Badge>
                            )}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {mappedSize.dimensions}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                 </RadioGroup>
                );
               })()}
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
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {duration.duration_value} month{duration.duration_value > 1 ? 's' : ''}
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
                  {subscriptionDurations.map((duration) => (
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
                          {duration.duration_value} months • Pay per issue
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
                            ? subscriptionDurations.find(d => d.id === formData.duration)?.name || 'Not selected'
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
                     
                     {pricingBreakdown.agencyDiscountPercent && pricingBreakdown.agencyDiscountPercent > 0 && (
                       <div className="flex justify-between text-purple-600">
                         <span>Agency Discount ({pricingBreakdown.agencyDiscountPercent}%)</span>
                         <span className="font-medium">-{formatPrice(pricingBreakdown.agencyDiscount || 0)}</span>
                       </div>
                     )}
                    
                    <div className="flex justify-between">
                      <span>{selectedPricingModel === 'subscription' ? 'Total Issues' : 'Duration Multiplier'}</span>
                      <span className="font-medium">
                        {selectedPricingModel === 'subscription' ? `${pricingBreakdown.durationMultiplier} issues` : `×${pricingBreakdown.durationMultiplier}`}
                      </span>
                    </div>
                    
                    <Separator />
                    
                     {selectedPricingModel === 'subscription' || selectedPricingModel === 'bogof' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-lg font-semibold text-community-navy">
                            <span>Monthly Cost Breakdown:</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Payment:</span>
                            <span className="font-medium">{formatPrice(pricingBreakdown.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration (months):</span>
                            <span className="font-medium">{pricingBreakdown.durationMultiplier}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-xl font-bold text-community-navy">
                            <span>Total Campaign Cost:</span>
                            <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between text-xl font-bold text-community-navy">
                          <span>Total Price:</span>
                          <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                        </div>
                      )}
                     
                     {(selectedPricingModel === 'subscription' || selectedPricingModel === 'bogof') && (
                       <div className="text-sm text-gray-600 space-y-1">
                         <p>• Paid monthly by direct debit</p>
                         <p>• All prices subject to VAT</p>
                         {selectedPricingModel === 'subscription' && (
                           <p>• Annual payment option available with discount</p>
                         )}
                       </div>
                     )}
                     
                     {selectedPricingModel === 'fixed' && (
                       <div className="text-sm text-gray-600">
                         <p>• All prices subject to VAT</p>
                       </div>
                     )}
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
