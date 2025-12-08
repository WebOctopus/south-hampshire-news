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
      <section className="relative bg-community-navy overflow-hidden h-[50vh]">
        {/* Background Video */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover object-center">
          <source src="https://qajegkbvbpekdggtrupv.supabase.co/storage/v1/object/public/websitevideo/Monthly-Community-Magazine-In-South-Hampshire-1.mp4" type="video/mp4" />
        </video>
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

      {/* Love Your Business Introduction Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-community-green fill-community-green" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 text-gray-900">
            Love Your Business...
            <span className="block text-community-green mt-2">
              Invest in Local Advertising to Grow, Expand & Thrive
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Discover Magazine is the region's most established and widespread portfolio of local publications available to businesses to generate brand awareness, create leads and boost website traffic from affluent homeowners in South Hampshire.
          </p>
        </div>
      </section>

      {/* Company History Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Futuristic Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-community-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-community-navy/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Magazine Covers Carousel */}
          <div className="relative max-w-5xl mx-auto mb-12">
            <Carousel opts={{
            align: "center",
            loop: true
          }} className="w-full">
              <CarouselContent className="-ml-6">
                {[{
                src: "/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png",
                alt: "Winchester & Surrounds",
                title: "WINCHESTER & SURROUNDS"
              }, {
                src: "/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png",
                alt: "Itchen Valley",
                title: "ITCHEN VALLEY"
              }, {
                src: "/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png",
                alt: "Meon Valley & Whiteley",
                title: "MEON VALLEY & WHITELEY"
              }, {
                src: "/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png",
                alt: "New Forest & Waterside",
                title: "NEW FOREST & WATERSIDE"
              }, {
                src: "/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png",
                alt: "Southampton West & Totton",
                title: "SOUTHAMPTON WEST & TOTTON"
              }, {
                src: "/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png",
                alt: "Test Valley & Romsey",
                title: "TEST VALLEY & ROMSEY"
              }, {
                src: "/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png",
                alt: "Winchester & Alresford",
                title: "WINCHESTER & ALRESFORD"
              }, {
                src: "/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png",
                alt: "Chandler's Ford & Eastleigh",
                title: "CHANDLER'S FORD & EASTLEIGH"
              }].map((cover, index) => <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
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
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
            </Carousel>
          </div>

          {/* Text content below carousel */}
          <div className="text-center mt-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Since 2005
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We started publishing local magazines in 2005 starting with one magazine delivered to 2,000 homes and now Discover has the largest single circulation of any magazine in South Hampshire. We've perfected the formula for local print media both for advertisers and our readers.
            </p>
          </div>
        </div>
      </section>

      {/* 14 Local Editions Section with Adobe Interactive Embed */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
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
      <section id="calculator" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Get Your Instant Quote & Booking
            </h2>
            <p className="text-xl text-gray-600">
              Start by selecting your preferred advertising package
            </p>
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