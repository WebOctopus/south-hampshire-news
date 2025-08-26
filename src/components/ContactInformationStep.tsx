import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStepForm } from './StepForm';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletAreas, useLeafletSizes, useLeafletCampaignDurations } from '@/hooks/useLeafletData';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

interface ContactInformationStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  pricingBreakdown: any;
}

export const ContactInformationStep: React.FC<ContactInformationStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedAdSize,
  selectedDuration,
  pricingBreakdown
}) => {
  const { toast } = useToast();
  const { nextStep } = useStepForm();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
  });
  
  const [submitting, setSubmitting] = useState(false);

  const { durations, subscriptionDurations } = usePricingData();
  const { data: leafletDurations } = useLeafletCampaignDurations();

  const effectiveSelectedAreas = pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;

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
                                pricingModel === 'bogof' ? subscriptionDurations : durations;
      const durationData = relevantDurations?.find(d => d.id === selectedDuration);
      const durationDiscountPercent = pricingModel === 'leafleting' ? 0 : (durationData as any)?.discount_percentage || 0;
      const subtotalAfterVolume = pricingBreakdown?.subtotal ? pricingBreakdown.subtotal - (pricingBreakdown.volumeDiscount || 0) : 0;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

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
        user_id: user?.id || null
      };

      const { error } = await supabase.from('quote_requests').insert(payload);
      if (error) throw error;
      
      toast({
        title: "Quote Request Sent!",
        description: "Our sales team will contact you within 24 hours to discuss your advertising needs.",
      });
      
      nextStep(); // Move to completion step
    } catch (err: any) {
      console.error('Submit quote error:', err);
      toast({ title: "Error", description: err.message || 'Failed to submit quote request.', variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Contact Information</h2>
        <p className="text-muted-foreground">
          Complete your details to receive your quote
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Details</h3>
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
              <div className="md:col-span-2">
                <Label htmlFor="password">Create Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 6 characters"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This password will be used to access your dashboard and saved quotes.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleGetQuote}
              className="px-8"
              disabled={submitting || !formData.name || !formData.email || effectiveSelectedAreas.length === 0 || !selectedAdSize || !selectedDuration}
            >
              {submitting ? "Sending..." : "Get My Quote"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInformationStep;