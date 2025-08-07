import React, { useState, useMemo, useCallback, useEffect } from "react";
import Navigation from "@/components/Navigation";
import SpecialOfferForm from "@/components/SpecialOfferForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingData } from "@/hooks/usePricingData";
import { calculateAdvertisingPrice, formatPrice } from "@/lib/pricingCalculator";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const AdvertisingNew = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [pricingModel, setPricingModel] = useState<'fixed' | 'subscription' | 'bogof'>('fixed');
  const [prevPricingModel, setPrevPricingModel] = useState<string>('fixed');
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

  useEffect(() => {
    try {
      const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      
      // Only clear duration when pricing model actually changes
      if (pricingModel !== prevPricingModel && prevPricingModel !== null) {
        setSelectedDuration("");
        setPrevPricingModel(pricingModel);
        return;
      }
      
      // Auto-select if only one duration option and no duration currently selected
      if (relevantDurations?.length === 1 && !selectedDuration) {
        setSelectedDuration(relevantDurations[0].id);
      }
      
      // Validate current selection is still valid for the current model
      if (selectedDuration && relevantDurations?.length > 0) {
        const isValidSelection = relevantDurations.some(d => d.id === selectedDuration);
        if (!isValidSelection) {
          setSelectedDuration("");
        }
      }
      
      setPrevPricingModel(pricingModel);
    } catch (error) {
      console.error('Error in duration useEffect:', error);
    }
  }, [pricingModel, durations, subscriptionDurations]);

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

  const stats = [{
    number: "250+",
    label: "Current Advertisers",
    icon: Users
  }, {
    number: "20",
    label: "Estd 2005 - Celebrating 20 Years!",
    icon: Award
  }, {
    number: "158,000",
    label: "Bi-monthly Circulation",
    icon: Newspaper
  }, {
    number: "12",
    label: "Local Editions to Choose From",
    icon: MapPin
  }, {
    number: "72%",
    label: "Repeat Advertisers - It Works!",
    icon: Target
  }, {
    number: "500,000",
    label: "Leaflets Distributed Per Month",
    icon: Truck
  }];

  const localAreas = [{
    area: "AREA 1",
    title: "SOUTHAMPTON SUBURBS",
    postcodes: "SO15 SO16 SO17",
    description: "ABC1 homes in the more affluent residential suburban streets inc Chilworth, Upper Shirley, Rownhams, Basett and Highfield. Excluding student areas & flats",
    circulation: "13,500",
    leaflets: "YES"
  }, {
    area: "AREA 2",
    title: "CHANDLER'S FORD & NORTH BADDESLEY",
    postcodes: "SO53 SO52",
    description: "ABC1 homes in this affluent suburb between Southampton and Winchester plus North Baddesley",
    circulation: "13,500",
    leaflets: "YES"
  }, {
    area: "AREA 3",
    title: "EASTLEIGH & VILLAGES",
    postcodes: "SO50",
    description: "ABC1 homes in Fair Oak, Bishopstoke, Horton Heath, Allbrook, Boyatt Wood and selected streets of Eastleigh.",
    circulation: "10,500",
    leaflets: "YES"
  }, {
    area: "AREA 4",
    title: "HEDGE END & SURROUNDS",
    postcodes: "SO30",
    description: "ABC1 homes in east of Southampton: Hedge End, West End & Botley",
    circulation: "13,000",
    leaflets: "YES"
  }, {
    area: "AREA 5",
    title: "LOCKS HEATH & SURROUNDS",
    postcodes: "SO31",
    description: "ABC1 homes in south east of Southampton, west of Fareham: Locks Heath, Warsash, Swanwick, Bursledon, Hamble, Netley",
    circulation: "13,000",
    leaflets: "YES"
  }, {
    area: "AREA 6",
    title: "FAREHAM & SURROUNDS",
    postcodes: "PO13 PO14 PO15",
    description: "ABC1 homes in Fareham westside, Titchfield, Stubbington, Lee on Solent, Hill Head",
    circulation: "14,000",
    leaflets: "YES"
  }, {
    area: "AREA 7",
    title: "WICKHAM & BISHOP'S WALTHAM",
    postcodes: "SO32 PO17",
    description: "Meon Valley is an affluent rural area with two market towns; Wickham & Bishop's Waltham so it's delivered by Royal Mail. Every property in these postcodes recieves Discover.",
    circulation: "14,000",
    leaflets: "NO, SORRY"
  }, {
    area: "AREA 8",
    title: "WINCHESTER & VILLAGES",
    postcodes: "SO21 SO22 SO23",
    description: "Distribution is mixed with part Royal Mail (the affluent rural ring around Winchester) and part by Discover distribution in Winchester's ABC1 suburbs. Rural ring includes Otterbourne, Colden Common, Hursley, Crawley, South Wonston, Littleton, Sparsholt.",
    circulation: "13,500",
    leaflets: "YES"
  }, {
    area: "AREA 9",
    title: "ROMSEY & TEST VALLEY",
    postcodes: "SO51 SO20",
    description: "Test Valley includes the market towns of Romsey and Stockbridge including rural villages such as The Wellows, Braishfield, Ampfield, Kings Somborne. Every property in the rural postcodes receive Discover while 4,000 homes in Romsey are distributed by Discover.",
    circulation: "15,000",
    leaflets: "YES BUT ROMSEY ONLY"
  }, {
    area: "AREA 10",
    title: "WATERSIDE & TOTTON",
    postcodes: "SO40 SO45",
    description: "Locally referred to as Southampton's Waterside Discover is delivered to ABC1 homes in Totton, Marchwood, Hythe, Dibden, Dibden Purlieu, Holbury and Blackfield.",
    circulation: "14,000",
    leaflets: "YES"
  }, {
    area: "AREA 11",
    title: "NEW FOREST TO LYMINGTON",
    postcodes: "SO41 SO42 SO43 BH24 4",
    description: "The only magazine to reach so many homes in The New Forest directly delivered to by Royal Mail. Every property in these postcodes receive a copy.",
    circulation: "13,500",
    leaflets: "NO, SORRY"
  }];

  const magazineCovers = [{
    src: "/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png",
    alt: "Discover Magazine - Winchester & Surrounds Edition",
    title: "WINCHESTER & SURROUNDS"
  }, {
    src: "/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png",
    alt: "Discover Magazine - Itchen Valley Edition",
    title: "ITCHEN VALLEY"
  }, {
    src: "/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png",
    alt: "Discover Magazine - Meon Valley & Whiteley Edition",
    title: "MEON VALLEY & WHITELEY"
  }, {
    src: "/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png",
    alt: "Discover Magazine - New Forest & Waterside Edition",
    title: "NEW FOREST & WATERSIDE"
  }, {
    src: "/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png",
    alt: "Discover Magazine - Southampton West & Totton Edition",
    title: "SOUTHAMPTON WEST & TOTTON"
  }, {
    src: "/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png",
    alt: "Discover Magazine - Test Valley & Romsey Edition",
    title: "TEST VALLEY & ROMSEY"
  }, {
    src: "/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png",
    alt: "Discover Magazine - Winchester & Alresford Edition",
    title: "WINCHESTER & ALRESFORD"
  }, {
    src: "/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png",
    alt: "Discover Magazine - Chandler's Ford & Eastleigh Edition",
    title: "CHANDLER'S FORD & EASTLEIGH"
  }];

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-community-navy to-community-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
          backgroundImage: 'url(/lovable-uploads/08771cf3-89e3-4223-98db-747dce5d2283.png)'
        }} />
        <div className="absolute inset-0 bg-gradient-to-r from-community-navy/80 to-community-green/80" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            YOUR BUSINESS NEEDS TO BE SEEN
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We can't promise to find you a mate, but we will match you up with new customers!
          </p>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-3 inline-block">
            <span className="text-green-400 font-bold text-lg">✓ NEW WORKING CALCULATOR</span>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Get Your Instant Quote
            </h2>
            <p className="text-xl text-gray-600">
              Calculate your advertising costs with our interactive pricing calculator
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Advertising Cost Calculator</CardTitle>
              <CardDescription>
                Fill in your details and select your preferences to get an instant quote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                          const modelToCheck = pricingModel === 'bogof' ? 'subscription' : pricingModel;
                          return size.available_for.includes(modelToCheck);
                        })
                        .map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name} ({size.dimensions})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Duration Selection */}
              {pricingModel !== 'bogof' && (
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
                        {(pricingModel === 'subscription' ? subscriptionDurations : durations).map((duration) => (
                          <SelectItem key={duration.id} value={duration.id}>
                            {duration.name}
                            {duration.discount_percentage > 0 && (
                              <span className="text-green-600 ml-2">
                                ({duration.discount_percentage}% discount)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Fixed 6-month for BOGOF */}
              {pricingModel === 'bogof' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Campaign Duration</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        6 Months Fixed (Required for BOGOF)
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      BOGOF campaigns run for a fixed 6-month period to give you maximum value.
                    </p>
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              {pricingBreakdown && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Selected Areas:</span>
                        <span className="font-medium">{effectiveSelectedAreas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Circulation:</span>
                        <span className="font-medium">{pricingBreakdown.totalCirculation.toLocaleString()}</span>
                      </div>
                      {/* Show paid/free areas breakdown for subscription pricing */}
                      {pricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                        <div className="flex justify-between">
                          <span>Paid Areas:</span>
                          <span className="font-medium">{effectiveSelectedAreas.length}</span>
                        </div>
                      )}
                      {pricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                        <div className="flex justify-between">
                          <span>Free Areas:</span>
                          <span className="font-medium">{bogofFreeAreas.length}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Monthly Subtotal:</span>
                        <span className="font-medium">{formatPrice(pricingBreakdown.subtotal)}</span>
                      </div>
                      {pricingBreakdown.volumeDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                          <span className="font-medium">-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                        </div>
                      )}
                      {pricingBreakdown.durationMultiplier < 1 && (
                        <div className="flex justify-between text-green-600">
                          <span>Duration Discount:</span>
                          <span className="font-medium">-{formatPrice(pricingBreakdown.subtotal * (1 - pricingBreakdown.durationMultiplier))}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Price:</span>
                        <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Cost per 1,000 (CPM):</span>
                        <span>{formatPrice(pricingBreakdown.finalTotal / pricingBreakdown.totalCirculation * 1000)}</span>
                      </div>
                      
                     </div>

                    {pricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">BOGOF Bonus!</h4>
                        <p className="text-green-700 text-sm">
                          You'll get {bogofFreeAreas.length} additional areas FREE for the first 6 months, 
                          reaching an extra {areas.filter(a => bogofFreeAreas.includes(a.id)).reduce((sum, area) => sum + area.circulation, 0).toLocaleString()} homes!
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                className="w-full"
                size="lg"
                disabled={
                  !formData.name || 
                  !formData.email || 
                  !formData.phone || 
                  effectiveSelectedAreas.length === 0 || 
                  !selectedAdSize || 
                  (!selectedDuration && pricingModel !== 'bogof')
                }
              >
                Request Your Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <IconComponent className="h-12 w-12 text-community-green" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-community-navy mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Magazine Covers Carousel */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px] animate-pulse" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-community-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-community-navy/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-community-green rounded-full animate-pulse" />
              <span className="text-white font-medium">LIVE PUBLICATIONS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Discover Magazine Editions
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore our stunning collection of local editions covering all areas of South Hampshire
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <Carousel opts={{
              align: "center",
              loop: true
            }} className="w-full">
              <CarouselContent className="-ml-6">
                {magazineCovers.map((cover, index) => (
                  <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-community-green/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-community-green/20">
                      <CardContent className="p-6">
                        <div className="relative overflow-hidden rounded-lg">
                          <img src={cover.src} alt={cover.alt} className="w-full h-96 object-contain transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-white font-bold text-sm mb-2">{cover.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-community-green rounded-full" />
                              <span className="text-community-green text-xs font-medium">CURRENT EDITION</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 rounded-lg border border-community-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
            </Carousel>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-white/30 hover:bg-white px-8 py-3 font-bold rounded-full backdrop-blur transition-all duration-300 text-slate-950">
                EXPLORE ALL EDITIONS
              </Button>
              <Button variant="outline" className="border-white/30 hover:bg-white px-8 py-3 font-bold rounded-full backdrop-blur transition-all duration-300 text-slate-950">
                VIEW DISTRIBUTION MAP
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 bg-gradient-to-r from-community-green to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-white text-community-green px-6 py-2 rounded-full font-bold text-lg mb-6">
              🎉 LIMITED TIME OFFER
            </div>
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              £999 ALL AREAS PACKAGE
            </h2>
            <p className="text-2xl md:text-3xl mb-4 font-bold">
              Reach 158,000 Homes Across All 12 Areas
            </p>
            <p className="text-xl mb-8 opacity-90">
              Save over £500 with our exclusive package deal - Perfect for businesses ready to make a big impact!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">158,000</div>
                <div className="text-lg">Total Homes Reached</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">12</div>
                <div className="text-lg">Distribution Areas</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">6</div>
                <div className="text-lg">Magazine Editions</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <SpecialOfferForm>
              <Button size="lg" className="bg-white text-community-green hover:bg-gray-100 text-xl px-12 py-6 font-bold">
                CLAIM THIS OFFER - £999
              </Button>
            </SpecialOfferForm>
            <p className="mt-4 text-lg opacity-90">
              Includes professional design support & account management
            </p>
          </div>
        </div>
      </section>

      {/* Distribution Areas Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Distribution Areas & Coverage
            </h2>
            <p className="text-xl text-gray-600">
              Detailed breakdown of our 12 distribution areas across South Hampshire
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Area</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Postcodes</TableHead>
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="font-bold">Circulation</TableHead>
                  <TableHead className="font-bold">Leaflets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localAreas.map((area, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{area.area}</TableCell>
                    <TableCell className="font-medium">{area.title}</TableCell>
                    <TableCell>{area.postcodes}</TableCell>
                    <TableCell className="text-sm">{area.description}</TableCell>
                    <TableCell className="font-medium">{area.circulation}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        area.leaflets === "YES" 
                          ? "bg-green-100 text-green-800" 
                          : area.leaflets === "YES BUT ROMSEY ONLY"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {area.leaflets}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Ready to Advertise?
            </h2>
            <p className="text-xl text-gray-600">
              Get in touch with our advertising team to discuss your requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-community-green mx-auto mb-4" />
                <CardTitle className="text-community-navy">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-community-navy mb-2">023 8027 2922</p>
                <p className="text-gray-600">Monday - Friday, 9am - 5pm</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="h-12 w-12 text-community-green mx-auto mb-4" />
                <CardTitle className="text-community-navy">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-community-navy mb-2">advertising@discover-southampton.co.uk</p>
                <p className="text-gray-600">We'll respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-community-green mx-auto mb-4" />
                <CardTitle className="text-community-navy">Book Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="bg-community-green hover:bg-community-green/90 text-white px-6 py-2">
                  Schedule Meeting
                </Button>
                <p className="text-gray-600 mt-2">Free advertising consultation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvertisingNew;