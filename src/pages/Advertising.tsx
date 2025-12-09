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
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail, Heart } from "lucide-react";
import AdvertisingAlerts from "@/components/AdvertisingAlerts";
import { supabase } from "@/integrations/supabase/client";
import AdvertisingStepForm from "@/components/AdvertisingStepForm";
import { useAgencyDiscount } from "@/hooks/useAgencyDiscount";
import { useMagazineEditions } from "@/hooks/useMagazineEditions";
import { useQueryClient } from "@tanstack/react-query";
import QuickQuoteCalculator from "@/components/QuickQuoteCalculator";
import { EnquiryFormSection } from "@/components/EnquiryFormSection";
import Footer from "@/components/Footer";
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
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: ""
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
  const {
    data: leafletAreas,
    isLoading: leafletAreasLoading,
    error: leafletAreasError
  } = useLeafletAreas();
  const {
    data: leafletDurations,
    isLoading: leafletDurationsLoading,
    error: leafletDurationsError
  } = useLeafletCampaignDurations();

  // Use magazine editions hook
  const { data: editions } = useMagazineEditions();

  // Fallback covers for when database is empty
  const fallbackCovers = [
    { src: "/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png", alt: "Winchester & Surrounds", title: "WINCHESTER & SURROUNDS", link: null },
    { src: "/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png", alt: "Itchen Valley", title: "ITCHEN VALLEY", link: null },
    { src: "/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png", alt: "Meon Valley & Whiteley", title: "MEON VALLEY & WHITELEY", link: null },
    { src: "/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png", alt: "New Forest & Waterside", title: "NEW FOREST & WATERSIDE", link: null },
    { src: "/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png", alt: "Southampton West & Totton", title: "SOUTHAMPTON WEST & TOTTON", link: null },
    { src: "/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png", alt: "Test Valley & Romsey", title: "TEST VALLEY & ROMSEY", link: null },
    { src: "/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png", alt: "Winchester & Alresford", title: "WINCHESTER & ALRESFORD", link: null },
    { src: "/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png", alt: "Chandler's Ford & Eastleigh", title: "CHANDLER'S FORD & EASTLEIGH", link: null }
  ];

  const magazineCovers = editions?.length 
    ? editions.map(e => ({
        src: e.image_url,
        alt: e.alt_text || `Discover Magazine - ${e.title} Edition`,
        title: e.title,
        link: e.link_url
      }))
    : fallbackCovers;

  // Use agency discount hook
  const {
    data: agencyData
  } = useAgencyDiscount();
  const agencyDiscountPercent = agencyData?.agencyDiscountPercent || 0;

  // Invalidate all calculator-related queries when page mounts to ensure fresh data
  useEffect(() => {
    console.log('Advertising page mounted - invalidating calculator queries');
    queryClient.invalidateQueries({
      queryKey: ['product-packages']
    });
    queryClient.invalidateQueries({
      queryKey: ['pricing']
    });
  }, [queryClient]);

  // Debug logging - remove in production

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setSelectedAreas(prev => checked ? [...prev, areaId] : prev.filter(id => id !== areaId));
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
      toast({
        title: "Switched to BOGOF",
        description: "Great choice! Now pick your free areas."
      });
    } else {
      toast({
        title: "Almost there",
        description: "Choose 1 more paid area to unlock your free areas."
      });
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
      const durationMultiplier = selectedLeafletDurationData?.issues || 1;
      const issuesCount = selectedLeafletDurationData?.issues || 1;
      return calculateLeafletingPrice(effectiveSelectedAreas, leafletAreas || [], durationMultiplier, issuesCount);
    }

    // Handle regular advertising pricing
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }
    const relevantDurations = pricingModel === 'subscription' || pricingModel === 'bogof' ? subscriptionDurations : durations;
    const result = calculateAdvertisingPrice(effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel === 'subscription' || pricingModel === 'bogof', areas, adSizes, relevantDurations, subscriptionDurations, volumeDiscounts, pricingModel === 'bogof' ? bogofFreeAreas : [],
    // Include free areas for circulation
    agencyDiscountPercent);
    return result;
  }, [effectiveSelectedAreas, selectedAdSize, selectedDuration, pricingModel, areas, adSizes, durations, subscriptionDurations, volumeDiscounts, bogofPaidAreas, selectedAreas, leafletAreas, leafletDurations, bogofFreeAreas, agencyDiscountPercent]);
  React.useEffect(() => {
    try {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations : pricingModel === 'subscription' || pricingModel === 'bogof' ? subscriptionDurations : durations;
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
        const updated = {
          ...prev
        };
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
          element.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, []);

  // Monitor when user reaches Contact Information section for Fixed Term confirmation
  useEffect(() => {
    const contactSection = document.querySelector('[data-contact-section]');
    if (!contactSection) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !contactSectionReached) {
          setContactSectionReached(true);

          // Show confirmation dialog for Fixed Term users only when pricing is calculated
          if (pricingModel === 'fixed' && !showFixedTermConfirmation && pricingBreakdown) {
            setShowFixedTermConfirmation(true);
          }
        }
      });
    }, {
      threshold: 0.5
    });
    observer.observe(contactSection);
    return () => observer.disconnect();
  }, [pricingModel, contactSectionReached, showFixedTermConfirmation, pricingBreakdown]);
  const handleGetQuote = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email, and password.",
        variant: "destructive"
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    if (effectiveSelectedAreas.length === 0) {
      toast({
        title: "No Areas Selected",
        description: "Please select at least one distribution area.",
        variant: "destructive"
      });
      return;
    }
    if (!selectedAdSize) {
      toast({
        title: "No Ad Size Selected",
        description: "Please select an advertisement size.",
        variant: "destructive"
      });
      return;
    }
    if (!selectedDuration) {
      toast({
        title: "No Duration Selected",
        description: "Please select a campaign duration.",
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    try {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations : pricingModel === 'subscription' || pricingModel === 'bogof' ? subscriptionDurations : durations;
      const durationData = relevantDurations?.find(d => d.id === selectedDuration);
      // Leafleting doesn't have duration discounts, only regular advertising does
      const durationDiscountPercent = pricingModel === 'leafleting' ? 0 : (durationData as any)?.discount_percentage || 0;
      const subtotalAfterVolume = pricingBreakdown?.subtotal ? pricingBreakdown.subtotal - (pricingBreakdown.volumeDiscount || 0) : 0;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

      // Get current user for request association
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
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
        user_id: user?.id || null // Associate with user if authenticated
      };
      const {
        error
      } = await supabase.from('quote_requests').insert(payload);
      if (error) throw error;
      toast({
        title: "Quote Request Sent!",
        description: "Our sales team will contact you within 24 hours to discuss your advertising needs."
      });
    } catch (err: any) {
      console.error('Submit quote error:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to submit quote request.',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleSaveQuote = async () => {
    if (!pricingBreakdown) {
      toast({
        title: "Missing Selection",
        description: "Complete your selections first.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact details and password.",
        variant: "destructive"
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    if (effectiveSelectedAreas.length === 0 || !selectedAdSize || !selectedDuration) {
      toast({
        title: "Incomplete",
        description: "Please select areas, ad size and duration.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      const relevantDurations = pricingModel === 'leafleting' ? leafletDurations : pricingModel === 'subscription' || pricingModel === 'bogof' ? subscriptionDurations : durations;
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
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        const payloadForDb = {
          ...basePayload,
          user_id: session.user.id
        } as any;
        const {
          error
        } = await supabase.from('quotes').insert(payloadForDb);
        if (error) throw error;
        toast({
          title: "Saved",
          description: "Quote saved to your dashboard."
        });
      } else {
        // Create account automatically and log them in
        const {
          data: authData,
          error: authError
        } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          // Use user-provided password
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
          const payloadForDb = {
            ...basePayload,
            user_id: authData.user.id
          } as any;
          const {
            error: quotesError
          } = await supabase.from('quotes').insert(payloadForDb);
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
      toast({
        title: "Error",
        description: err.message || 'Failed to save quote.',
        variant: "destructive"
      });
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
    return <div className="min-h-screen bg-background">
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
      </div>;
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
  return <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Header Section - Established, Calm, Confident */}
      <section className="relative bg-community-navy overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Video with Overlay */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover object-center">
          <source src="https://qajegkbvbpekdggtrupv.supabase.co/storage/v1/object/public/websitevideo/Monthly-Community-Magazine-In-South-Hampshire-1.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-community-navy/95 via-community-navy/80 to-community-navy/60" />
        
        {/* Radial glow effect */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-community-green/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-community-green/5 rounded-full blur-[80px]" />
        
        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Headline + Subcopy */}
            <div className="space-y-8">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-community-green rounded-full animate-pulse" />
                <span className="text-sm text-white/90 font-medium">South Hampshire's Leading Local Magazine Publisher</span>
              </div>
              
              {/* Main headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                  Reach{' '}
                  <span className="text-community-green">142,000</span>{' '}
                  Affluent Homes
                </h1>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                  Generate brand awareness, create leads, and boost website traffic with South Hampshire's most trusted local magazine network.
                </p>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-community-green hover:bg-community-green/90 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-community-green/30 transition-all duration-300 hover:shadow-xl hover:shadow-community-green/40"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Your Instant Quote
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 text-lg font-medium backdrop-blur-sm"
                  onClick={() => document.getElementById('quick-quote')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Pricing
                </Button>
              </div>
              
              {/* Social proof line */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-community-green to-emerald-400 border-2 border-community-navy flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  ))}
                </div>
                <span className="text-white/70 text-sm">
                  Trusted by <span className="text-white font-semibold">250+ local businesses</span>
                </span>
              </div>
            </div>
            
            {/* Right: Floating Stats Panel */}
            <div className="relative">
              {/* Glow behind panel */}
              <div className="absolute -inset-4 bg-community-green/20 rounded-3xl blur-2xl" />
              
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 lg:p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <Badge className="bg-community-green/20 text-community-green border-community-green/30 px-4 py-1">
                    <Award className="h-3 w-3 mr-1" />
                    Celebrating 20 Years
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Main stat - large */}
                  <div className="col-span-2 bg-white/10 rounded-xl p-6 text-center border border-white/10">
                    <div className="text-5xl lg:text-6xl font-heading font-bold text-white mb-1">142,000</div>
                    <div className="text-community-green font-medium">Bi-monthly Circulation</div>
                  </div>
                  
                  {/* Secondary stats */}
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-heading font-bold text-white mb-1">14</div>
                    <div className="text-white/70 text-sm">Local Editions</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-heading font-bold text-white mb-1">72%</div>
                    <div className="text-white/70 text-sm">Repeat Rate</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-heading font-bold text-white mb-1">250+</div>
                    <div className="text-white/70 text-sm">Advertisers</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-heading font-bold text-white mb-1">580k</div>
                    <div className="text-white/70 text-sm">Leaflets/Year</div>
                  </div>
                </div>
                
                {/* Bottom trust indicator */}
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <p className="text-white/60 text-sm">
                    <span className="text-community-green">✓</span> Tracked delivery • <span className="text-community-green">✓</span> Premium postcodes • <span className="text-community-green">✓</span> Quality editorial
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Our Story & Reach - Merged Section */}
      <section className="py-20 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-community-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-community-navy/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Timeline Badge */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border border-stone-200">
              <div className="w-3 h-3 bg-community-green rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Our Journey</span>
              <div className="w-px h-4 bg-stone-300" />
              <Badge className="bg-community-navy text-white border-0 font-bold">
                Since 2005
              </Badge>
              <div className="w-px h-4 bg-stone-300" />
              <span className="text-sm font-medium text-muted-foreground">Still Growing</span>
              <div className="w-3 h-3 bg-community-green rounded-full animate-pulse" />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              {/* Heart Icon & Title */}
              <div>
                <div className="inline-flex items-center justify-center p-3 bg-community-green/10 rounded-2xl mb-6">
                  <Heart className="h-10 w-10 text-community-green fill-community-green" />
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-community-navy leading-tight">
                  Love Your Business...
                </h2>
                <p className="text-2xl md:text-3xl font-heading font-bold text-community-green mt-2">
                  Invest in Local Advertising to Grow, Expand & Thrive
                </p>
              </div>
              
              {/* Story Paragraphs */}
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Discover Magazine is the region's most established and widespread portfolio of local publications available to businesses to generate brand awareness, create leads and boost website traffic from affluent homeowners in South Hampshire.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We started publishing local magazines in 2005 with one magazine delivered to 2,000 homes. Today, Discover has the <span className="font-semibold text-community-navy">largest single circulation of any magazine in South Hampshire</span>.
                </p>
              </div>
              
              {/* Key Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                  <div className="text-3xl font-bold text-community-navy">20</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                  <div className="text-3xl font-bold text-community-green">14</div>
                  <div className="text-sm text-muted-foreground">Local Editions</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                  <div className="text-3xl font-bold text-community-navy">120k+</div>
                  <div className="text-sm text-muted-foreground">Homes Reached</div>
                </div>
              </div>

              {/* Tagline */}
              <div className="p-5 bg-community-navy rounded-xl">
                <p className="text-white text-center font-medium">
                  "We've perfected the formula for local print media — for advertisers <span className="text-community-green">and</span> our readers."
                </p>
              </div>
            </div>

            {/* Right: Magazine Covers Carousel */}
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-community-navy/5 to-community-green/5 rounded-3xl" />
              
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-community-navy rounded-2xl p-6 shadow-2xl">
                {/* Carousel Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Current Editions</span>
                  <Badge variant="outline" className="border-community-green/50 text-community-green bg-community-green/10">
                    <Newspaper className="h-3 w-3 mr-1" />
                    14 Magazines
                  </Badge>
                </div>
                
                <Carousel opts={{ align: "center", loop: true }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {magazineCovers.map((cover, index) => {
                      const CardWrapper = cover.link ? 'a' : 'div';
                      const wrapperProps = cover.link ? { 
                        href: cover.link, 
                        target: "_blank", 
                        rel: "noopener noreferrer" 
                      } : {};
                      
                      return (
                        <CarouselItem key={index} className="pl-4 basis-full">
                          <CardWrapper 
                            {...wrapperProps}
                            className={cn(
                              "group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-community-green/50 transition-all duration-500 block",
                              cover.link && "cursor-pointer"
                            )}
                          >
                            <div className="relative overflow-hidden">
                              <img 
                                src={cover.src} 
                                alt={cover.alt} 
                                className="w-full h-[500px] object-contain transition-transform duration-700 group-hover:scale-105" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-white font-bold text-sm">{cover.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-1.5 h-1.5 bg-community-green rounded-full" />
                                  <span className="text-community-green text-xs font-medium">CURRENT EDITION</span>
                                </div>
                              </div>
                            </div>
                          </CardWrapper>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300 h-10 w-10" />
                  <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300 h-10 w-10" />
                </Carousel>
                
                {/* Carousel dots indicator */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {magazineCovers.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14 Local Editions Section with Adobe Interactive Embed */}
      <section id="editions-map" className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              14 Local Editions
            </h2>
            <p className="text-lg text-muted-foreground">
              Click on a numbered button or area name to view detailed distribution information
            </p>
          </div>
          
          {/* Adobe InDesign Interactive Embed - cropped to hide Adobe UI bars */}
          <div className="w-full rounded-2xl overflow-hidden shadow-lg border-2 border-community-navy/20 bg-white">
            <div className="relative w-full overflow-hidden" style={{
            paddingBottom: '56%'
          }}>
              <iframe src="https://indd.adobe.com/embed/3a8ebb1d-2f10-4a2a-b847-dd653c134e5a?startpage=1&allowFullscreen=false" className="absolute w-full" style={{
              height: '135%',
              top: '-12%',
              left: '0'
            }} frameBorder="0" title="14 Local Editions Interactive Map" allowFullScreen={false} />
              {/* Overlay to block clicks on Adobe UI chrome at top */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-transparent z-10" style={{
              pointerEvents: 'auto'
            }} />
              {/* Overlay to block clicks on Adobe UI chrome at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-transparent z-10" style={{
              pointerEvents: 'auto'
            }} />
            </div>
          </div>
        </div>
      </section>

      {/* Three Service Types Section */}
      

      {/* Getting Started Process Section */}
      

      {/* Quick Quote Calculator Section for New Advertisers */}
      <section id="quick-quote" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuickQuoteCalculator />
        </div>
      </section>

      {/* Quote Selection Section */}
      <section id="calculator" className="py-20 bg-gradient-to-br from-slate-50 via-amber-50/30 to-stone-100 relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-community-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-community-navy/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Eye-catching badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-md border border-stone-200">
                <div className="w-2.5 h-2.5 bg-community-green rounded-full animate-pulse" />
                <span className="text-sm font-medium text-community-navy">Ready to Get Started?</span>
                <div className="w-2.5 h-2.5 bg-community-green rounded-full animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Get Your Instant Quote & Booking
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Start by selecting your preferred advertising package
            </p>
            
            {/* Motivational tagline */}
            <div className="max-w-xl mx-auto p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/50">
              <p className="text-center text-muted-foreground italic">
                "Join hundreds of local businesses who've grown with Discover Magazine"
              </p>
            </div>
          </div>
          
          <AdvertisingStepForm />
        </div>
      </section>

      {/* CTA Enquiry Form Section */}
      <EnquiryFormSection />

      {/* Top Website Features Section */}

      {/* Special Offer Section */}
      

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
            <Button onClick={handleFixedTermContinue} className="bg-community-green hover:bg-community-green/90 text-white px-8 py-2">
              YES, CONTINUE
            </Button>
            <Button onClick={handleSwitchToSubscription} variant="outline" className="border-2 border-community-green text-community-green hover:bg-community-green hover:text-white px-6 py-2">
              NO, SWITCH TO SUBSCRIPTION, PLEASE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Services Section */}
      

      {/* Leaflet Distribution */}
      

      {/* Marketing Services */}
      

      <Footer />
    </div>;
};
export default CalculatorTest;