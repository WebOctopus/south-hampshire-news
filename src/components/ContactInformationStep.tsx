import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


interface ContactInformationStepProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  selectedAreas: string[];
  bogofPaidAreas: string[];
  bogofFreeAreas: string[];
  selectedAdSize: string;
  selectedDuration: string;
  pricingBreakdown: any;
  onSaveQuote: (formData: FormData) => Promise<void>;
}

interface FormData {
  businessType: 'company' | 'sole-trader';
  name: string;
  email: string;
  phone: string;
  company: string;
  tradingName: string;
  password: string;
}

export const ContactInformationStep: React.FC<ContactInformationStepProps> = ({
  onSaveQuote
}) => {
  const [formData, setFormData] = useState<FormData>({
    businessType: "company",
    name: "",
    email: "",
    phone: "",
    company: "",
    tradingName: "",
    password: "",
  });

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
              {/* Business Type Selection */}
              <div className="space-y-3 mb-6">
                <Label className="text-base font-medium">Business Type *</Label>
                <RadioGroup
                  value={formData.businessType}
                  onValueChange={(value: 'company' | 'sole-trader') => 
                    setFormData(prev => ({ ...prev, businessType: value }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company">Company</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sole-trader" id="sole-trader" />
                    <Label htmlFor="sole-trader">Sole Trader</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Conditional Name/Company Fields */}
                {formData.businessType === 'sole-trader' ? (
                  <div className="md:col-span-2">
                    <Label htmlFor="tradingName">Full Name trading as Business Name *</Label>
                    <Input
                      id="tradingName"
                      name="tradingName"
                      value={formData.tradingName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tradingName: e.target.value }))}
                      placeholder="e.g. John Smith trading as Smith's Services"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Enter your company name"
                      />
                    </div>
                  </>
                )}
                
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
            </form>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInformationStep;