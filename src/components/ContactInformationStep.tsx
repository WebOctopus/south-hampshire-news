import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


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
  onSaveQuote
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    companySector: "",
    email: "",
    phone: "",
    invoiceAddress: "",
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
            </form>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInformationStep;