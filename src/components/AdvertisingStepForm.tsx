import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StepForm from '@/components/StepForm';
import PricingOptionsStep from '@/components/PricingOptionsStep';
import AreaAndScheduleStep from '@/components/AreaAndScheduleStep';
import AdvertisementSizeStep from '@/components/AdvertisementSizeStep';
import DesignFeeStep from '@/components/DesignFeeStep';
import BookingSummaryStep from '@/components/BookingSummaryStep';
import { LeafletBasketSummary } from '@/components/LeafletBasketSummary';
import { FixedTermBasketSummary } from '@/components/FixedTermBasketSummary';
import ContactInformationStep from '@/components/ContactInformationStep';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletCampaignDurations, useLeafletData } from '@/hooks/useLeafletData';
import { calculateLeafletingPrice } from '@/lib/leafletingCalculator';
import { calculateAdvertisingPrice } from '@/lib/pricingCalculator';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LeafletSizeStep from '@/components/LeafletSizeStep';
import { cn } from '@/lib/utils';
import { getFraudDetectionData } from '@/hooks/useBogofEligibility';

interface AdvertisingStepFormProps {
  children?: React.ReactNode;
  asDialog?: boolean;
}

export const AdvertisingStepForm: React.FC<AdvertisingStepFormProps> = ({ children, asDialog = false }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { durations, subscriptionDurations, areas, adSizes, volumeDiscounts } = usePricingData();
  const { data: leafletDurations } = useLeafletCampaignDurations();
  const { leafletAreas } = useLeafletData();
  
  const [selectedPricingModel, setSelectedPricingModel] = useState<'fixed' | 'bogof' | 'leafleting'>('fixed');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepFormRef, setStepFormRef] = useState<{ nextStep: () => void; prevStep: () => void } | null>(null);
  const [campaignData, setCampaignData] = useState({
    selectedAreas: [] as string[],
    bogofPaidAreas: [] as string[],
    bogofFreeAreas: [] as string[],
    selectedAdSize: '',
    selectedDuration: '',
    selectedMonths: {} as Record<string, string[]>,
    pricingBreakdown: null as any,
    selectedPaymentOption: '' as string,
    selectedStartingIssues: {} as Record<string, string>,
    needsDesign: false,
    designFee: 0
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate leafleting pricing when relevant data changes
  React.useEffect(() => {
    if (selectedPricingModel === 'leafleting' && 
        campaignData.selectedAreas.length > 0 && 
        leafletAreas?.length) {
      
      console.log('Calculating leafleting pricing...', {
        selectedAreas: campaignData.selectedAreas,
        selectedDuration: campaignData.selectedDuration,
        leafletAreas: leafletAreas.length
      });

      // Get duration multiplier from the selected leaflet duration (using issues, not months)
      const selectedLeafletDurationData = leafletDurations?.find(d => d.id === campaignData.selectedDuration);
      const durationMultiplier = selectedLeafletDurationData?.issues || 1;
      const issuesCount = selectedLeafletDurationData?.issues || 1;
      
      console.log('Duration multiplier:', durationMultiplier, 'from duration:', selectedLeafletDurationData);
      
      const pricingBreakdown = calculateLeafletingPrice(
        campaignData.selectedAreas,
        leafletAreas,
        durationMultiplier,
        issuesCount
      );

      console.log('Leafleting pricing calculated:', pricingBreakdown);

      if (pricingBreakdown) {
        setCampaignData(prev => ({
          ...prev,
          pricingBreakdown
        }));
      }
    }
  }, [selectedPricingModel, campaignData.selectedAreas, campaignData.selectedDuration, leafletAreas, leafletDurations]);

  // Debug: Track campaign data changes
  React.useEffect(() => {
    console.log('AdvertisingStepForm - Campaign data updated:', campaignData);
    if (campaignData.pricingBreakdown) {
      console.log('AdvertisingStepForm - Has pricing breakdown:', campaignData.pricingBreakdown);
    } else {
      console.log('AdvertisingStepForm - No pricing breakdown yet');
    }
  }, [campaignData]);

  // Update design fee when ad size changes
  React.useEffect(() => {
    if (campaignData.selectedAdSize) {
      const selectedSize = adSizes?.find(size => size.id === campaignData.selectedAdSize);
      const designFee = (selectedSize as any)?.design_fee || 0;
      setCampaignData(prev => ({ ...prev, designFee }));
    }
  }, [campaignData.selectedAdSize, adSizes]);

  // Update pricing breakdown to include design fee when needed
  React.useEffect(() => {
    if (campaignData.pricingBreakdown && campaignData.needsDesign && campaignData.designFee > 0) {
      const designFeeAmount = campaignData.designFee;
      setCampaignData(prev => ({
        ...prev,
        pricingBreakdown: {
          ...prev.pricingBreakdown,
          designFee: designFeeAmount,
          subtotal: (prev.pricingBreakdown?.subtotal || 0),
          subtotalBeforeDesign: prev.pricingBreakdown?.subtotalBeforeDesign || prev.pricingBreakdown?.subtotal || 0,
          finalTotal: (prev.pricingBreakdown?.subtotalBeforeDesign || prev.pricingBreakdown?.subtotal || 0) + designFeeAmount
        }
      }));
    } else if (campaignData.pricingBreakdown && (!campaignData.needsDesign || campaignData.designFee === 0)) {
      // Remove design fee if not needed
      const subtotalBeforeDesign = campaignData.pricingBreakdown.subtotalBeforeDesign || campaignData.pricingBreakdown.subtotal;
      if (campaignData.pricingBreakdown.designFee) {
        setCampaignData(prev => ({
          ...prev,
          pricingBreakdown: {
            ...prev.pricingBreakdown,
            designFee: 0,
            finalTotal: subtotalBeforeDesign
          }
        }));
      }
    }
  }, [campaignData.needsDesign, campaignData.designFee]);
  const [showFixedTermConfirmation, setShowFixedTermConfirmation] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<(() => void) | null>(null);

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'leafleting') => {
    
    setSelectedPricingModel(option);
  };

  const handleCampaignDataChange = (data: any) => {
    setCampaignData(data);
  };

  const handleFixedTermContinue = () => {
    // Switch to BOGOF and navigate back to step 1 (pricing options / Free Plus section)
    setSelectedPricingModel('bogof');
    
    // Reset campaign data for FreePlus flow - clear everything except transferred areas
    setCampaignData(prev => ({
      selectedAreas: [], // Clear this as bogof uses bogofPaidAreas/bogofFreeAreas
      bogofPaidAreas: prev.selectedAreas, // Transfer current selections as paid areas
      bogofFreeAreas: [], // Reset free areas so user can select them
      selectedAdSize: '', // Clear so user selects appropriate size for subscription
      selectedDuration: '', // Clear so user selects subscription duration
      selectedMonths: {}, // Clear month selections (fixed term specific)
      pricingBreakdown: null, // Reset pricing - will be recalculated for subscription
      selectedPaymentOption: '', // Clear payment option - user must select for subscription
      selectedStartingIssues: {}, // Clear starting issues
      needsDesign: prev.needsDesign, // Keep design choice
      designFee: prev.designFee // Keep design fee
    }));
    
    setShowFixedTermConfirmation(false);
    setPendingNextStep(null);
    
    // Navigate directly to step 2 (Area selection for 3+ Repeat Package)
    (window as any).salesAssistantGoToStep?.(2);
    
    toast({
      title: "Switched to 3+ Repeat Package!",
      description: "Your selected areas have been saved. Now select your FREE bonus areas to continue.",
    });
  };

  const handleContinueWithFixedTerm = () => {
    // Stay in fixed term mode and proceed to booking summary
    setShowFixedTermConfirmation(false);
    
    // Call the pending next step to proceed to booking summary
    if (pendingNextStep) {
      pendingNextStep();
    }
    setPendingNextStep(null);
    
    toast({
      title: "Continuing with Fixed Term",
      description: "Review your booking details below.",
    });
  };

  const handleStepTransition = (currentStep: number, nextStep: () => void) => {
    // Intercept transition from area selection (step 2) to ad size (step 3) for Fixed Term
    // Show FreePlus offer when user has selected 3 or more areas - every time they meet this condition
    if (currentStep === 2 && selectedPricingModel === 'fixed' && campaignData.selectedAreas.length >= 3) {
      // Show dialog asking if they want to switch to BOGOF instead
      setPendingNextStep(() => nextStep);
      setShowFixedTermConfirmation(true);
      return; // Don't proceed to next step yet
    }
    nextStep(); // Proceed normally for other cases
  };

  const handleContactInfoSave = async (contactData: any) => {
    
    
    setSubmitting(true);

    try {
      const effectiveSelectedAreas = selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : campaignData.selectedAreas;

      const fullName = `${contactData.firstName} ${contactData.lastName}`;
      
      // First, try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: contactData.email,
        password: contactData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: fullName,
            phone: contactData.phone || '',
            company: contactData.companyName || ''
          }
        }
      });

      let userId = authData?.user?.id;
      let isNewUser = true;

      // If user already exists, try to sign them in with the provided password
      if (authError?.message === 'User already registered') {
        isNewUser = false;
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: contactData.email,
          password: contactData.password,
        });
        
        if (signInError) {
          toast({
            title: "Incorrect Password",
            description: "This email is already registered. Please enter your correct password to sign in.",
            variant: "destructive",
          });
          return;
        }
        
        userId = signInData?.user?.id;
        
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in to your existing account.",
        });
      } else if (authError) {
        toast({
          title: "Sign Up Failed",
          description: authError.message || "Failed to create account.",
          variant: "destructive",
        });
        return;
      }

      if (!userId) {
        toast({
          title: "Authentication Failed",
          description: "Failed to create or authenticate user.",
          variant: "destructive",
        });
        return;
      }

      // Collect fraud detection data for BOGOF tracking
      const fraudData = await getFraudDetectionData();
      console.log('Fraud detection data collected for quote');

      // Save to quotes table (user's saved quotes)
      const quotePayload = {
        user_id: userId,
        contact_name: fullName,
        email: contactData.email,
        phone: contactData.phone || '',
        company: contactData.companyName || '',
        title: `${selectedPricingModel === 'fixed' ? 'Fixed Term' : selectedPricingModel === 'bogof' ? '3+ Repeat Package' : 'Leafleting'} Quote`,
        pricing_model: selectedPricingModel,
        ad_size_id: campaignData.selectedAdSize || null,
        duration_id: campaignData.selectedDuration || null,
        selected_area_ids: Array.isArray(effectiveSelectedAreas) ? effectiveSelectedAreas : [],
        bogof_paid_area_ids: selectedPricingModel === 'bogof' && Array.isArray(campaignData.bogofPaidAreas) ? campaignData.bogofPaidAreas : [],
        bogof_free_area_ids: selectedPricingModel === 'bogof' && Array.isArray(campaignData.bogofFreeAreas) ? campaignData.bogofFreeAreas : [],
        monthly_price: Number(campaignData.pricingBreakdown?.finalTotal) || 0,
        subtotal: Number(campaignData.pricingBreakdown?.subtotal) || 0,
        final_total: Number(campaignData.pricingBreakdown?.finalTotal) || 0,
        duration_multiplier: Number(campaignData.pricingBreakdown?.durationMultiplier) || 1,
        total_circulation: Number(campaignData.pricingBreakdown?.totalCirculation) || 0,
        volume_discount_percent: Number(campaignData.pricingBreakdown?.volumeDiscountPercent) || 0,
        duration_discount_percent: Number(campaignData.pricingBreakdown?.durationDiscountPercent) || 0,
        agency_discount_percent: Number(campaignData.pricingBreakdown?.agencyDiscountPercent) || 0,
        pricing_breakdown: JSON.parse(JSON.stringify(campaignData.pricingBreakdown || {})) as any,
        selections: {
          pricingModel: selectedPricingModel,
          selectedAdSize: campaignData.selectedAdSize || null,
          selectedDuration: campaignData.selectedDuration || null,
          selectedAreas: Array.isArray(campaignData.selectedAreas) ? campaignData.selectedAreas : [],
          bogofPaidAreas: Array.isArray(campaignData.bogofPaidAreas) ? campaignData.bogofPaidAreas : [],
          bogofFreeAreas: Array.isArray(campaignData.bogofFreeAreas) ? campaignData.bogofFreeAreas : [],
          address: contactData.address || '',
          addressLine2: contactData.addressLine2 || '',
          city: contactData.city || '',
          postcode: contactData.postcode || '',
          ...campaignData
        } as any
      };

      const { error: quoteError } = await supabase.from('quotes').insert(quotePayload);
      if (quoteError) {
        console.error('Quote save error:', quoteError);
        toast({
          title: "Error Saving Quote",
          description: "Failed to save quote to database.",
          variant: "destructive",
        });
        return;
      }

      // Also save to quote_requests table for admin tracking
      const requestPayload = {
        ...quotePayload,
        user_id: userId
      };
      
      const { error: requestError } = await supabase.from('quote_requests').insert(requestPayload);
      if (requestError) {
        console.error('Quote request save error:', requestError);
        // Don't fail completely if this fails, just log it
      }

      // Store information for the dashboard to use
      if (isNewUser) {
        localStorage.setItem('newUserFromCalculator', 'true');
      }
      localStorage.setItem('justSavedQuote', 'true');
      
      toast({
        title: isNewUser ? "Account Created & Quote Saved!" : "Quote Saved Successfully!",
        description: isNewUser 
          ? "Welcome! Your account has been created and your quote is saved. Redirecting to your dashboard..." 
          : "Your quote has been saved to your dashboard. Redirecting...",
      });

      // Wait for authentication to complete and then navigate
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error in handleContactInfoSave:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactInfoBook = async (contactData: any) => {
    
    setSubmitting(true);

    try {
      const effectiveSelectedAreas = selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : campaignData.selectedAreas;
      const fullName = `${contactData.firstName} ${contactData.lastName}`;
      
      console.log('Starting booking process...', { contactData, campaignData, selectedPricingModel });
      
      // First, try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: contactData.email,
        password: contactData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: fullName,
            phone: contactData.phone || '',
            company: contactData.companyName || ''
          }
        }
      });

      let userId = authData?.user?.id;
      let isNewUser = true;
      
      console.log('Auth signup result:', { authData, authError, userId });

      // If user already exists, try to sign them in with the provided password
      if (authError?.message === 'User already registered') {
        isNewUser = false;
        console.log('User already exists, attempting sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: contactData.email,
          password: contactData.password,
        });
        
        console.log('Sign in result:', { signInData, signInError });
        
        if (signInError) {
          toast({
            title: "Incorrect Password",
            description: "This email is already registered. Please enter your correct password to sign in.",
            variant: "destructive",
          });
          return;
        }
        
        userId = signInData?.user?.id;
      } else if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Sign Up Failed",
          description: authError.message || "Failed to create account.",
          variant: "destructive",
        });
        return;
      }

      if (!userId) {
        console.error('No user ID available');
        toast({
          title: "Authentication Failed",
          description: "Failed to create or authenticate user.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('User authenticated successfully, userId:', userId);
      
      // Verify current session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);
      
      if (!sessionData.session) {
        console.error('No active session after authentication');
        toast({
          title: "Authentication Error", 
          description: "Session not established. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Collect fraud detection data for BOGOF tracking
      const fraudData = await getFraudDetectionData();
      console.log('Fraud detection data:', fraudData);

      // Create booking record
      const bookingPayload = {
        user_id: userId,
        contact_name: fullName,
        email: contactData.email,
        phone: contactData.phone || '',
        company: contactData.companyName || '',
        title: `${selectedPricingModel === 'fixed' ? 'Fixed Term' : selectedPricingModel === 'bogof' ? '3+ Repeat Package' : 'Leafleting'} Booking`,
        pricing_model: selectedPricingModel,
        ad_size_id: campaignData.selectedAdSize || null,
        duration_id: campaignData.selectedDuration || null,
        selected_area_ids: Array.isArray(effectiveSelectedAreas) ? effectiveSelectedAreas : [],
        bogof_paid_area_ids: selectedPricingModel === 'bogof' && Array.isArray(campaignData.bogofPaidAreas) ? campaignData.bogofPaidAreas : [],
        bogof_free_area_ids: selectedPricingModel === 'bogof' && Array.isArray(campaignData.bogofFreeAreas) ? campaignData.bogofFreeAreas : [],
        monthly_price: Number(campaignData.pricingBreakdown?.finalTotal) || 0,
        subtotal: Number(campaignData.pricingBreakdown?.subtotal) || 0,
        final_total: Number(campaignData.pricingBreakdown?.finalTotal) || 0,
        duration_multiplier: Number(campaignData.pricingBreakdown?.durationMultiplier) || 1,
        total_circulation: Number(campaignData.pricingBreakdown?.totalCirculation) || 0,
        volume_discount_percent: Number(campaignData.pricingBreakdown?.volumeDiscountPercent) || 0,
        duration_discount_percent: Number(campaignData.pricingBreakdown?.durationDiscountPercent) || 0,
        pricing_breakdown: campaignData.pricingBreakdown ? JSON.parse(JSON.stringify(campaignData.pricingBreakdown)) : {},
        selections: {
          pricingModel: selectedPricingModel,
          selectedAdSize: campaignData.selectedAdSize,
          selectedDuration: campaignData.selectedDuration,
          selectedAreas: campaignData.selectedAreas || [],
          bogofPaidAreas: campaignData.bogofPaidAreas || [],
          bogofFreeAreas: campaignData.bogofFreeAreas || [],
          payment_option_id: campaignData.selectedPaymentOption || null,
          address: contactData.address || '',
          addressLine2: contactData.addressLine2 || '',
          city: contactData.city || '',
          postcode: contactData.postcode || '',
        },
        ip_address_hash: fraudData.ipHash,
        device_fingerprint: fraudData.deviceFingerprint,
        status: 'pending'
      };
      
      console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();
        
      console.log('Booking insert result:', { bookingData, bookingError });

      if (bookingError) {
        console.error('Booking save error:', bookingError);
        toast({
          title: "Error Creating Booking",
          description: `Failed to create booking: ${bookingError.message}. Please try again.`,
          variant: "destructive",
        });
        return;
      }

      // Note: Vouchers for BOGOF bookings will be created after payment is completed
      // This prevents vouchers from being generated for unpaid bookings

      // Send webhook to Go High-Level
      try {
        const { error: webhookError } = await supabase.functions.invoke('send-booking-webhook', {
          body: {
            bookingData,
            step1Data: { pricingModel: selectedPricingModel },
            step2Data: campaignData,
            step3Data: contactData,
            userId
          }
        });

        if (webhookError) {
          console.error('Webhook error:', webhookError);
          toast({
            title: "Booking Created",
            description: "Your booking has been created but there was an issue sending it to our system. Our team will process it manually.",
            variant: "default",
          });
        }
      } catch (webhookError) {
        console.error('Webhook send error:', webhookError);
      }

      // Store information for the dashboard
      if (isNewUser) {
        localStorage.setItem('newUserFromCalculator', 'true');
      }
      localStorage.setItem('justCreatedBooking', 'true');
      
      toast({
        title: isNewUser ? "Account Created!" : "Booking Created!",
        description: "Redirecting you to your dashboard where you can set up payment...",
      });

      // Redirect to dashboard instead of directly to GoCardless
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error in handleContactInfoBook:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = {
    nextButtonLabels: ['Select Areas & Publication Schedule', 'Choose Advertisement Size', 'Quote & Payment Options', 'Contact Information', 'Save My Quote'],
    prevButtonLabel: 'Previous Step',
    onLastStepNext: () => Promise.resolve(), // Dummy function since we use the global handler
    onStepTransition: (currentStep: number, nextStep: () => void) => {
      // Intercept transition from area selection (step 2) to ad size (step 3) for Fixed Term
      // Show FreePlus offer when user has selected 3 or more areas - every time they meet this condition
      if (currentStep === 1 && selectedPricingModel === 'fixed' && (campaignData.selectedAreas?.length || 0) >= 3) {
        setPendingNextStep(() => nextStep);
        setShowFixedTermConfirmation(true);
        return; // Don't proceed to next step yet
      }
      nextStep(); // Proceed normally for other cases
    }
  };

  const handleStepChange = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  // Remove manual initialization - StepForm will handle this now

  return (
    <ErrorBoundary>
      {asDialog && children ? (
        <Dialog>
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Advertising Cost Calculator
              </DialogTitle>
            </DialogHeader>
            <StepForm 
              stepLabels={stepLabels}
              onStepChange={handleStepChange}
            >
              <PricingOptionsStep onSelectOption={handleSelectOption} />
              
              <AreaAndScheduleStep 
                pricingModel={selectedPricingModel}
                selectedAreas={campaignData.selectedAreas}
                bogofPaidAreas={campaignData.bogofPaidAreas}
                bogofFreeAreas={campaignData.bogofFreeAreas}
                selectedDuration={campaignData.selectedDuration}
                selectedMonths={campaignData.selectedMonths}
                onAreasChange={(areas) => setCampaignData(prev => ({ ...prev, selectedAreas: areas }))}
                onBogofAreasChange={(paid, free) => setCampaignData(prev => ({ ...prev, bogofPaidAreas: paid, bogofFreeAreas: free }))}
                onDurationChange={(duration) => setCampaignData(prev => ({ ...prev, selectedDuration: duration }))}
                onMonthsChange={(months) => setCampaignData(prev => ({ ...prev, selectedMonths: months }))}
                onNext={() => {}}
                campaignData={{
                  selectedModel: selectedPricingModel,
                  selectedAreas: campaignData.selectedAreas,
                  bogofPaidAreas: campaignData.bogofPaidAreas,
                  bogofFreeAreas: campaignData.bogofFreeAreas,
                  selectedSize: campaignData.selectedAdSize,
                  selectedDuration: campaignData.selectedDuration,
                  totalCost: campaignData.pricingBreakdown?.finalTotal,
                  pricingBreakdown: campaignData.pricingBreakdown
                }}
                currentStep={currentStep}
              />
              
{selectedPricingModel === 'leafleting' ? (
  <LeafletSizeStep
    selectedLeafletSize={campaignData.selectedAdSize}
    onLeafletSizeChange={(sizeId) => setCampaignData(prev => ({ ...prev, selectedAdSize: sizeId }))}
    onNext={() => {}}
  />
) : (
  <AdvertisementSizeStep
    selectedAdSize={campaignData.selectedAdSize}
    onAdSizeChange={(adSize) => setCampaignData(prev => ({ ...prev, selectedAdSize: adSize }))}
    pricingModel={selectedPricingModel}
    selectedAreas={campaignData.selectedAreas}
    bogofPaidAreas={campaignData.bogofPaidAreas}
    bogofFreeAreas={campaignData.bogofFreeAreas}
    selectedDuration={campaignData.selectedDuration}
    onPricingChange={(breakdown) => {
      console.log('AdvertisingStepForm - Pricing breakdown received:', breakdown);
      setCampaignData(prev => ({ ...prev, pricingBreakdown: breakdown }));
    }}
    showSummary={true}
    onNext={() => {}}
    campaignData={{
      selectedModel: selectedPricingModel,
      selectedAreas: campaignData.selectedAreas,
      bogofPaidAreas: campaignData.bogofPaidAreas,
      bogofFreeAreas: campaignData.bogofFreeAreas,
      selectedSize: campaignData.selectedAdSize,
      selectedDuration: campaignData.selectedDuration,
      totalCost: campaignData.pricingBreakdown?.finalTotal,
      pricingBreakdown: campaignData.pricingBreakdown
    }}
    currentStep={currentStep}
    selectedMonths={campaignData.selectedMonths}
  />
)}
              
              <DesignFeeStep
                needsDesign={campaignData.needsDesign}
                onDesignChoiceChange={(needsDesign) => setCampaignData(prev => ({ ...prev, needsDesign }))}
                designFee={campaignData.designFee}
                pricingModel={selectedPricingModel}
              />
              
              {selectedPricingModel === 'leafleting' ? (
                <LeafletBasketSummary
                  selectedAreas={campaignData.selectedAreas}
                  selectedLeafletSize={campaignData.selectedAdSize}
                  selectedDuration={campaignData.selectedDuration}
                  selectedMonths={campaignData.selectedMonths}
                  pricingBreakdown={campaignData.pricingBreakdown}
                />
              ) : (
                <BookingSummaryStep
                  pricingModel={selectedPricingModel}
                  selectedAreas={campaignData.selectedAreas}
                  bogofPaidAreas={campaignData.bogofPaidAreas}
                  bogofFreeAreas={campaignData.bogofFreeAreas}
                  selectedAdSize={campaignData.selectedAdSize}
                  selectedDuration={campaignData.selectedDuration}
                  pricingBreakdown={campaignData.pricingBreakdown}
                  selectedPaymentOption={campaignData.selectedPaymentOption}
                  onPaymentOptionChange={(option) => setCampaignData(prev => ({ ...prev, selectedPaymentOption: option }))}
                  selectedStartingIssues={campaignData.selectedStartingIssues}
                  onStartingIssuesChange={(issues) => setCampaignData(prev => ({ ...prev, selectedStartingIssues: issues }))}
                />
              )}
              
              <ContactInformationStep
                pricingModel={selectedPricingModel}
                selectedAreas={campaignData.selectedAreas}
                bogofPaidAreas={campaignData.bogofPaidAreas}
                bogofFreeAreas={campaignData.bogofFreeAreas}
                selectedAdSize={campaignData.selectedAdSize}
                selectedDuration={campaignData.selectedDuration}
                pricingBreakdown={campaignData.pricingBreakdown}
                campaignData={campaignData}
                onSaveQuote={handleContactInfoSave}
                onBookNow={handleContactInfoBook}
                currentStep={5}
              />
            </StepForm>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="relative">
          <StepForm 
            stepLabels={stepLabels}
            onStepChange={handleStepChange}
          >
            <PricingOptionsStep onSelectOption={handleSelectOption} />
            
            <AreaAndScheduleStep 
              pricingModel={selectedPricingModel}
              selectedAreas={campaignData.selectedAreas}
              bogofPaidAreas={campaignData.bogofPaidAreas}
              bogofFreeAreas={campaignData.bogofFreeAreas}
              selectedDuration={campaignData.selectedDuration}
              selectedMonths={campaignData.selectedMonths}
              onAreasChange={(areas) => setCampaignData(prev => ({ ...prev, selectedAreas: areas }))}
              onBogofAreasChange={(paid, free) => setCampaignData(prev => ({ ...prev, bogofPaidAreas: paid, bogofFreeAreas: free }))}
              onDurationChange={(duration) => setCampaignData(prev => ({ ...prev, selectedDuration: duration }))}
              onMonthsChange={(months) => setCampaignData(prev => ({ ...prev, selectedMonths: months }))}
              onPricingChange={(pricingData) => setCampaignData(prev => ({ ...prev, ...pricingData }))}
              onNext={() => {}}
              campaignData={{
                selectedModel: selectedPricingModel,
                selectedAreas: campaignData.selectedAreas,
                bogofPaidAreas: campaignData.bogofPaidAreas,
                bogofFreeAreas: campaignData.bogofFreeAreas,
                selectedSize: campaignData.selectedAdSize,
                selectedDuration: campaignData.selectedDuration,
                totalCost: campaignData.pricingBreakdown?.finalTotal,
                pricingBreakdown: campaignData.pricingBreakdown
              }}
              currentStep={currentStep}
            />
            
{selectedPricingModel === 'leafleting' ? (
  <LeafletSizeStep
    selectedLeafletSize={campaignData.selectedAdSize}
    onLeafletSizeChange={(sizeId) => setCampaignData(prev => ({ ...prev, selectedAdSize: sizeId }))}
    onNext={() => {}}
  />
) : (
  <>
    <AdvertisementSizeStep
      selectedAdSize={campaignData.selectedAdSize}
      onAdSizeChange={(adSize) => setCampaignData(prev => ({ ...prev, selectedAdSize: adSize }))}
      pricingModel={selectedPricingModel}
      selectedAreas={campaignData.selectedAreas}
      bogofPaidAreas={campaignData.bogofPaidAreas}
      bogofFreeAreas={campaignData.bogofFreeAreas}
      selectedDuration={campaignData.selectedDuration}
      onPricingChange={(breakdown) => {
        console.log('AdvertisingStepForm - Pricing breakdown received:', breakdown);
        setCampaignData(prev => ({ ...prev, pricingBreakdown: breakdown }));
      }}
      showSummary={true}
      onNext={() => {}}
      campaignData={{
        selectedModel: selectedPricingModel,
        selectedAreas: campaignData.selectedAreas,
        bogofPaidAreas: campaignData.bogofPaidAreas,
        bogofFreeAreas: campaignData.bogofFreeAreas,
        selectedSize: campaignData.selectedAdSize,
        selectedDuration: campaignData.selectedDuration,
        totalCost: campaignData.pricingBreakdown?.finalTotal,
        pricingBreakdown: campaignData.pricingBreakdown
      }}
      currentStep={currentStep}
      selectedMonths={campaignData.selectedMonths}
    />
    
    <DesignFeeStep
      needsDesign={campaignData.needsDesign}
      onDesignChoiceChange={(needsDesign) => setCampaignData(prev => ({ ...prev, needsDesign }))}
      designFee={campaignData.designFee}
      pricingModel={selectedPricingModel}
    />
  </>
)}
            
            {selectedPricingModel === 'leafleting' ? (
              <LeafletBasketSummary
                selectedAreas={campaignData.selectedAreas}
                selectedLeafletSize={campaignData.selectedAdSize}
                selectedDuration={campaignData.selectedDuration}
                selectedMonths={campaignData.selectedMonths}
                pricingBreakdown={campaignData.pricingBreakdown}
              />
            ) : selectedPricingModel === 'fixed' ? (
              <FixedTermBasketSummary
                selectedAreas={campaignData.selectedAreas}
                selectedAdSize={campaignData.selectedAdSize}
                selectedDuration={campaignData.selectedDuration}
                selectedMonths={campaignData.selectedMonths}
                pricingBreakdown={campaignData.pricingBreakdown}
              />
            ) : (
              <BookingSummaryStep
                pricingModel={selectedPricingModel}
                selectedAreas={campaignData.selectedAreas}
                bogofPaidAreas={campaignData.bogofPaidAreas}
                bogofFreeAreas={campaignData.bogofFreeAreas}
                selectedAdSize={campaignData.selectedAdSize}
                selectedDuration={campaignData.selectedDuration}
                pricingBreakdown={campaignData.pricingBreakdown}
                selectedPaymentOption={campaignData.selectedPaymentOption}
                onPaymentOptionChange={(option) => setCampaignData(prev => ({ ...prev, selectedPaymentOption: option }))}
                selectedStartingIssues={campaignData.selectedStartingIssues}
                onStartingIssuesChange={(issues) => setCampaignData(prev => ({ ...prev, selectedStartingIssues: issues }))}
              />
            )}
            
            <ContactInformationStep
              pricingModel={selectedPricingModel}
              selectedAreas={campaignData.selectedAreas}
              bogofPaidAreas={campaignData.bogofPaidAreas}
              bogofFreeAreas={campaignData.bogofFreeAreas}
              selectedAdSize={campaignData.selectedAdSize}
              selectedDuration={campaignData.selectedDuration}
              pricingBreakdown={campaignData.pricingBreakdown}
              campaignData={campaignData}
              onSaveQuote={handleContactInfoSave}
              onBookNow={handleContactInfoBook}
              currentStep={5}
            />
          </StepForm>
        </div>
      )}

      {/* Fixed Term Confirmation Dialog */}
      <Dialog open={showFixedTermConfirmation} onOpenChange={setShowFixedTermConfirmation}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-4 sm:space-y-5">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-center leading-tight">
              Are you sure you want to book Fixed Term?
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 sm:space-y-5">
              <p className="text-sm sm:text-lg font-semibold leading-relaxed text-foreground">
                3+ Repeat Package is available to New Advertisers – Save £££, Buy One Get One Free
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
                <p className="text-sm sm:text-base text-foreground/80">
                  If you booked this campaign on our 3+ Repeat Package you would pay
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">
                  {(() => {
                    // Calculate FreePlus pricing based on user's selections
                    const sixMonthDuration = subscriptionDurations?.find(d => d.duration_value === 6);
                    if (!sixMonthDuration || !campaignData.selectedAdSize || !campaignData.selectedAreas.length || !areas || !adSizes || !volumeDiscounts) {
                      return '£207';
                    }
                    
                    const freePlusPricing = calculateAdvertisingPrice(
                      campaignData.selectedAreas,
                      campaignData.selectedAdSize,
                      sixMonthDuration.id,
                      true, // isSubscription
                      areas,
                      adSizes,
                      durations || [],
                      subscriptionDurations || [],
                      volumeDiscounts,
                      campaignData.selectedAreas, // free areas = same as paid areas
                      0 // no agency discount
                    );
                    
                    if (!freePlusPricing) return '£207';
                    
                    const monthlyPrice = Math.round(freePlusPricing.finalTotal / 6);
                    const monthlyPriceWithVAT = Math.round(monthlyPrice * 1.2);
                    
                    return `£${monthlyPrice} + VAT (£${monthlyPriceWithVAT})`;
                  })()}
                </p>
                <p className="text-xs sm:text-sm text-foreground/70 font-medium">
                  per month for six months INCLUDING
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-5 sm:my-6">
            <ul className="space-y-3 sm:space-y-3.5">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 sm:h-5 sm:w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">
                  <strong>BUY ONE AREA GET ONE FREE - FOR 3 ISSUES</strong> — double the number of homes you reach!
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 sm:h-5 sm:w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold">FREE EDITORIAL</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 sm:h-5 sm:w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold leading-relaxed">FREE PREMIUM POSITION UPGRADE (only available on full page)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 sm:h-5 sm:w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold">FREE ADVERT DESIGN</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="default"
              onClick={handleFixedTermContinue}
              className="bg-green-600 hover:bg-green-700 text-white w-full h-12 text-base font-semibold"
            >
              YES, CONTINUE
            </Button>
            <Button
              variant="outline"
              onClick={handleContinueWithFixedTerm}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 w-full h-12 text-base font-medium"
            >
              No, continue with fixed term
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default AdvertisingStepForm;