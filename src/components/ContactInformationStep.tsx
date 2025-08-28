import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';


interface ContactInformationStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  pricingBreakdown: any;
  campaignData: any;
}

interface FormData {
  businessType: 'sole_trader' | 'company';
  firstName: string;
  lastName: string;
  companyName: string;
  companySector: string;
  email: string;
  phone: string;
  invoiceAddress: string;
  password: string;
}

export const ContactInformationStep: React.FC<ContactInformationStepProps> = ({
  pricingModel,
  selectedAreas,
  bogofPaidAreas,
  bogofFreeAreas,
  selectedAdSize,
  selectedDuration,
  pricingBreakdown,
  campaignData
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessType: 'company',
    firstName: "",
    lastName: "",
    companyName: "",
    companySector: "",
    email: "",
    phone: "",
    invoiceAddress: "",
    password: "",
  });

  const handleSaveQuote = async () => {
    const effectiveSelectedAreas = pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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

    setSubmitting(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // First, try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: fullName,
            phone: formData.phone || '',
            company: formData.companyName || ''
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

      // Get the user ID (either from sign up or sign in)
      const userId = authData?.user?.id || (await supabase.auth.getUser()).data.user?.id;

      if (!userId) {
        throw new Error('Failed to create or authenticate user');
      }

      // Save to quotes table (user's saved quotes)
      const quotePayload = {
        user_id: userId,
        contact_name: fullName,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.companyName || '',
        title: `${pricingModel === 'fixed' ? 'Fixed Term' : pricingModel === 'bogof' ? '3+ Repeat Package' : 'Leafleting'} Quote`,
        pricing_model: pricingModel,
        ad_size_id: selectedAdSize,
        duration_id: selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : [],
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : [],
        monthly_price: pricingBreakdown?.finalTotal || 0,
        subtotal: pricingBreakdown?.subtotal || 0,
        final_total: pricingBreakdown?.finalTotal || 0,
        duration_multiplier: pricingBreakdown?.durationMultiplier || 1,
        total_circulation: pricingBreakdown?.totalCirculation || 0,
        volume_discount_percent: pricingBreakdown?.volumeDiscountPercent || 0,
        duration_discount_percent: pricingBreakdown?.durationDiscountPercent || 0,
        pricing_breakdown: JSON.parse(JSON.stringify(pricingBreakdown || {})) as any,
        selections: {
          pricingModel,
          selectedAdSize,
          selectedDuration,
          selectedAreas,
          bogofPaidAreas,
          bogofFreeAreas,
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

      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Save quote error:', err);
      toast({ 
        title: "Error", 
        description: err.message || 'Failed to save quote. Please try again.', 
        variant: "destructive" 
      });
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
            <form>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Business Type *</Label>
                  <RadioGroup
                    value={formData.businessType}
                    onValueChange={(value: 'sole_trader' | 'company') => 
                      setFormData(prev => ({ ...prev, businessType: value }))
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company">Company</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sole_trader" id="sole_trader" />
                      <Label htmlFor="sole_trader">Sole Trader</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="companySector">Company Sector *</Label>
                  <Input
                    id="companySector"
                    name="companySector"
                    value={formData.companySector}
                    onChange={(e) => setFormData(prev => ({ ...prev, companySector: e.target.value }))}
                    placeholder="Enter your company sector"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
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
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="invoiceAddress">Invoice Address *</Label>
                  <Input
                    id="invoiceAddress"
                    name="invoiceAddress"
                    value={formData.invoiceAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceAddress: e.target.value }))}
                    placeholder="Enter your invoice address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="password">Create Password *</Label>
                  <Input
                    id="password"
                    name="password"
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
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSaveQuote}
                  disabled={submitting}
                  size="lg"
                  className="px-8"
                >
                  {submitting ? "Saving Quote..." : "Save My Quote"}
                </Button>
              </div>
            </form>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInformationStep;