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
  onSaveQuote: (formData: FormData) => Promise<void>;
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
  campaignData,
  onSaveQuote
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
      await onSaveQuote(formData);
    } catch (error) {
      console.error('Error saving quote:', error);
      // Error handling is done in parent component
    } finally {
      setSubmitting(false);
    }
  };

  // Expose the handleSaveQuote function to parent component
  React.useEffect(() => {
    (window as any).handleContactFormSave = handleSaveQuote;
    return () => {
      delete (window as any).handleContactFormSave;
    };
  }, [handleSaveQuote]);

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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This password will be used to access your dashboard and saved quotes.
                  </p>
                </div>
                </div>
              </div>
            </form>
          </div>

        </CardContent>
      </Card>
      
      {submitting && (
        <div className="text-center">
          <p className="text-muted-foreground">Saving your quote and creating your account...</p>
        </div>
      )}
    </div>
  );
};

export default ContactInformationStep;