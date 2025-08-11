import { useEffect } from "react";
import Navigation from "@/components/Navigation";
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
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingData } from "@/hooks/usePricingData";
import { calculateAdvertisingPrice, formatPrice } from "@/lib/pricingCalculator";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import SpecialOfferForm from "@/components/SpecialOfferForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail } from "lucide-react";

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

  
  React.useEffect(() => {
    console.log('Duration useEffect triggered:', {
      pricingModel,
      prevPricingModel,
      durationsLength: durations?.length,
      subscriptionDurationsLength: subscriptionDurations?.length,
      currentSelectedDuration: selectedDuration
    });

    try {
      const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      
      console.log('Relevant durations for', pricingModel, ':', relevantDurations);
      
      // Only clear duration when pricing model actually changes (not on initial load or data updates)
      if (pricingModel !== prevPricingModel && prevPricingModel !== null) {
        console.log('Pricing model changed from', prevPricingModel, 'to', pricingModel, '- clearing duration');
        setSelectedDuration("");
        setPrevPricingModel(pricingModel);
        return;
      }
      
      // Auto-select if only one duration option and no duration currently selected
      if (relevantDurations?.length === 1 && !selectedDuration) {
        console.log('Auto-selecting single duration:', relevantDurations[0]);
        setSelectedDuration(relevantDurations[0].id);
      }
      
      // Validate current selection is still valid for the current model
      if (selectedDuration && relevantDurations?.length > 0) {
        const isValidSelection = relevantDurations.some(d => d.id === selectedDuration);
        if (!isValidSelection) {
          console.log('Current duration selection invalid for', pricingModel, '- clearing');
          setSelectedDuration("");
        }
      }
      
      // Update previous model reference
      setPrevPricingModel(pricingModel);
    } catch (error) {
      console.error('Error in duration useEffect:', error);
    }
  }, [pricingModel, durations, subscriptionDurations]);

  // Handle scrolling to hash on page load (must be before any conditional returns)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

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

  // Stats and data from the original Advertising page
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


  return <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-community-navy to-community-green text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
        backgroundImage: 'url(/lovable-uploads/08771cf3-89e3-4223-98db-747dce5d2283.png)'
      }} />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-community-navy/80 to-community-green/80" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            YOUR BUSINESS NEEDS TO BE SEEN
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We can't promise to find you a mate, but we will match you up with new customers!
          </p>
          <Button 
            size="lg" 
            className="bg-white text-community-navy hover:bg-gray-100 px-8 py-3 font-bold"
            onClick={() => {
              const calculatorElement = document.getElementById('calculator');
              if (calculatorElement) {
                calculatorElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            GET INSTANT QUOTE
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <IconComponent className="h-12 w-12 text-community-green" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-community-navy mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                </div>;
          })}
          </div>
        </div>
      </section>

      {/* Magazine Covers Carousel */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Futuristic Background Effects */}
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
                {magazineCovers.map((cover, index) => <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-community-green/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-community-green/20">
                      <CardContent className="p-6">
                        <div className="relative overflow-hidden rounded-lg">
                          <img src={cover.src} alt={cover.alt} className="w-full h-96 object-contain transition-transform duration-700 group-hover:scale-110" />
                          {/* Futuristic Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-white font-bold text-sm mb-2">{cover.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-community-green rounded-full" />
                              <span className="text-community-green text-xs font-medium">CURRENT EDITION</span>
                            </div>
                          </div>
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-lg border border-community-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </CardContent>
                    </Card>
                  </CarouselItem>)}
              </CarouselContent>
              
              {/* Custom Navigation Buttons */}
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
            </Carousel>
          </div>

          {/* Call to Action */}
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

      {/* Calculator Section - Keep the working calculator from Calculator Test */}
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

              {/* Payment Structure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Payment Structure</h3>
                <RadioGroup 
                  value={pricingModel} 
                  onValueChange={(value: 'fixed' | 'subscription' | 'bogof') => setPricingModel(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="flex items-center gap-2">
                      Fixed No Contract Price
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Pay per individual edition with no long-term commitment. Choose exactly which issues you want your advert to appear in. Perfect for one-off campaigns or testing specific markets.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bogof" id="bogof" />
                    <Label htmlFor="bogof" className="flex items-center gap-2">
                      BOGOF - Buy One Get One Free
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Special promotional offer! Book advertising in one area and receive advertising in a second area completely free. Great value for expanding your reach across multiple locations.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
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
                  <Select 
                    value={selectedDuration} 
                    onValueChange={(value) => {
                      console.log('Duration selected:', value, 'for pricing model:', pricingModel);
                      setSelectedDuration(value);
                    }}
                    key={`duration-select-${pricingModel}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose campaign duration" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {(pricingModel === 'subscription' || pricingModel === 'bogof' ? subscriptionDurations : durations).map((duration) => (
                        <SelectItem key={`${pricingModel}-${duration.id}`} value={duration.id}>
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
                         <span>Monthly Subtotal:</span>
                         <span>{formatPrice(pricingBreakdown.subtotal)}</span>
                       </div>
                       {pricingBreakdown.volumeDiscountPercent > 0 && (
                         <div className="flex justify-between text-green-600">
                           <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                           <span>-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                         </div>
                       )}
                       {(() => {
                         const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
                         const selectedDurationData = relevantDurations.find(d => d.id === selectedDuration);
                         const durationDiscountPercent = selectedDurationData?.discount_percentage || 0;
                         const subtotalAfterVolume = pricingBreakdown.subtotal - pricingBreakdown.volumeDiscount;
                         const durationDiscountAmount = subtotalAfterVolume * (durationDiscountPercent / 100);
                         
                         return durationDiscountPercent > 0 && (
                           <div className="flex justify-between text-green-600">
                             <span>Campaign Discount ({durationDiscountPercent}%):</span>
                             <span>-{formatPrice(durationDiscountAmount)}</span>
                           </div>
                         );
                       })()}
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
                       
                       {/* Areas Breakdown */}
                       <div className="mt-4 space-y-3">
                         <div>
                           <h4 className="font-medium text-sm mb-2">Areas You're Paying For:</h4>
                           <div className="space-y-1">
                             {areas
                               .filter(area => effectiveSelectedAreas.includes(area.id))
                               .map(area => (
                                 <div key={area.id} className="flex justify-between text-sm bg-blue-50 px-2 py-1 rounded">
                                   <span>{area.name}</span>
                                   <span>{area.circulation.toLocaleString()} circulation</span>
                                 </div>
                               ))}
                           </div>
                         </div>
                         
                         {pricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                           <div>
                             <h4 className="font-medium text-sm mb-2 text-green-700">Areas You Get FREE:</h4>
                             <div className="space-y-1">
                               {areas
                                 .filter(area => bogofFreeAreas.includes(area.id))
                                 .map(area => (
                                   <div key={area.id} className="flex justify-between text-sm bg-green-50 px-2 py-1 rounded">
                                     <span>{area.name}</span>
                                     <span>{area.circulation.toLocaleString()} circulation</span>
                                   </div>
                                 ))}
                             </div>
                           </div>
                         )}
                       </div>
                       {pricingModel === 'bogof' && bogofFreeAreas.length > 0 && (
                         <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                           <p className="text-sm text-green-800 font-medium">
                             🎉 BOGOF Special: You'll also get {bogofFreeAreas.length} free areas {(() => {
                               const relevantDurations = subscriptionDurations;
                               const selectedDurationData = relevantDurations.find(d => d.id === selectedDuration);
                               const durationValue = selectedDurationData?.duration_value || 6;
                               return `for ${durationValue} months`;
                             })()} at no extra cost!
                           </p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}

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
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              ADVERTISING ENQUIRY FORM
            </h2>
            <p className="text-xl text-gray-600">
              South Hampshire Advertising Services: reach up to 158,000 homes in SO & PO Postcodes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Display Advertising</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/34ecfbb2-fff7-4b7e-a22f-14509fe08bf3.png" 
                  alt="Discover Magazine Cover Example" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">We offer 11 ad sizes to more easily match with your budget and campaign needs.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Premium Position Advertising</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/9f1d05c6-6723-48d2-9b24-3aee6cb957bd.png" 
                  alt="Premium Position Advertising Example" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md"
                />
                <p className="text-gray-600">Pay a little extra for pages 2,3,5 or back cover ... Stand out from the Crowd!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Small Budget Options</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/9ba0441a-d421-4a65-8738-115023b9fc55.png" 
                  alt="Think Big Shop Small - Small Budget Options" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md"
                />
                <p className="text-gray-600">Low cost sizes, special packages and generous discounts for selected businesses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaflet Distribution */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              The Best Leaflet Management Service in South Hampshire
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Target Up to 108,000 Homes</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/fe26219a-b740-4f8f-8a86-f3611b4b16dc.png" 
                  alt="Target Up to 108,000 Homes - Footprints tracking" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">100% Tracked, Monitored & Recorded</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Cost Saving Options</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/8302477f-4fa2-42dd-8d1d-a479d5e981db.png" 
                  alt="Cost Saving Options - Tree representing growth and savings" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">Plus Leaflet Sharing Save on Print and 50% off Delivery!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Royal Mail Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/163918e9-487a-48cd-a7c4-61b988ecb9ea.png" 
                  alt="Royal Mail Partners - Official Royal Mail logo" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">Piggyback on our Royal Mail Contracts - Save Hassle & £££</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketing Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Marketing Services: Traditional & Digital
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Eye-Catching Design</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/9019f654-8637-4147-80ed-9ea16f9b7361.png" 
                  alt="Eye-Catching Design - Colorful artistic eye makeup" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">Ask about free artwork services for series bookings and anything else you need!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Logos & Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/057f04d1-71d6-4a38-8318-51bcd9dff466.png" 
                  alt="Logos & Branding - ARTBOX Digital Design logo" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">Whether a new design or a refresh and update we offer low cost portfolios</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">QR Codes & Geo Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/50abedfe-ca8b-4655-9286-1c33ae15e786.png" 
                  alt="QR Codes & Geo Numbers - QR code example" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">Quantify your advertising responses with trackable QR codes and local phone numbers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Lead Generation Specialists</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/06688917-138a-40f5-b46d-527ed07e7f8b.png" 
                  alt="Lead Generation Specialists - Wise owl representing expertise" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">We can talk about more than print advertising to market your business</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Marketing Support</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/0856841b-a768-43dd-b06b-edc0c2255265.png" 
                  alt="Marketing Support - Media Buddy logo" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">Every Discover advertisers deserves - and gets - their own Media Buddy.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Social Media Promotion</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/1950c3ad-577b-4c76-9ca1-aad2fc4bdb7a.png" 
                  alt="Social Media Promotion - Friendly dog representing social engagement" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-gray-600">We can "twitter-woo" for you, too! (doesn't sound as good with X)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Essential Facts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Essential Facts & Figures
            </h2>
            <h3 className="text-2xl font-heading font-bold text-community-green mb-4">
              RESULTS DRIVEN, DISPLAY ADVERTISING
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Discover is the region's most established and widespread local publication available to businesses wanting to generate brand awareness, lead generation and website traffic from affluent homeowners in South Hampshire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Facts List */}
            <Card className="h-fit">
              <CardContent className="p-8">
                <ul className="space-y-3 text-gray-700">
                  <li>• A5 (148mm x 210mm) full colour, self cover</li>
                  <li>• Frequency per edition is 6 times a year (bi-monthly)</li>
                  <li>• 12 different publications; target your advertising</li>
                  <li>• Each edition is tailored with local stories & What's On</li>
                  <li>• Average circulation per edition is 13,500 homes</li>
                  <li>• Book 12 editions for 158,000 circulation</li>
                  <li>• Distribution is GPS tracked, monitored and recorded</li>
                  <li>• 50,000 rural homes only get Discover, no other publication</li>
                  <li>• Available for pick up at selected supermarkets</li>
                </ul>
              </CardContent>
            </Card>

            {/* Map Section */}
            <div id="distribution-map" className="text-center">
              <img src="/lovable-uploads/a0704f2b-f884-4e36-a186-dab5336a19a5.png" alt="Distribution Areas Map - 12 Areas across South Hampshire including Winchester, Southampton, Fareham, New Forest and surrounding areas" className="w-full max-w-md mx-auto rounded-lg shadow-lg" />
              <p className="text-sm text-gray-600 mt-4 font-medium">
                12 Distribution Areas across South Hampshire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              12 Areas to Target - Trial Areas - Add More Later - Tailored Campaigns - Mix Adverts with Leaflets!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Our 158,000 circulation is divided into 12 Areas - each with a circulation of up to 14,000** homes
            </p>
            <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 mb-4">
                Get an <span className="font-bold text-community-green">instant quote</span> for any combination of areas using our cost calculator
              </p>
              <Button 
                className="bg-community-green hover:bg-green-600 text-white px-8 py-3 font-bold rounded-lg"
                onClick={() => {
                  const calculatorElement = document.getElementById('calculator');
                  if (calculatorElement) {
                    calculatorElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                GET INSTANT QUOTE
              </Button>
            </div>
          </div>

          {/* Special SO19 Section */}
          <Card className="mb-8 border-community-green border-2">
            <CardHeader className="bg-community-green text-white">
              <CardTitle className="text-2xl">!! NEW !! LAUNCH AUG '25</CardTitle>
              <CardDescription className="text-green-100">
                After repeated requests from our current advertisers and local business in SO19, Discover will started delivering in June 2025.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-community-navy mb-2">SO19 - 8,000 CIRCULATION</h3>
                  <p className="text-gray-600">
                    Letterbox (7,100) delivered to selected areas of SO19; primarily 3+ bedroom properties, with a driveway and attached garage. Flats and rental areas excluded. Available at Tesco, Sainsbury & Co-op in SO19
                  </p>
                </div>
                <div className="text-center">
                  <Button 
                    className="bg-community-green hover:bg-green-600"
                    onClick={() => {
                      const calculatorElement = document.getElementById('calculator');
                      if (calculatorElement) {
                        calculatorElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    COST CALCULATOR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-6xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {localAreas.map((area, index) => <AccordionItem key={area.area} value={`item-${index}`} className="bg-white rounded-lg border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="bg-community-green text-white rounded-full w-16 h-16 flex items-center justify-center font-bold mr-4 text-xs">
                          {area.area}
                        </div>
                        <div className="text-left">
                          <div className="font-heading font-bold text-lg">{area.title}</div>
                          <div className="text-sm text-gray-600">{area.postcodes}</div>
                          <div className="text-sm text-community-green font-bold">Circulation: {area.circulation}</div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-heading font-bold text-community-navy mb-2">Coverage Details</h4>
                          <p className="text-gray-600">{area.description}</p>
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-community-navy mb-2">Leaflet Distribution</h4>
                          <p className={`font-bold ${area.leaflets === 'YES' ? 'text-community-green' : 'text-red-500'}`}>
                            {area.leaflets}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Button className="w-full">
                          REQUEST A QUOTE
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              WANT TO GET STARTED?
            </h2>
            <p className="text-xl text-gray-600">
              From Quote to Artwork - We'll Help you All the Way!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <CardTitle className="text-community-navy">Identifying What's Right for You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  If you are new to advertising or need a fresh pair of eyes to improve what you are getting from your current advertising, our sales team are focused on what's right for your business; starting with the size of advert, the style, the design to which areas to choose.
                </p>
                <p className="text-gray-600 mt-4 font-bold">
                  If Discover isn't right for you, we'll tell you – honest!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <CardTitle className="text-community-navy">Self Select quotations - You choose</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll receive an instant verbal quotation followed by 3 priced options. PLUS a link to our unique self service online cost calculator so you can play with the combination of advert size, areas and type of booking.
                </p>
                <p className="text-gray-600 mt-4 font-bold">
                  We believe in the power of informed choice with no hidden costs or surprises!
                </p>
                <p className="text-community-green font-bold mt-2">Payment plans available</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <CardTitle className="text-community-navy">Free In-house Design - At your service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Many of customers rely on us to create eye catching adverts for them from scratch or adapting what they have. Our editorial department is on hand to write a complimentary article if you book a series.
                </p>
                <p className="text-gray-600 mt-4 font-bold">
                  You'll be allocated an account manager to look after you throughout your journey with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-community-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Sales Lead Generation with Direct Marketing
            </h2>
            <div className="space-y-4 text-lg">
              <p><strong>Sales Leads.</strong></p>
              <p><strong>Web Traffic.</strong></p>
              <p><strong>Brand Awareness.</strong></p>
            </div>
            <p className="text-xl mt-6">
              Helping businesses launch, grow and succeed since 2005. South Hampshire's most respected local magazine publisher.
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Talk to the Local Magazine Experts
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-community-green hover:bg-community-green/90">
              <Phone className="mr-2 h-5 w-5" />
              023 80 266388
            </Button>
            <Button size="lg" variant="outline" className="border-white hover:bg-white hover:text-community-navy text-slate-950">
              Advertising Enquiry Form
            </Button>
          </div>
          
          <p className="mt-6 text-lg">
            Go On ... Love your Business ... Help it Grow & Prosper Today!
          </p>
        </div>
      </section>
    </div>;
};

export default CalculatorTest;