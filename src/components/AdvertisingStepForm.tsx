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

export const AdvertisingStepForm: React.FC = () => {
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

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'leafleting') => {
    console.log('Selected pricing option:', option);
    setSelectedPricingModel(option);
  };

  const handleCampaignDataChange = (data: any) => {
    setCampaignData(data);
  };

  const handleSaveQuote = async (formData: any) => {
    const effectiveSelectedAreas = selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : campaignData.selectedAreas;

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

    if (!campaignData.selectedAdSize) {
      toast({
        title: "No Ad Size Selected",
        description: "Please select an advertisement size.",
        variant: "destructive",
      });
      return;
    }

    if (!campaignData.selectedDuration) {
      toast({
        title: "No Duration Selected",
        description: "Please select a campaign duration.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // First, try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: formData.name,
            phone: formData.phone || '',
            company: formData.company || ''
          }
        }
      });

      if (authError && authError.message !== 'User already registered') {
        throw authError;
      }

      // If user already exists, sign them in
      if (authError?.message === 'User already registered') {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) {
          throw new Error('User already exists with this email. Please use a different email or sign in with your existing password.');
        }
      }

      const relevantDurations = selectedPricingModel === 'leafleting' ? leafletDurations : 
                                selectedPricingModel === 'bogof' ? subscriptionDurations : durations;
      const durationData = relevantDurations?.find(d => d.id === campaignData.selectedDuration);
      const durationDiscountPercent = selectedPricingModel === 'leafleting' ? 0 : (durationData as any)?.discount_percentage || 0;
      const subtotalAfterVolume = campaignData.pricingBreakdown?.subtotal ? campaignData.pricingBreakdown.subtotal - (campaignData.pricingBreakdown.volumeDiscount || 0) : 0;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

      // Get the user ID (either from sign up or sign in)
      const userId = authData?.user?.id || (await supabase.auth.getUser()).data.user?.id;

      if (!userId) {
        throw new Error('Failed to create or authenticate user');
      }

      // Save to quotes table (user's saved quotes)
      const quotePayload = {
        user_id: userId,
        contact_name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        title: `${selectedPricingModel === 'fixed' ? 'Fixed Term' : selectedPricingModel === 'bogof' ? '3+ Repeat Package' : 'Leafleting'} Quote`,
        pricing_model: selectedPricingModel,
        ad_size_id: campaignData.selectedAdSize,
        duration_id: campaignData.selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: selectedPricingModel === 'bogof' ? campaignData.bogofPaidAreas : [],
        bogof_free_area_ids: selectedPricingModel === 'bogof' ? campaignData.bogofFreeAreas : [],
        monthly_price: monthlyFinal,
        subtotal: campaignData.pricingBreakdown?.subtotal || 0,
        final_total: campaignData.pricingBreakdown?.finalTotal || 0,
        duration_multiplier: campaignData.pricingBreakdown?.durationMultiplier || 1,
        total_circulation: campaignData.pricingBreakdown?.totalCirculation || 0,
        volume_discount_percent: campaignData.pricingBreakdown?.volumeDiscountPercent || 0,
        duration_discount_percent: durationDiscountPercent,
        pricing_breakdown: JSON.parse(JSON.stringify(campaignData.pricingBreakdown || {})) as any,
        selections: {
          pricingModel: selectedPricingModel,
          selectedAdSize: campaignData.selectedAdSize,
          selectedDuration: campaignData.selectedDuration,
          selectedAreas: campaignData.selectedAreas,
          bogofPaidAreas: campaignData.bogofPaidAreas,
          bogofFreeAreas: campaignData.bogofFreeAreas,
          selectedMonths: campaignData.selectedMonths
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
      
    } catch (err: any) {
      console.error('Save quote error:', err);
      toast({ 
        title: "Error", 
        description: err.message || 'Failed to save quote. Please try again.', 
        variant: "destructive" 
      });
      throw err; // Re-throw to prevent step progression
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = {
    nextButtonLabels: [
      'Continue to Campaign Setup',
      'Continue to Contact Information',
      submitting ? 'Saving...' : 'Save My Quote'
    ],
    prevButtonLabel: 'Previous Step',
    onLastStepNext: handleSaveQuote
  };

  return (
    <StepForm stepLabels={stepLabels}>
      <PricingOptionsStep onSelectOption={handleSelectOption} />
      
      <CalculatorStepForm 
        pricingModel={selectedPricingModel} 
        onDataChange={handleCampaignDataChange}
      />
      
      <ContactInformationStep
        pricingModel={selectedPricingModel}
        selectedAreas={campaignData.selectedAreas}
        bogofPaidAreas={campaignData.bogofPaidAreas}
        bogofFreeAreas={campaignData.bogofFreeAreas}
        selectedAdSize={campaignData.selectedAdSize}
        selectedDuration={campaignData.selectedDuration}
        pricingBreakdown={campaignData.pricingBreakdown}
        onSaveQuote={handleSaveQuote}
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
  );
};

export default AdvertisingStepForm;