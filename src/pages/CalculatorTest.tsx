import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingData } from "@/hooks/usePricingData";
import { calculateAdvertisingPrice, formatPrice } from "@/lib/pricingCalculator";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const CalculatorTest = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [pricingModel, setPricingModel] = useState<'fixed' | 'subscription' | 'bogof'>('fixed');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);
  const [selectedAdSize, setSelectedAdSize] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");

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

  // Debug logging
  console.log('Calculator Test - Data state:', {
    areas: areas?.length,
    adSizes: adSizes?.length,
    durations: durations?.length,
    subscriptionDurations: subscriptionDurations?.length,
    isLoading,
    isError,
    error: error?.message
  });

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setSelectedAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  }, []);

  const effectiveSelectedAreas = useMemo(() => {
    return pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;
  }, [pricingModel, selectedAreas, bogofPaidAreas]);

  const pricingBreakdown = useMemo(() => {
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }

    const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
    
    return calculateAdvertisingPrice(
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      pricingModel === 'subscription' || pricingModel === 'bogof',
      areas,
      adSizes,
      relevantDurations,
      subscriptionDurations,
      volumeDiscounts
    );
  }, [effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, bogofPaidAreas, selectedAreas]);

  // Clear duration when switching pricing models to force user selection
  React.useEffect(() => {
    setSelectedDuration("");
  }, [pricingModel]);

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact details.",
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

    toast({
      title: "Quote Request Sent!",
      description: "We'll contact you within 24 hours with your personalized quote.",
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cost Calculator Test</CardTitle>
              <CardDescription>
                Testing the cost calculator in a clean environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Debug Info */}
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Data Status: {isLoading ? 'Loading...' : `${areas.length} areas, ${adSizes.length} ad sizes, ${durations.length} durations loaded`}
                </AlertDescription>
              </Alert>

              {/* Contact Information */}
              <div className="space-y-4">
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
                </div>
              </div>

              {/* Payment Structure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Payment Structure</h3>
                <RadioGroup 
                  value={pricingModel} 
                  onValueChange={(value: 'fixed' | 'subscription' | 'bogof') => setPricingModel(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed No Contract Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subscription" id="subscription" />
                    <Label htmlFor="subscription">Subscription Advertising</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bogof" id="bogof" />
                    <Label htmlFor="bogof">BOGOF - Buy One Get One Free</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Distribution Areas */}
              {pricingModel !== 'bogof' && (
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
                        <div key={area.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={area.id}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                          />
                          <Label htmlFor={area.id} className="flex-1">
                            <div>
                              <div className="font-medium">{area.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Circulation: {area.circulation.toLocaleString()}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BOGOF Areas Selection */}
              {pricingModel === 'bogof' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Your "Paid For" Areas</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose at least 3 areas that you'll pay monthly subscription for. We'll match this with an equal number of free areas.
                    </p>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading areas...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {areas.map((area) => (
                          <div key={area.id} className="flex items-center space-x-2">
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
                            />
                            <Label htmlFor={`paid-${area.id}`} className="flex-1">
                              <div>
                                <div className="font-medium">{area.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Circulation: {area.circulation.toLocaleString()}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {bogofPaidAreas.length >= 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Select Your "Free" Areas</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose up to {bogofPaidAreas.length} areas that you'll get for FREE for the first 6 months.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {areas
                          .filter(area => !bogofPaidAreas.includes(area.id))
                          .map((area) => (
                            <div key={area.id} className="flex items-center space-x-2">
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
                              />
                              <Label htmlFor={`free-${area.id}`} className="flex-1">
                                <div>
                                  <div className="font-medium">{area.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Circulation: {area.circulation.toLocaleString()}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Ad Size Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Advertisement Size</h3>
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading ad sizes...
                  </div>
                ) : (
                  <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an advertisement size" />
                    </SelectTrigger>
                    <SelectContent>
                      {adSizes
                        .filter(size => {
                          // For BOGOF, treat it as subscription since it's essentially a subscription deal
                          const modelToCheck = pricingModel === 'bogof' ? 'subscription' : pricingModel;
                          return size.available_for.includes(modelToCheck);
                        })
                        .map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name} - {size.dimensions}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Duration Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Campaign Duration</h3>
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading durations...
                  </div>
                ) : (
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose campaign duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {(pricingModel === 'subscription' || pricingModel === 'bogof' ? subscriptionDurations : durations).map((duration) => (
                        <SelectItem key={duration.id} value={duration.id}>
                          {duration.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Pricing Summary */}
              {pricingBreakdown && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing Summary</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Selected Areas:</span>
                        <span>{effectiveSelectedAreas.length}</span>
                      </div>
                      {pricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                        <div className="flex justify-between">
                          <span>Free Areas:</span>
                          <span>{bogofFreeAreas.length}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(pricingBreakdown.subtotal)}</span>
                      </div>
                      {pricingBreakdown.volumeDiscountPercent > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                          <span>-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-bold">Total Price:</span>
                        <span className="font-bold text-lg">
                          {formatPrice(pricingBreakdown.finalTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Circulation:</span>
                        <span>{pricingBreakdown.totalCirculation.toLocaleString()}</span>
                      </div>
                      {pricingModel === 'bogof' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 BOGOF Special: You'll also get {bogofFreeAreas.length} free areas for 6 months!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                className="w-full"
                disabled={!formData.name || !formData.email || !formData.phone || effectiveSelectedAreas.length === 0 || !selectedAdSize || !selectedDuration}
              >
                Get Your Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTest;