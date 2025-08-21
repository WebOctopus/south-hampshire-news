import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePricingData } from '@/hooks/usePricingData';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';
import { calculateLeafletingPrice } from '@/lib/leafletingCalculator';
import { useLeafletAreas, useLeafletSizes, useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useStepForm } from './StepForm';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

interface CalculatorStepFormProps {
  pricingModel: 'fixed' | 'subscription' | 'leafleting';
}

export const CalculatorStepForm: React.FC<CalculatorStepFormProps> = ({ pricingModel }) => {
  const { toast } = useToast();
  const { nextStep } = useStepForm();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
  });
  
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);
  const [selectedAdSize, setSelectedAdSize] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFixedTermConfirmation, setShowFixedTermConfirmation] = useState(false);
  const [contactSectionReached, setContactSectionReached] = useState(false);

  // Use the pricing data hook
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

  // Use leafleting data hooks
  const { data: leafletAreas, isLoading: leafletAreasLoading, error: leafletAreasError } = useLeafletAreas();
  const { data: leafletSizes, isLoading: leafletSizesLoading, error: leafletSizesError } = useLeafletSizes();
  const { data: leafletDurations, isLoading: leafletDurationsLoading, error: leafletDurationsError } = useLeafletCampaignDurations();

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setSelectedAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  }, []);

  const effectiveSelectedAreas = useMemo(() => {
    return pricingModel === 'subscription' ? bogofPaidAreas : selectedAreas;
  }, [pricingModel, selectedAreas, bogofPaidAreas]);

  const pricingBreakdown = useMemo(() => {
    // Handle leafleting service pricing
    if (pricingModel === 'leafleting') {
      if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
        return null;
      }
      const selectedLeafletDurationData = leafletDurations?.find(d => d.id === selectedDuration);
      const durationMultiplier = selectedLeafletDurationData?.months || 1;
      return calculateLeafletingPrice(effectiveSelectedAreas, leafletAreas || [], durationMultiplier);
    }

    // Handle regular advertising pricing
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }

    const relevantDurations = (pricingModel === 'subscription') ? subscriptionDurations : durations;
    
    return calculateAdvertisingPrice(
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      pricingModel === 'subscription',
      areas,
      adSizes,
      relevantDurations,
      subscriptionDurations,
      volumeDiscounts
    );
  }, [effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, bogofPaidAreas, selectedAreas, leafletAreas, leafletDurations]);

  // Auto-set duration when pricing model or durations change
  useEffect(() => {
    const relevantDurations = pricingModel === 'leafleting' ? leafletDurations :
      (pricingModel === 'subscription') ? subscriptionDurations : durations;
      
    if (relevantDurations && relevantDurations.length > 0) {
      if (!selectedDuration) {
        const defaultDuration = relevantDurations.find(d => (d as any).is_default) || relevantDurations[0];
        if (defaultDuration) {
          setSelectedDuration(defaultDuration.id);
        }
      } else {
        const isValidSelection = relevantDurations.some(d => d.id === selectedDuration);
        if (!isValidSelection) {
          setSelectedDuration("");
        }
      }
    }
  }, [pricingModel, durations, subscriptionDurations, leafletDurations]);

  // Monitor contact section for Fixed Term confirmation
  useEffect(() => {
    const contactSection = document.querySelector('[data-contact-section]');
    if (!contactSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !contactSectionReached) {
            setContactSectionReached(true);
            if (pricingModel === 'fixed' && !showFixedTermConfirmation && pricingBreakdown) {
              setShowFixedTermConfirmation(true);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(contactSection);
    return () => observer.disconnect();
  }, [pricingModel, contactSectionReached, showFixedTermConfirmation, pricingBreakdown]);

  const handleGetQuote = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email, and password.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (effectiveSelectedAreas.length === 0) {
      toast({
        title: "No Areas Selected",
        description: "Please select at least one distribution area.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAdSize) {
      toast({
        title: "No Ad Size Selected",
        description: "Please select an advertisement size.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDuration) {
      toast({
        title: "No Duration Selected",
        description: "Please select a campaign duration.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations : 
                                (pricingModel === 'subscription') ? subscriptionDurations : durations;
      const durationData = relevantDurations?.find(d => d.id === selectedDuration);
      const durationDiscountPercent = pricingModel === 'leafleting' ? 0 : (durationData as any)?.discount_percentage || 0;
      const subtotalAfterVolume = pricingBreakdown?.subtotal ? pricingBreakdown.subtotal - (pricingBreakdown.volumeDiscount || 0) : 0;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        contact_name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        title: 'Quote Request',
        pricing_model: pricingModel,
        ad_size_id: selectedAdSize,
        duration_id: selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: pricingModel === 'subscription' ? bogofPaidAreas : [],
        bogof_free_area_ids: pricingModel === 'subscription' ? bogofFreeAreas : [],
        monthly_price: monthlyFinal,
        subtotal: pricingBreakdown?.subtotal || 0,
        final_total: pricingBreakdown?.finalTotal || 0,
        duration_multiplier: pricingBreakdown?.durationMultiplier || 1,
        total_circulation: pricingBreakdown?.totalCirculation || 0,
        volume_discount_percent: pricingBreakdown?.volumeDiscountPercent || 0,
        duration_discount_percent: durationDiscountPercent,
        pricing_breakdown: JSON.parse(JSON.stringify(pricingBreakdown || {})) as any,
        selections: {
          pricingModel,
          selectedAdSize,
          selectedDuration,
          selectedAreas,
          bogofPaidAreas,
          bogofFreeAreas
        } as any,
        user_id: user?.id || null
      };

      const { error } = await supabase.from('quote_requests').insert(payload);
      if (error) throw error;
      
      toast({
        title: "Quote Request Sent!",
        description: "Our sales team will contact you within 24 hours to discuss your advertising needs.",
      });
      
      nextStep(); // Move to completion step
    } catch (err: any) {
      console.error('Submit quote error:', err);
      toast({ title: "Error", description: err.message || 'Failed to submit quote request.', variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFixedTermContinue = () => {
    setShowFixedTermConfirmation(false);
  };

  const handleSwitchToSubscription = () => {
    setShowFixedTermConfirmation(false);
    // Note: We can't change pricing model in this step since it was selected in the previous step
    toast({ 
      title: "Please Go Back", 
      description: "Use the previous step to select the 3+ Repeat Package." 
    });
  };

  if (isError) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Failed to Load Data
          </CardTitle>
          <CardDescription>
            {error?.message || "Unable to load pricing data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Configure Your Campaign</h2>
        <p className="text-muted-foreground">
          Complete your {pricingModel === 'fixed' ? 'Fixed Term' : pricingModel === 'subscription' ? '3+ Repeat Package' : 'Leafleting Service'} setup
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          
          
          {/* Distribution Areas */}
          {(pricingModel === 'fixed' || pricingModel === 'subscription') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Distribution Areas</h3>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading distribution areas...
                </div>
              ) : areas.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No distribution areas available. Please check the admin configuration.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areas.map((area) => (
                    <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={area.id}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2" onClick={() => handleAreaChange(area.id, !selectedAreas.includes(area.id))}>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={area.id} className="text-sm font-medium cursor-pointer">
                                {area.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {area.circulation?.toLocaleString()} homes
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {(area as any).description || 'Area description'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Postcodes: {(area as any).postcodes || 'N/A'}</span>
                              <span className="font-medium">£{(area as any).price_per_thousand || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leafleting Areas */}
          {pricingModel === 'leafleting' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Leaflet Distribution Areas</h3>
              {leafletAreasLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading leaflet areas...
                </div>
              ) : leafletAreasError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load leaflet areas: {leafletAreasError.message}
                  </AlertDescription>
                </Alert>
              ) : !leafletAreas || leafletAreas.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No leaflet areas available. Please check the admin configuration.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leafletAreas.map((area) => (
                    <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`leaflet-${area.id}`}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2" onClick={() => handleAreaChange(area.id, !selectedAreas.includes(area.id))}>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`leaflet-${area.id}`} className="text-sm font-medium cursor-pointer">
                                {area.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {(area as any).circulation?.toLocaleString() || 0} homes
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div>Copy: {(area as any).copy_deadline || 'N/A'}</div>
                              <div>Print: {(area as any).print_deadline || 'N/A'}</div>
                              <div>Delivery: {(area as any).delivery_date || 'N/A'}</div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Price per 1000:</span>
                              <span className="font-medium">£{(area as any).price_per_thousand || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOGOF Areas Selection for Subscription */}
          {pricingModel === 'subscription' && bogofPaidAreas.length >= 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pick Your Free Areas</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-medium mb-3">
                  You can select up to {bogofPaidAreas.length} free areas
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {areas.filter(area => !bogofPaidAreas.includes(area.id)).map((area) => (
                    <div key={area.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
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
                      />
                      <Label htmlFor={`free-${area.id}`} className="text-sm cursor-pointer flex-1">
                        {area.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ad Size Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {pricingModel === 'leafleting' ? 'Select Leaflet Size' : 'Select Advertisement Size'}
            </h3>
            
            {pricingModel === 'leafleting' ? (
              // Leaflet sizes
              leafletSizesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading leaflet sizes...
                </div>
              ) : leafletSizesError || !leafletSizes || leafletSizes.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {leafletSizesError ? `Failed to load leaflet sizes: ${leafletSizesError.message}` : 'No leaflet sizes available.'}
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose leaflet size" />
                  </SelectTrigger>
                  <SelectContent>
                    {leafletSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{(size as any).name || 'Unknown'}</span>
                          <span className="ml-4 text-muted-foreground">
                            {(size as any).dimensions || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            ) : (
              // Regular ad sizes
              isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading ad sizes...
                </div>
              ) : adSizes.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No ad sizes available. Please check the admin configuration.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose advertisement size" />
                  </SelectTrigger>
                  <SelectContent>
                    {adSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{size.name}</span>
                          <span className="ml-4 text-muted-foreground">
                            {size.dimensions} - £{(size as any).base_price || 0}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Campaign Duration</h3>
            
            {(() => {
              const relevantDurations = pricingModel === 'leafleting' ? leafletDurations :
                (pricingModel === 'subscription') ? subscriptionDurations : durations;
              const isLoadingDurations = pricingModel === 'leafleting' ? leafletDurationsLoading : isLoading;
              const durationsError = pricingModel === 'leafleting' ? leafletDurationsError : null;

              if (isLoadingDurations) {
                return (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading campaign durations...
                  </div>
                );
              }

              if (durationsError || !relevantDurations || relevantDurations.length === 0) {
                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {durationsError ? `Failed to load durations: ${durationsError.message}` : 'No campaign durations available.'}
                    </AlertDescription>
                  </Alert>
                );
              }

              return (
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose campaign duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantDurations.map((duration) => (
                      <SelectItem key={duration.id} value={duration.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{duration.name}</span>
                          <span className="ml-4 text-muted-foreground">
                            {pricingModel === 'leafleting' 
                              ? `${(duration as any).months || 1} month${((duration as any).months || 1) > 1 ? 's' : ''}`
                              : duration.description
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
          </div>

          {/* Pricing Summary */}
          {pricingBreakdown && (
            <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Pricing Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(pricingBreakdown.subtotal)}</span>
                </div>
                
                {pricingBreakdown.volumeDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                    <span>-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                  </div>
                )}
                
                {(pricingBreakdown as any).durationDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Duration Discount:</span>
                    <span>-{formatPrice((pricingBreakdown as any).durationDiscount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Total Circulation: {pricingBreakdown.totalCirculation.toLocaleString()} homes
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4" data-contact-section>
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter your company name"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="password">Create Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 6 characters"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This password will be used to access your dashboard and saved quotes.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleGetQuote}
              className="px-8"
              disabled={submitting || !formData.name || !formData.email || effectiveSelectedAreas.length === 0 || !selectedAdSize || !selectedDuration}
            >
              {submitting ? "Sending..." : "Get My Quote"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Term Confirmation Dialog */}
      <Dialog open={showFixedTermConfirmation} onOpenChange={setShowFixedTermConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Are you sure you want to book Fixed Term?
            </DialogTitle>
            <DialogDescription className="text-center">
              If you booked this selection on our 3+ Repeat Package you would pay{" "}
              <span className="font-bold text-primary">
                £{pricingBreakdown?.finalTotal ? Math.round(pricingBreakdown.finalTotal * 0.85) : 144} + vat (£{pricingBreakdown?.finalTotal ? Math.round(pricingBreakdown.finalTotal * 0.85 * 1.2) : 172.80})
              </span>{" "}
              per month for minimum of six months INCLUDING
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-6">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>2 x EXTRA AREAS—FREE FOR 3 ISSUES—double the number of homes you reach!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>FREE EDITORIAL</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>FREE PREMIUM POSITION UPGRADE</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>FREE ADVERT DESIGN</span>
              </li>
            </ul>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleFixedTermContinue}
              className="px-8 py-2"
            >
              YES, CONTINUE
            </Button>
            <Button 
              onClick={handleSwitchToSubscription}
              variant="outline"
              className="px-6 py-2"
            >
              NO, GO BACK TO SELECT SUBSCRIPTION
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalculatorStepForm;
