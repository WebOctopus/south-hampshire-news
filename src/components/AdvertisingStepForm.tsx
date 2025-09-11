import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StepForm from '@/components/StepForm';
import PricingOptionsStep from '@/components/PricingOptionsStep';
import AreaAndScheduleStep from '@/components/AreaAndScheduleStep';
import AdvertisementSizeStep from '@/components/AdvertisementSizeStep';
import ContactInformationStep from '@/components/ContactInformationStep';
import { SalesAssistantPopup } from '@/components/SalesAssistantPopup';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletCampaignDurations } from '@/hooks/useLeafletData';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AdvertisingStepFormProps {
  children?: React.ReactNode;
  asDialog?: boolean;
}

export const AdvertisingStepForm: React.FC<AdvertisingStepFormProps> = ({ children, asDialog = false }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { durations, subscriptionDurations } = usePricingData();
  const { data: leafletDurations } = useLeafletCampaignDurations();
  
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
    pricingBreakdown: null as any
  });
  const [submitting, setSubmitting] = useState(false);

  // Debug: Track campaign data changes
  React.useEffect(() => {
    console.log('AdvertisingStepForm - Campaign data updated:', campaignData);
    if (campaignData.pricingBreakdown) {
      console.log('AdvertisingStepForm - Has pricing breakdown:', campaignData.pricingBreakdown);
    } else {
      console.log('AdvertisingStepForm - No pricing breakdown yet');
    }
  }, [campaignData]);
  const [showFixedTermConfirmation, setShowFixedTermConfirmation] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<(() => void) | null>(null);

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'leafleting') => {
    
    setSelectedPricingModel(option);
  };

  const handleCampaignDataChange = (data: any) => {
    setCampaignData(data);
  };

  const handleFixedTermContinue = () => {
    // Switch to BOGOF and transfer selections
    setSelectedPricingModel('bogof');
    setCampaignData(prev => ({
      ...prev,
      bogofPaidAreas: prev.selectedAreas, // Transfer current selections as paid areas
      bogofFreeAreas: [] // Reset free areas so user can select them
    }));
    
    setShowFixedTermConfirmation(false);
    setPendingNextStep(null);
    
    toast({
      title: "Switched to 3+ Repeat Package!",
      description: "Your selections have been transferred. Now select your FREE areas!",
    });
  };

  const handleSwitchToSubscription = () => {
    // Switch to BOGOF and transfer selections
    setSelectedPricingModel('bogof');
    setCampaignData(prev => ({
      ...prev,
      bogofPaidAreas: prev.selectedAreas, // Transfer current selections as paid areas
      bogofFreeAreas: [] // Reset free areas so user can select them
    }));
    
    setShowFixedTermConfirmation(false);
    setPendingNextStep(null);
    toast({
      title: "Switched to 3+ Repeat Package",
      description: "Your selections have been transferred. Now select your FREE areas!",
    });
  };

  const handleStepTransition = (currentStep: number, nextStep: () => void) => {
    // Intercept transition from advert size step (step 2) to contact (step 3) for Fixed Term
    if (currentStep === 2 && selectedPricingModel === 'fixed' && campaignData.pricingBreakdown) {
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

      // Save to quotes table (user's saved quotes)
      const quotePayload = {
        user_id: userId,
        contact_name: fullName,
        email: contactData.email,
        phone: contactData.phone || '',
        company: contactData.companyName || '',
        title: `${selectedPricingModel === 'fixed' ? 'Fixed Term' : selectedPricingModel === 'bogof' ? '3+ Repeat Package' : 'Leafleting'} Quote`,
        pricing_model: selectedPricingModel,
        ad_size_id: campaignData.selectedAdSize,
        duration_id: campaignData.selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : [],
        bogof_free_area_ids: selectedPricingModel === 'bogof' ? campaignData.bogofFreeAreas : [],
        monthly_price: campaignData.pricingBreakdown?.finalTotal || 0,
        subtotal: campaignData.pricingBreakdown?.subtotal || 0,
        final_total: campaignData.pricingBreakdown?.finalTotal || 0,
        duration_multiplier: campaignData.pricingBreakdown?.durationMultiplier || 1,
        total_circulation: campaignData.pricingBreakdown?.totalCirculation || 0,
        volume_discount_percent: campaignData.pricingBreakdown?.volumeDiscountPercent || 0,
        duration_discount_percent: campaignData.pricingBreakdown?.durationDiscountPercent || 0,
        pricing_breakdown: JSON.parse(JSON.stringify(campaignData.pricingBreakdown || {})) as any,
        selections: {
          pricingModel: selectedPricingModel,
          selectedAdSize: campaignData.selectedAdSize,
          selectedDuration: campaignData.selectedDuration,
          selectedAreas: campaignData.selectedAreas,
          bogofPaidAreas: campaignData.bogofPaidAreas,
          bogofFreeAreas: campaignData.bogofFreeAreas,
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

      // Create booking record
      const bookingPayload = {
        user_id: userId,
        contact_name: fullName,
        email: contactData.email,
        phone: contactData.phone || '',
        company: contactData.companyName || '',
        title: `${selectedPricingModel === 'fixed' ? 'Fixed Term' : selectedPricingModel === 'bogof' ? '3+ Repeat Package' : 'Leafleting'} Booking`,
        pricing_model: selectedPricingModel,
        ad_size_id: campaignData.selectedAdSize,
        duration_id: campaignData.selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : [],
        bogof_free_area_ids: selectedPricingModel === 'bogof' ? campaignData.bogofFreeAreas : [],
        monthly_price: campaignData.pricingBreakdown?.finalTotal || 0,
        subtotal: campaignData.pricingBreakdown?.subtotal || 0,
        final_total: campaignData.pricingBreakdown?.finalTotal || 0,
        duration_multiplier: campaignData.pricingBreakdown?.durationMultiplier || 1,
        total_circulation: campaignData.pricingBreakdown?.totalCirculation || 0,
        volume_discount_percent: campaignData.pricingBreakdown?.volumeDiscountPercent || 0,
        duration_discount_percent: campaignData.pricingBreakdown?.durationDiscountPercent || 0,
        pricing_breakdown: JSON.parse(JSON.stringify(campaignData.pricingBreakdown || {})) as any,
        selections: {
          pricingModel: selectedPricingModel,
          selectedAdSize: campaignData.selectedAdSize,
          selectedDuration: campaignData.selectedDuration,
          selectedAreas: campaignData.selectedAreas,
          bogofPaidAreas: campaignData.bogofPaidAreas,
          bogofFreeAreas: campaignData.bogofFreeAreas,
          ...campaignData
        } as any,
        status: 'pending'
      };

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

      if (bookingError) {
        console.error('Booking save error:', bookingError);
        toast({
          title: "Error Creating Booking",
          description: "Failed to create booking. Please try again.",
          variant: "destructive",
        });
        return;
      }

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
        title: isNewUser ? "Account Created & Booking Submitted!" : "Booking Submitted Successfully!",
        description: isNewUser 
          ? "Welcome! Your account has been created and your booking is being processed. Redirecting to your dashboard..." 
          : "Your booking has been submitted and is being processed. Redirecting to your dashboard...",
      });

      // Wait for authentication to complete and then navigate
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
    nextButtonLabels: ['Select Areas & Publication Schedule', 'Choose Advertisement Size', 'Contact Information', 'Save My Quote'],
    prevButtonLabel: 'Previous Step',
    onLastStepNext: () => Promise.resolve(), // Dummy function since we use the global handler
    onStepTransition: (currentStepIndex: number, nextStep: () => void) => {
      // Update current step for sales assistant
      setCurrentStep(currentStepIndex + 1); // Convert 0-indexed to 1-indexed
      
      // Store navigation functions for sales assistant
      setStepFormRef({
        nextStep,
        prevStep: () => {
          if (currentStepIndex > 0) {
            setCurrentStep(currentStepIndex); // Go back one step
          }
        }
      });
      
      handleStepTransition(currentStepIndex, nextStep);
    }
  };

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
          <StepForm stepLabels={stepLabels}>
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
            />
            
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
            />
            
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
            />
          </StepForm>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="relative">
          <StepForm stepLabels={stepLabels}>
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
            />
            
            <AdvertisementSizeStep
              selectedAdSize={campaignData.selectedAdSize}
              onAdSizeChange={(adSize) => setCampaignData(prev => ({ ...prev, selectedAdSize: adSize }))}
              pricingModel={selectedPricingModel}
              selectedAreas={campaignData.selectedAreas}
              bogofPaidAreas={campaignData.bogofPaidAreas}
              bogofFreeAreas={campaignData.bogofFreeAreas}
              selectedDuration={campaignData.selectedDuration}
              onPricingChange={(breakdown) => {
                console.log('AdvertisingStepForm - Pricing breakthrough received:', breakdown);
                setCampaignData(prev => ({ ...prev, pricingBreakdown: breakdown }));
              }}
              showSummary={true}
              onNext={() => {}}
            />
            
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
            />
          </StepForm>
          
          <SalesAssistantPopup 
            currentStep={currentStep}
            totalSteps={4}
            onNextStep={stepFormRef?.nextStep}
            onPrevStep={stepFormRef?.prevStep}
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
          />
        </div>
      )}

      {/* Fixed Term Confirmation Dialog */}
      <Dialog open={showFixedTermConfirmation} onOpenChange={setShowFixedTermConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Are you sure you want to book Fixed Term?
            </DialogTitle>
            <DialogDescription className="text-center">
              If you booked this selection on our 3+ Repeat Package you would pay{" "}
              <span className="font-bold text-green-600">
                £{campaignData.pricingBreakdown?.finalTotal ? Math.round(campaignData.pricingBreakdown.finalTotal * 0.85) : 144} + vat (£{campaignData.pricingBreakdown?.finalTotal ? Math.round(campaignData.pricingBreakdown.finalTotal * 0.85 * 1.2) : 172.80})
              </span>{" "}
              per month for minimum of six months INCLUDING
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-6">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>2 x EXTRA AREAS—FREE FOR 3 ISSUES—double the number of homes you reach!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>FREE EDITORIAL</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>FREE PREMIUM POSITION UPGRADE</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>FREE ADVERT DESIGN</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              onClick={handleFixedTermContinue}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              YES, CONTINUE
            </Button>
            <Button
              variant="outline"
              onClick={handleSwitchToSubscription}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 px-6"
            >
              NO, SWITCH TO SUBSCRIPTION, PLEASE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default AdvertisingStepForm;