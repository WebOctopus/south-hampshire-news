import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle2, Info, HelpCircle } from "lucide-react";
import editionsMap from "@/assets/14-editions-map-2025.jpg";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePricingData } from "@/hooks/usePricingData";
import { calculateAdvertisingPrice, formatPrice } from "@/lib/pricingCalculator";
import { calculateLeafletingPrice } from "@/lib/leafletingCalculator";
import { useLeafletAreas, useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { ErrorBoundary } from "@/components/ui/error-boundary";
import SpecialOfferForm from "@/components/SpecialOfferForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail } from "lucide-react";
import AdvertisingAlerts from "@/components/AdvertisingAlerts";
import { supabase } from "@/integrations/supabase/client";
import AdvertisingStepForm from "@/components/AdvertisingStepForm";
import { useAgencyDiscount } from "@/hooks/useAgencyDiscount";

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

const CalculatorTest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    refetch
  } = usePricingData();

  // Use leafleting data hooks
  const { data: leafletAreas, isLoading: leafletAreasLoading, error: leafletAreasError } = useLeafletAreas();
  const { data: leafletDurations, isLoading: leafletDurationsLoading, error: leafletDurationsError } = useLeafletCampaignDurations();

  // Use agency discount hook
  const { data: agencyData } = useAgencyDiscount();
  const agencyDiscountPercent = agencyData?.agencyDiscountPercent || 0;

  // Debug logging - remove in production

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

      // Get duration multiplier from the selected leaflet duration
      const selectedLeafletDurationData = leafletDurations?.find(d => d.id === selectedDuration);
      const durationMultiplier = selectedLeafletDurationData?.months || 1;
      
      return calculateLeafletingPrice(
        effectiveSelectedAreas,
        leafletAreas || [],
        durationMultiplier
      );
    }

    // Handle regular advertising pricing
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }

    const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
    
    const result = calculateAdvertisingPrice(
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      pricingModel === 'subscription' || pricingModel === 'bogof',
      areas,
      adSizes,
      relevantDurations,
      subscriptionDurations,
      volumeDiscounts,
      pricingModel === 'bogof' ? bogofFreeAreas : [], // Include free areas for circulation
      agencyDiscountPercent
    );
    
    return result;
  }, [effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, bogofPaidAreas, selectedAreas, leafletAreas, leafletDurations, bogofFreeAreas, agencyDiscountPercent]);

  
  React.useEffect(() => {

    try {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations :
        (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      if (relevantDurations && relevantDurations.length > 0) {
        // If no duration selected or it was cleared, set the first/default one
        if (!selectedDuration) {
          const defaultDuration = relevantDurations.find(d => (d as any).is_default) || relevantDurations[0];
          if (defaultDuration) {
            setSelectedDuration(defaultDuration.id);
          }
        } else {
          // Check if current selection is valid for this pricing model
          const isValidSelection = relevantDurations.some(d => d.id === selectedDuration);
          if (!isValidSelection) {
            setSelectedDuration("");
          }
        }
      }
      
      // Update previous model reference
      setPrevPricingModel(pricingModel);
    } catch (error) {
      console.error('Error in duration useEffect:', error);
    }
  }, [pricingModel, durations, subscriptionDurations, leafletDurations]);

  // Clear excess selected issues when duration changes for leafleting
  React.useEffect(() => {
    if (pricingModel === 'leafleting' && selectedDuration && leafletDurations) {
      const selectedDurationData = leafletDurations.find(d => d.id === selectedDuration);
      const maxIssues = (selectedDurationData as any)?.issues || 1;
      
      setSelectedIssues(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        // For each area, limit selections to maxIssues
        Object.keys(updated).forEach(areaId => {
          const currentSelections = updated[areaId] || [];
          if (currentSelections.length > maxIssues) {
            // Keep only the first maxIssues selections
            updated[areaId] = currentSelections.slice(0, maxIssues);
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }
  }, [selectedDuration, pricingModel, leafletDurations]);

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
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations : 
                                (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      const durationData = relevantDurations?.find(d => d.id === selectedDuration);
      // Leafleting doesn't have duration discounts, only regular advertising does
      const durationDiscountPercent = pricingModel === 'leafleting' ? 0 : (durationData as any)?.discount_percentage || 0;
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

  const handleSaveQuote = async () => {
    if (!pricingBreakdown) {
      toast({ title: "Missing Selection", description: "Complete your selections first.", variant: "destructive" });
      return;
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast({ title: "Missing Information", description: "Please fill in your contact details and password.", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Password Too Short", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }
    if (effectiveSelectedAreas.length === 0 || !selectedAdSize || !selectedDuration) {
      toast({ title: "Incomplete", description: "Please select areas, ad size and duration.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations : 
                                (pricingModel === 'subscription' || pricingModel === 'bogof') ? subscriptionDurations : durations;
      const durationData = relevantDurations?.find(d => d.id === selectedDuration);
      // Leafleting doesn't have duration discounts, only regular advertising does
      const durationDiscountPercent = pricingModel === 'leafleting' ? 0 : (durationData as any)?.discount_percentage || 0;
      const subtotalAfterVolume = pricingBreakdown.subtotal - pricingBreakdown.volumeDiscount;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

      const basePayload = {
        email: formData.email,
        contact_name: formData.name,
        company: formData.company || null,
        phone: formData.phone || null,
        title: `Quote - ${new Date().toLocaleDateString()}`,
        pricing_model: pricingModel,
        ad_size_id: selectedAdSize,
        duration_id: selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : [],
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : [],
        monthly_price: monthlyFinal,
        subtotal: pricingBreakdown.subtotal,
        final_total: pricingBreakdown.finalTotal,
        duration_multiplier: pricingBreakdown.durationMultiplier,
        total_circulation: pricingBreakdown.totalCirculation,
        volume_discount_percent: pricingBreakdown.volumeDiscountPercent,
        duration_discount_percent: durationDiscountPercent,
        pricing_breakdown: JSON.parse(JSON.stringify(pricingBreakdown)) as any,
        selections: {
          pricingModel,
          selectedAdSize,
          selectedDuration,
          selectedAreas,
          bogofPaidAreas,
          bogofFreeAreas
        } as any
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const payloadForDb = { ...basePayload, user_id: session.user.id } as any;
        const { error } = await supabase.from('quotes').insert(payloadForDb);
        if (error) throw error;
        toast({ title: "Saved", description: "Quote saved to your dashboard." });
      } else {
        // Create account automatically and log them in
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password, // Use user-provided password
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { 
              display_name: formData.name, 
              phone: formData.phone, 
              company: formData.company 
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Save the quote with the new user ID
          const payloadForDb = { ...basePayload, user_id: authData.user.id } as any;
          const { error: quotesError } = await supabase.from('quotes').insert(payloadForDb);
          if (quotesError) throw quotesError;
          
          // Mark this as a new user from the calculator for password setup
          localStorage.setItem('newUserFromCalculator', 'true');
          
          toast({ 
            title: "Account Created & Quote Saved!", 
            description: "Your account has been created and quote saved. Check your email to verify your account." 
          });
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('Save quote error:', err);
      toast({ title: "Error", description: err.message || 'Failed to save quote.', variant: "destructive" });
    } finally {
      setSaving(false);
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
                Unable to load pricing data
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
    number: "142,000",
    label: "Bi-monthly Circulation",
    icon: Newspaper
  }, {
    number: "14",
    label: "Local Editions to Choose From",
    icon: MapPin
  }, {
    number: "72%",
    label: "Repeat Advertisers - It Works!",
    icon: Target
  }, {
    number: "580,000",
    label: "Leaflets Distributed Per Year",
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
      
      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-community-navy to-community-green text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
          backgroundImage: 'url(/lovable-uploads/08771cf3-89e3-4223-98db-747dce5d2283.png)'
        }} />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-community-navy/80 to-community-green/80" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-gray-200">
            ADVERTISING
          </h1>
          <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            YOUR BUSINESS NEEDS TO BE SEEN
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We can't promise to find you a mate, but we will match you up with new customers!
          </p>
        </div>
      </section>

      {/* Three Service Types Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <p className="text-gray-600">We offer 11 ad sizes to more easily match with your budget and campaign needs</p>
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
                <p className="text-gray-600">Pay a little extra for pages 2,3,5 or back cover... Stand out from the Crowd!</p>
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

      {/* Key Statistics Section */}
      <section className="py-16 bg-gray-50">
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

      {/* Getting Started Process Section */}
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
            <Card className="text-left">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-community-green rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                  <CardTitle className="text-community-navy text-xl">Identifying What's Right for You</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you are new to advertising or need a fresh pair of eyes to improve what you are getting from your current advertising, our sales team are focused on what's right for your business; starting with the size of advert, the style, the design to which areas to choose.
                </p>
                <p className="text-gray-600 font-semibold">
                  If Discover isn't right for you, we'll tell you – honest!
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-community-green rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <CardTitle className="text-community-navy text-xl">Self Select quotations - You choose</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  You'll receive an instant verbal quotation followed by 3 priced options. PLUS a link to our unique self service online cost calculator so you can play with the combination of advert size, areas and type of booking.
                </p>
                <p className="text-gray-600 mb-4 font-semibold">
                  We believe in the power of informed choice with no hidden costs or surprises!
                </p>
                <p className="text-community-green font-semibold">
                  Payment plans available
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-community-green rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                  <CardTitle className="text-community-navy text-xl">Free In-house Design - At your service</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Many of customers rely on us to create eye catching adverts for them from scratch or adapting what they have. Our editorial department is on hand to write a complimentary article if you book a series.
                </p>
                <p className="text-gray-600 font-semibold">
                  You'll be allocated an account manager to look after you throughout your journey with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Selection Section */}
      <section id="calculator" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Get Your Instant Quote
            </h2>
            <p className="text-xl text-gray-600">
              Start by selecting your preferred advertising package
            </p>
          </div>
          
          <AdvertisingStepForm />
        </div>
      </section>

      {/* Top Website Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Top 10+ Website Features Users Will Value the Most in 2023
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-community-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-community-green">1</span>
                </div>
                <h3 className="font-bold text-community-navy mb-2">Easy Navigation</h3>
                <p className="text-gray-600 text-sm">Intuitive menu structure and clear pathways</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-community-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-community-green">2</span>
                </div>
                <h3 className="font-bold text-community-navy mb-2">Intuitive Design</h3>
                <p className="text-gray-600 text-sm">User experience that feels natural</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-community-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-community-green">3</span>
                </div>
                <h3 className="font-bold text-community-navy mb-2">Value Propositions</h3>
                <p className="text-gray-600 text-sm">Clear benefits and unique selling points</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-community-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-community-green">4</span>
                </div>
                <h3 className="font-bold text-community-navy mb-2">About Us</h3>
                <p className="text-gray-600 text-sm">Build trust with company information</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-community-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-community-green">5</span>
                </div>
                <h3 className="font-bold text-community-navy mb-2">Client Lists</h3>
                <p className="text-gray-600 text-sm">Showcase existing and past clients</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Essential Facts & Figures Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              14 Local Editions
            </h2>
            <h3 className="text-2xl font-heading font-bold text-community-green mb-4">
              Essential Facts & Figures
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Area Cards - Vertical Stack */}
            <div className="space-y-3">
              {/* Area 1 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-1" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">1</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">SOUTHAMPTON CITY SUBURBS</h3>
                        <p className="text-gray-600 text-xs">SO15 SO16 SO17</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">10,000</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        ABC1 homes in the more affluent residential suburban streets of Southampton including Chilworth, Upper Shirley, Rownhams, Nursling Bassett Green, Regents Park, Highfield. Sector 7 of SO16 is delivered to by Royal Mail. Excluding HMO, student areas & flats.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 7,100 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 2 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-2" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">2</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">CHANDLER'S FORD</h3>
                        <p className="text-gray-600 text-xs">SO53</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">11,300</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        Affluent residential suburb between Southampton and Winchester. Includes Valley Park, Knightwood, Hiltingbury, Chalvington, Toynbee, Peverells Wood, Scantabout, Hocombe.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">Yes 11,300 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 3 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-3" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">3</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">FAIR OAK, HORTON HEATH & EASTLEIGH</h3>
                        <p className="text-gray-600 text-xs">SO50</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">12,500</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        Majority of this circulation covers Bishopstoke, Fair Oak, Horton Heath, Lakeside plus the more affluent residential streets of Eastleigh. Properties are either detached or semi-detached, townhouses but excluding flats, council owned areas and terraced houses.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">Yes 12,500 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 4 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-4" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">4</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">HEDGE END & BOTLEY</h3>
                        <p className="text-gray-600 text-xs">SO30</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">9,400</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        A community east of Southampton, Hedge End and Botley is primarily residential with a retail park and village high streets. A mixture of new build estates, bungalows, older detached and semi-detached homes.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet service</h4>
                      <p className="text-xs text-community-green font-bold">YES 9,400 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 5 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-5" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">5</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">LOCKS HEATH & WHITELEY</h3>
                        <p className="text-gray-600 text-xs">SO31 PO15</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">12,000</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        This area includes the residential communities of Locks Heath, Park Gate, Sarisbury Green, Warsash and the new build estate of Whiteley. The suburban area straddles the M27 and lies equidistant from Southampton and Fareham.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">Yes 12,000 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 6 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-6" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">6</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">FAREHAM & VILLAGES</h3>
                        <p className="text-gray-600 text-xs">PO12, PO13, PO14, PO15, PO16</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">12,100</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        West of Portsmouth lie the town of Fareham plus a collection of villages; Stubbington, Lee-on-the-Solent, Titchfield. Discover is delivered to selected above average affluent homes in the west side of Fareham
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 12,100 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 7 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-7" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">7</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">WICKHAM, B WALTHAM & MEON VALLEY VILLAGES</h3>
                        <p className="text-gray-600 text-xs">SO32 PO17</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">12,400</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        Often referred to as Meon Valley. Delivered is by Royal Mail and every property in the postcode SO32 includes two sectors 1 and 2 which include the market town of Bishop's Waltham, Waltham Chase, Swanmore, Durley, Upham, Boorley Green. Also included is PO17 which includes Wickham, Shedfield, Shirrell Heath. Every property in these postcodes receive Discover. Often, Discover is the only local magazine delivered to these rural properties, farms, and semi rural homes
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Services</h4>
                      <p className="text-xs text-red-600 font-bold">No</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 8 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-8" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">8</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">WINCHESTER & SURROUNDING VILLAGES</h3>
                        <p className="text-gray-600 text-xs">SO21 SO22 SO23</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">12,000</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        The residential suburbs of this affluent, historic city of Winchester include Fulflood, Tegwood, Badger Farm, Olivers Battery, St Cross, Sleepers Hill, Pitt, Kings Worthy, Abbots Barton, Headbourne Worthy, surrounding villages is city center, Weeke, Harestock. The postcode of SO21 is a "ring" around Winchester peppered with villages including Littleton, Sparsholt, Hursley, Otterbourne, Twyford, Colden Common. EXCLUDED are Stanmore, Winnall, Bar End, Hyde, council estates, city centre.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 8,000</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 9 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-9" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">9</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">ROMSEY & NORTH BADDESLEY</h3>
                        <p className="text-gray-600 text-xs">SO51 SO52</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">8,600</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        The residential areas of market town of Romsey including Abbotswood plus the 3,000 strong suburban community between Romsey and Chandler's Ford of North Baddesley.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 8,600 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 10 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-10" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">10</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">TOTTON</h3>
                        <p className="text-gray-600 text-xs">SO40</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">7,000</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        Just west of Southampton this fairly new suburb is a mix of new build estates and bungalows. Included is West Totton, Testwood, Hangers Farm, Testbourne, Rushington, Hammonds Green. The council estate of Calmore and Eling is excluded.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 7,000 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 11 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-11" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">11</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">NEW FOREST & WATERSIDE</h3>
                        <p className="text-gray-600 text-xs">SO40, SO41, SO42, SO43, SO45</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">10,640</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        The New Forest postcodes are delivered to by Royal Mail so every property, many rural, remote and high value properties in SO42, SO43 and parts of SO41 receive Discover. Towns included are Lyndhurst, Brockenhurst, Beaulieu, Minstead, Ashurst, Boldre, Bramshaw. The Waterside area runs along the west bank of Southampton Water; Marchwood, Hythe, Dibden and Dibden Purlieu are residential suburbs served by the small town of Hythe.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES Waterside 4,000 homes only</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 12 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-12" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">12</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">SHOLING, ITCHEN & WOOLSTON</h3>
                        <p className="text-gray-600 text-xs">SO19</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">7,000</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        This area is a compact residental suburbe east of Southampton reached by the Itchen Bridge or south from M27. Selected properties in Sholing, Itchen, Peartree and Woolston.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 7,000 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 13 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-13" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">13</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">HAMBLE, NETLEY, BURSLEDON & WEST END</h3>
                        <p className="text-gray-600 text-xs">SO18 SO31</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">9,200</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>  
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        Neighbouring Area 12 and south of M27 including West End (near Hedge End), Chalk Hill, parts of Bitterne, Bursledon down to the quaint and popular harbour village of Hamble and nearby Netley. Excluded: Townhill
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-community-green font-bold">YES 9,200 homes</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Area 14 */}
              <Accordion type="single" collapsible>
                <AccordionItem value="area-14" className="border-0">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow w-full">
                      <div className="bg-community-green rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">14</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-community-navy text-sm leading-tight">STOCKBRIDGE, WELLOWS & TEST VALLEY VILLAGES</h3>
                        <p className="text-gray-600 text-xs">SO51, SO20</p>
                      </div>
                      <div className="text-right">
                        <div className="text-community-green font-bold text-lg">8,000</div>
                        <p className="text-xs text-gray-600">Homes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Coverage Details</h4>
                      <p className="text-xs text-gray-700 mb-3">
                        Delivered by Royal Mail postcode sectors of SO51 which are rural, semi rural and includes the affluent, traditional villages of Stockbridge plus Kings Somborne, Braishfield, Ampfield, Sherfield English, The Wellows in fact every property in these postcodes. Discover is often the only local magazine delivered to their property.
                      </p>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">Leaflet Service</h4>
                      <p className="text-xs text-red-600 font-bold">No</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Map and Alerts Section */}
            <div className="space-y-8">
              {/* Map */}
              <div id="distribution-map" className="text-center">
                <img 
                  src={editionsMap}
                  alt="Distribution Areas Map - 14 Areas across South Hampshire showing numbered regions including Winchester, Southampton, Fareham, New Forest and surrounding areas" 
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" 
                />
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  14 Distribution Areas across South Hampshire
                </p>
              </div>

              {/* Alerts */}
              <div className="space-y-4">
                <AdvertisingAlerts />
              </div>
            </div>
          </div>

          <div className="my-16">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
                <HelpCircle className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">FAQ</span>
              </div>
              <h3 className="text-3xl font-heading font-bold text-community-navy mb-4">
                Frequently Asked Questions
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get answers to common questions about our advertising and distribution services
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>What areas do you cover?</AccordionTrigger>
                <AccordionContent>
                  We cover 14 distinct areas across South Hampshire, reaching over 142,000 homes with our magazine distribution and leafleting services.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-2">
                <AccordionTrigger>How often are the magazines published?</AccordionTrigger>
                <AccordionContent>
                  Our magazines are published bi-monthly (6 times per year) with each edition tailored to local stories and events.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-3">
                <AccordionTrigger>Do you offer design services?</AccordionTrigger>
                <AccordionContent>
                  Yes! We provide free artwork services for series bookings and offer comprehensive design support for all advertising formats.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="faq-4">
                <AccordionTrigger>Can I track my leaflet distribution?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! All our leaflet distribution is GPS tracked, monitored, and recorded for 100% transparency and accountability.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="text-center mt-12">
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
              Reach 142,000 Homes Across All 14 Areas
            </p>
            <p className="text-xl mb-8 opacity-90">
              Save over £500 with our exclusive package deal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">142,000</div>
                <div className="text-lg">Total Homes Reached</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">14</div>
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
          </div>
        </div>
      </section>

      {/* Fixed Term Confirmation Dialog */}
      <Dialog open={showFixedTermConfirmation} onOpenChange={setShowFixedTermConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Are you sure you want to book Fixed Term?
            </DialogTitle>
            <DialogDescription className="text-center">
              If you booked this selection on our 3+ Repeat Package you would pay{" "}
              <span className="font-bold text-community-green">
                £{pricingBreakdown?.finalTotal ? Math.round(pricingBreakdown.finalTotal * 0.85) : 144} + vat (£{pricingBreakdown?.finalTotal ? Math.round(pricingBreakdown.finalTotal * 0.85 * 1.2) : 172.80})
              </span>{" "}
              per month for minimum of six months INCLUDING
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-6">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-community-green mt-0.5 flex-shrink-0" />
                <span>2 x EXTRA AREAS—FREE FOR 3 ISSUES—double the number of homes you reach!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-community-green mt-0.5 flex-shrink-0" />
                <span>FREE EDITORIAL</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-community-green mt-0.5 flex-shrink-0" />
                <span>FREE PREMIUM POSITION UPGRADE</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-community-green mt-0.5 flex-shrink-0" />
                <span>FREE ADVERT DESIGN</span>
              </li>
            </ul>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleFixedTermContinue}
              className="bg-community-green hover:bg-community-green/90 text-white px-8 py-2"
            >
              YES, CONTINUE
            </Button>
            <Button 
              onClick={handleSwitchToSubscription}
              variant="outline"
              className="border-2 border-community-green text-community-green hover:bg-community-green hover:text-white px-6 py-2"
            >
              NO, SWITCH TO SUBSCRIPTION, PLEASE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              ADVERTISING ENQUIRY FORM
            </h2>
            <p className="text-xl text-gray-600">
              South Hampshire Advertising Services: reach up to 142,000 homes in SO & PO Postcodes
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