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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePricingData } from "@/hooks/usePricingData";
import CostCalculatorOptimized from "@/components/CostCalculatorOptimized";
import LeafletingCalculator from "@/components/LeafletingCalculator";
import { calculateAdvertisingPrice, formatPrice } from "@/lib/pricingCalculator";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

interface SelectedIssues {
  [areaId: string]: string[]; // Array of month strings like "2024-01", "2024-02"
}

const AdvertisingNew = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
  });
  const [pricingModel, setPricingModel] = useState<'fixed' | 'subscription' | 'bogof' | 'leafleting'>('fixed');
  const [prevPricingModel, setPrevPricingModel] = useState<string>('fixed');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);
  const [selectedAdSize, setSelectedAdSize] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<SelectedIssues>({});
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

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setSelectedAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  }, []);

  const maybeOpenUpsell = useCallback(() => {
    if (pricingModel === 'fixed' && selectedAreas.length > 2 && !upsellDismissed) {
      setUpsellOpen(true);
    }
  }, [pricingModel, selectedAreas.length, upsellDismissed]);

  const handleUpsellNo = useCallback(() => {
    setUpsellOpen(false);
    setUpsellDismissed(true);
  }, []);

  const handleUpsellYes = useCallback(() => {
    setUpsellOpen(false);
    setUpsellDismissed(true);
    setPricingModel('bogof');
    setBogofPaidAreas(Array.from(new Set([...selectedAreas])));
    if (selectedAreas.length >= 3) {
      toast({ title: "Switched to BOGOF", description: "Great choice! Now pick your free areas." });
    } else {
      toast({ title: "Almost there", description: "Choose 1 more paid area to unlock your free areas." });
    }
  }, [selectedAreas, toast]);

  const effectiveSelectedAreas = useMemo(() => {
    return pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;
  }, [pricingModel, selectedAreas, bogofPaidAreas]);

  const pricingBreakdown = useMemo(() => {
    // Handle leafleting service pricing
    if (pricingModel === 'leafleting') {
      if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
        return null;
      }

      // Get duration multiplier from the selected duration
      const selectedDurationData = durations.find(d => d.id === selectedDuration);
      const durationMultiplier = selectedDurationData?.duration_value || 1;
      
      // For leafleting, we use a simplified calculation here
      return null; // Will be handled by LeafletingCalculator component
    }

    // Handle regular advertising pricing
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
    try {
      const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      
      // Only clear duration when pricing model actually changes (not on initial load or data updates)
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

  // Monitor when user reaches Contact Information section for Fixed Term confirmation
  useEffect(() => {
    const contactSection = document.querySelector('[data-contact-section]');
    if (!contactSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !contactSectionReached) {
            setContactSectionReached(true);
            
            // Show confirmation dialog for Fixed Term users only when pricing is calculated
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
      const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      const durationData = relevantDurations.find(d => d.id === selectedDuration);
      const durationDiscountPercent = durationData?.discount_percentage || 0;
      const subtotalAfterVolume = pricingBreakdown?.subtotal ? pricingBreakdown.subtotal - (pricingBreakdown.volumeDiscount || 0) : 0;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

      // Get current user for request association
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
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : [],
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : [],
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
        user_id: user?.id || null  // Associate with user if authenticated
      };

      const { error } = await supabase.from('quote_requests').insert(payload);
      if (error) throw error;
      
      toast({
        title: "Quote Request Sent!",
        description: "Our sales team will contact you within 24 hours to discuss your advertising needs.",
      });
    } catch (err: any) {
      console.error('Submit quote error:', err);
      toast({ title: "Error", description: err.message || 'Failed to submit quote request.', variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Fixed Term confirmation dialog actions
  const handleFixedTermContinue = () => {
    setShowFixedTermConfirmation(false);
    toast({ 
      title: "Fixed Term Confirmed", 
      description: "You can continue with your Fixed Term booking." 
    });
  };

  const handleSwitchToSubscription = () => {
    setShowFixedTermConfirmation(false);
    setPricingModel('subscription');
    setSelectedDuration("");
    toast({ 
      title: "Switched to Subscription", 
      description: "You're now using our subscription pricing model." 
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
    description: "ABC1 homes in this popular residential area between Southampton and Portsmouth including Hedge End, Botley and Boorley Green.",
    circulation: "9,400",
    leaflets: "YES"
  }, {
    area: "AREA 5",
    title: "LOCKS HEATH & TITCHFIELD",
    postcodes: "SO31 PO15",
    description: "ABC1 homes in this affluent area of Fareham including Locks Heath, Titchfield, Warsash and Park Gate.",
    circulation: "12,000",
    leaflets: "YES"
  }, {
    area: "AREA 6",
    title: "FAREHAM & VILLAGES",
    postcodes: "PO12 PO13 PO14 PO16",
    description: "ABC1 homes in Fareham town plus the villages of Wickham, Knowle, Soberton and surrounding areas.",
    circulation: "12,100",
    leaflets: "YES"
  }, {
    area: "AREA 8",
    title: "WINCHESTER",
    postcodes: "SO21 SO22 SO23",
    description: "ABC1 homes in Winchester city and suburbs including Kings Worthy, Headbourne Worthy, Littleton and Sparsholt.",
    circulation: "8,000",
    leaflets: "YES"
  }, {
    area: "AREA 9",
    title: "ROMSEY & NORTH BADDESLEY",
    postcodes: "SO51 SO52",
    description: "ABC1 homes in Romsey town and surrounding villages plus North Baddesley residential areas.",
    circulation: "8,600",
    leaflets: "YES"
  }, {
    area: "AREA 10",
    title: "TOTTON",
    postcodes: "SO40 SO45",
    description: "ABC1 homes in Totton and surrounding New Forest areas including Ashurst, Lyndhurst and Cadnam.",
    circulation: "11,000",
    leaflets: "YES"
  }, {
    area: "AREA 11",
    title: "NEW FOREST & WATERSIDE",
    postcodes: "SO40",
    description: "ABC1 homes in the New Forest including Hythe, Dibden, Marchwood and Fawley industrial areas.",
    circulation: "7,000",
    leaflets: "YES"
  }, {
    area: "AREA 12",
    title: "SHOLING & ITCHEN",
    postcodes: "SO19",
    description: "ABC1 homes in the eastern areas of Southampton including Sholing, Itchen, Woolston and Peartree.",
    circulation: "7,000",
    leaflets: "YES"
  }, {
    area: "AREA 13",
    title: "SOUTHAMPTON EAST",
    postcodes: "SO31",
    description: "ABC1 homes in eastern Southampton including Bitterne, West End and surrounding residential areas.",
    circulation: "9,200",
    leaflets: "YES"
  }];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-heading font-bold text-primary mb-6">
              South Hampshire Advertising
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Reach up to 158,000 homes across Southampton, Winchester, Eastleigh, and Fareham with our proven local advertising solutions.
            </p>
            
            {/* Quick Calculator Access */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <CostCalculatorOptimized>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Target className="mr-2 h-5 w-5" />
                  Get Advertising Quote
                </Button>
              </CostCalculatorOptimized>
              
              <LeafletingCalculator>
                <Button size="lg" variant="outline">
                  <Truck className="mr-2 h-5 w-5" />
                  Leafleting Service Quote
                </Button>
              </LeafletingCalculator>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center p-4">
                  <CardContent className="p-0">
                    <IconComponent className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-2xl font-bold text-primary mb-1">{stat.number}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      {pricingBreakdown && (
        <section className="py-8 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Your Advertising Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{effectiveSelectedAreas.length}</div>
                    <div className="text-sm text-muted-foreground">Areas Selected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{pricingBreakdown.totalCirculation.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Circulation</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{formatPrice((pricingBreakdown.finalTotal / pricingBreakdown.totalCirculation) * 1000)}</div>
                    <div className="text-sm text-muted-foreground">Cost Per 1000 (CPM)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatPrice(pricingBreakdown.finalTotal)}</div>
                    <div className="text-sm text-muted-foreground">Total Price</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Magazine Covers Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Latest Magazine Editions
            </h2>
            <p className="text-xl text-muted-foreground">
              See our recent publications and successful advertiser features
            </p>
          </div>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {[
                { src: "/lovable-uploads/9f1d05c6-6723-48d2-9b24-3aee6cb957bd.png", alt: "Discover Magazine Cover" },
                { src: "/lovable-uploads/99da34dd-ee6c-44a1-b95c-6edbc8085cd4.png", alt: "Local Business Features" },
                { src: "/lovable-uploads/9ba0441a-d421-4a65-8738-115023b9fc55.png", alt: "Community Stories" }
              ].map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-[3/4] items-center justify-center p-0">
                        <img 
                          src={image.src} 
                          alt={image.alt}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpecialOfferForm>
            <Button>Special Offers Available</Button>
          </SpecialOfferForm>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              ADVERTISING ENQUIRY FORM
            </h2>
            <p className="text-xl text-muted-foreground">
              South Hampshire Advertising Services: reach up to 158,000 homes in SO & PO Postcodes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Display Advertising</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/3457943e-ae98-43c0-b6cb-556d1d936472.png" 
                  alt="Display Advertising - Professional business advertisement layouts" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-48 object-cover"
                />
                <p className="text-muted-foreground">Professional advertising space in our established local magazines</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Leaflet Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/34ecfbb2-fff7-4b7e-a22f-14509fe08bf3.png" 
                  alt="Leaflet Distribution - Direct mail and flyer delivery service" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-48 object-cover"
                />
                <p className="text-muted-foreground">Door-to-door leaflet delivery across targeted residential areas</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Digital Services</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/3bf54723-bde1-45e5-ba7d-fa1c6a9a1a1a.png" 
                  alt="Digital Services - Online marketing and web solutions" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-48 object-cover"
                />
                <p className="text-muted-foreground">Complete digital marketing solutions to complement your print advertising</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketing Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Marketing Services: Traditional & Digital
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Eye-Catching Design</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/9019f654-8637-4147-80ed-9ea16f9b7361.png" 
                  alt="Eye-Catching Design - Colorful artistic eye makeup" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-muted-foreground">Ask about free artwork services for series bookings and anything else you need!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Logos & Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/057f04d1-71d6-4a38-8318-51bcd9dff466.png" 
                  alt="Logos & Branding - ARTBOX Digital Design logo" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-muted-foreground">Whether a new design or a refresh and update we offer low cost portfolios</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">QR Codes & Geo Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/50abedfe-ca8b-4655-9286-1c33ae15e786.png" 
                  alt="QR Codes & Geo Numbers - QR code example" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-muted-foreground">Quantify your advertising responses with trackable QR codes and local phone numbers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Lead Generation Specialists</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/06688917-138a-40f5-b46d-527ed07e7f8b.png" 
                  alt="Lead Generation Specialists - Wise owl representing expertise" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-muted-foreground">We can talk about more than print advertising to market your business</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Marketing Support</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/0856841b-a768-43dd-b06b-edc0c2255265.png" 
                  alt="Marketing Support - Media Buddy logo" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-muted-foreground">Every Discover advertisers deserves - and gets - their own Media Buddy.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Social Media Promotion</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="/lovable-uploads/1950c3ad-577b-4c76-9ca1-aad2fc4bdb7a.png" 
                  alt="Social Media Promotion - Friendly dog representing social engagement" 
                  className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md h-64 object-cover"
                />
                <p className="text-muted-foreground">We can "twitter-woo" for you, too! (doesn't sound as good with X)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Distribution Areas Table */}
      <section className="py-16 bg-gray-50" id="areas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Essential Facts & Figures
            </h2>
            <p className="text-xl text-muted-foreground">
              Detailed coverage information for all distribution areas
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {localAreas.map((area, index) => (
                <AccordionItem key={area.area} value={`item-${index}`} className="bg-white rounded-lg border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center font-bold mr-4 text-xs">
                          {area.area}
                        </div>
                        <div className="text-left">
                          <div className="font-heading font-bold text-lg">{area.title}</div>
                          <div className="text-sm text-muted-foreground">{area.postcodes}</div>
                          <div className="text-sm text-primary font-bold">Circulation: {area.circulation}</div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-heading font-bold text-primary mb-2">Coverage Details</h4>
                          <p className="text-muted-foreground">{area.description}</p>
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-primary mb-2">Leaflet Distribution</h4>
                          <p className={`font-bold ${area.leaflets === 'YES' ? 'text-green-600' : 'text-red-500'}`}>
                            {area.leaflets}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <CostCalculatorOptimized>
                          <Button className="w-full">
                            REQUEST A QUOTE
                          </Button>
                        </CostCalculatorOptimized>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              WANT TO GET STARTED?
            </h2>
            <p className="text-xl text-muted-foreground">
              From Quote to Artwork - We'll Help you All the Way!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <CardTitle className="text-primary">Identifying What's Right for You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you are new to advertising or need a fresh pair of eyes to improve what you are getting from your current advertising, our sales team are focused on what's right for your business; starting with the size of advert, the style, the design to which areas to choose.
                </p>
                <p className="text-muted-foreground mt-4 font-bold">
                  If Discover isn't right for you, we'll tell you – honest!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <CardTitle className="text-primary">Self Select quotations - You choose</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You'll receive an instant verbal quotation followed by 3 priced options. PLUS a link to our unique self service online cost calculator so you can play with the combination of advert size, areas and type of booking.
                </p>
                <p className="text-muted-foreground mt-4 font-bold">
                  We believe in the power of informed choice with no hidden costs or surprises!
                </p>
                <p className="text-primary font-bold mt-2">Payment plans available</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <CardTitle className="text-primary">Free In-house Design - At your service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Many of customers rely on us to create eye catching adverts for them from scratch or adapting what they have. Our editorial department is on hand to write a complimentary article if you book a series.
                </p>
                <p className="text-muted-foreground mt-4 font-bold">
                  You'll be allocated an account manager to look after you throughout your journey with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
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
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Phone className="mr-2 h-5 w-5" />
              023 80 266388
            </Button>
            <CostCalculatorOptimized>
              <Button size="lg" variant="outline" className="border-white hover:bg-white hover:text-primary text-white">
                Advertising Enquiry Form
              </Button>
            </CostCalculatorOptimized>
          </div>
          
          <p className="mt-6 text-lg">
            Go On ... Love your Business ... Help it Grow & Prosper Today!
          </p>
        </div>
      </section>
    </div>
  );
};

export default AdvertisingNew;