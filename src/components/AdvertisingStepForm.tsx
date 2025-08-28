import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import StepForm from '@/components/StepForm';
import PricingOptionsStep from '@/components/PricingOptionsStep';
import CalculatorStepForm from '@/components/CalculatorStepForm';
import ContactInformationStep from '@/components/ContactInformationStep';
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
  const { durations, subscriptionDurations } = usePricingData();
  const { data: leafletDurations } = useLeafletCampaignDurations();
  
  const [selectedPricingModel, setSelectedPricingModel] = useState<'fixed' | 'bogof' | 'leafleting'>('fixed');
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
  const [showFixedTermConfirmation, setShowFixedTermConfirmation] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<(() => void) | null>(null);

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'leafleting') => {
    console.log('Selected pricing option:', option);
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
    setShowFixedTermConfirmation(false);
    setSelectedPricingModel('bogof');
    setPendingNextStep(null);
    toast({
      title: "Switched to 3+ Repeat Package",
      description: "You've been switched to our subscription model with better value!",
    });
  };

  const handleStepTransition = (currentStep: number, nextStep: () => void) => {
    // Intercept transition from calculator (step 1) to contact (step 2) for Fixed Term
    if (currentStep === 1 && selectedPricingModel === 'fixed' && campaignData.pricingBreakdown) {
      setPendingNextStep(() => nextStep);
      setShowFixedTermConfirmation(true);
      return; // Don't proceed to next step yet
    }
    nextStep(); // Proceed normally for other cases
  };

  const handleContactInfoSave = async () => {
    console.log('handleContactInfoSave called');
    
    // Get form data from the contact form
    const contactFormElement = document.querySelector('form') as HTMLFormElement;
    if (!contactFormElement) {
      console.error('No form element found');
      return;
    }

    const formData = new FormData(contactFormElement);
    console.log('Form data entries:', Array.from(formData.entries()));
    
    const contactData = {
      firstName: formData.get('firstName') as string || '',
      lastName: formData.get('lastName') as string || '',
      email: formData.get('email') as string || '',
      phone: formData.get('phone') as string || '',
      companyName: formData.get('companyName') as string || '',
      companySector: formData.get('companySector') as string || '',
      invoiceAddress: formData.get('invoiceAddress') as string || '',
      businessType: formData.get('businessType') as string || 'company',
      password: formData.get('password') as string || '',
    };

    console.log('Parsed contact data:', contactData);

    const effectiveSelectedAreas = selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : campaignData.selectedAreas;

    // Validation
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      throw new Error('Missing required fields');
    }

    if (contactData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      throw new Error('Password too short');
    }

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

    if (authError && authError.message !== 'User already registered') {
      throw authError;
    }

    // If user already exists, sign them in
    if (authError?.message === 'User already registered') {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: contactData.email,
        password: contactData.password,
      });
      
      if (signInError) {
        throw new Error('User already exists with this email. Please use a different email or sign in with your existing password.');
      }
    }

    // Get the user ID (either from sign up or sign in)
    const userId = authData?.user?.id || (await supabase.auth.getUser()).data.user?.id;

    if (!userId) {
      throw new Error('Failed to create or authenticate user');
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
    if (quoteError) throw quoteError;

    // Also save to quote_requests table for admin tracking
    const requestPayload = {
      ...quotePayload,
      user_id: userId
    };
    
    const { error: requestError } = await supabase.from('quote_requests').insert(requestPayload);
    if (requestError) throw requestError;
    
    toast({
      title: "Quote Saved Successfully!",
      description: "Your quote has been saved to your dashboard. You can access it anytime!",
    });

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const stepLabels = {
    nextButtonLabels: ['Select Campaign Details', 'Enter Contact Info', 'Save My Quote'],
    prevButtonLabel: 'Previous Step',
    onLastStepNext: handleContactInfoSave,
    onStepTransition: handleStepTransition
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
              
              <CalculatorStepForm 
                pricingModel={selectedPricingModel} 
                onDataChange={handleCampaignDataChange}
                initialData={campaignData}
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
              />
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600">Quote Submitted!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thank you for your quote request. Our sales team will contact you within 24 hours to discuss your advertising needs.
                </p>
              </div>
            </StepForm>
          </DialogContent>
        </Dialog>
      ) : (
        <StepForm stepLabels={stepLabels}>
          <PricingOptionsStep onSelectOption={handleSelectOption} />
          
          <CalculatorStepForm 
            pricingModel={selectedPricingModel} 
            onDataChange={handleCampaignDataChange}
            initialData={campaignData}
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
        />
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600">Quote Submitted!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thank you for your quote request. Our sales team will contact you within 24 hours to discuss your advertising needs.
            </p>
          </div>
        </StepForm>
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