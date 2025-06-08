
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SpecialOfferFormProps {
  children: React.ReactNode;
}

const SpecialOfferForm = ({ children }: SpecialOfferFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: '',
    businessType: '',
    adSize: '',
    previousAdvertising: '',
    goals: '',
    additionalInfo: ''
  });

  const businessTypes = [
    { id: 'retail', label: 'Retail/Shop' },
    { id: 'restaurant', label: 'Restaurant/Food Service' },
    { id: 'healthcare', label: 'Healthcare/Medical' },
    { id: 'professional', label: 'Professional Services' },
    { id: 'home-services', label: 'Home Services' },
    { id: 'fitness', label: 'Fitness/Wellness' },
    { id: 'other', label: 'Other' }
  ];

  const adSizes = [
    { id: '1/8-page', label: '1/8 Page' },
    { id: '1/4-page', label: '1/4 Page' },
    { id: '1/2-page', label: '1/2 Page' },
    { id: 'full-page', label: 'Full Page' }
  ];

  const previousAdvertisingOptions = [
    { id: 'never', label: 'Never advertised before' },
    { id: 'local-papers', label: 'Local newspapers' },
    { id: 'online-only', label: 'Online advertising only' },
    { id: 'magazines', label: 'Other magazines' },
    { id: 'multiple', label: 'Multiple channels' }
  ];

  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.emailAddress || !formData.phoneNumber || !formData.businessType || !formData.adSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would integrate with your payment gateway
      // For now, we'll simulate the payment process
      toast({
        title: "Processing Payment",
        description: "Redirecting to payment gateway...",
      });

      // Simulate API call delay
      setTimeout(() => {
        // In a real implementation, you would redirect to Stripe or your payment provider
        window.open('https://checkout.stripe.com/pay/cs_test_placeholder', '_blank');
      }, 1000);

    } catch (error) {
      toast({
        title: "Payment Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-community-navy">
            Special Offer - £999 All Areas Package
          </DialogTitle>
          <p className="text-community-green font-bold text-lg">
            Save £500+ with our exclusive all-areas advertising package!
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Business Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">What type of business do you have? *</Label>
                  <RadioGroup
                    value={formData.businessType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
                  >
                    {businessTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label htmlFor={type.id} className="cursor-pointer">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Preferred Advertisement Size *</Label>
                  <RadioGroup
                    value={formData.adSize}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, adSize: value }))}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
                  >
                    {adSizes.map((size) => (
                      <div key={size.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={size.id} id={size.id} />
                        <Label htmlFor={size.id} className="cursor-pointer">
                          {size.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Previous Advertising Experience</Label>
                  <RadioGroup
                    value={formData.previousAdvertising}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, previousAdvertising: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                  >
                    {previousAdvertisingOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="goals">What are your main advertising goals?</Label>
                  <Input
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="e.g., Increase brand awareness, Generate leads, Drive website traffic"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Input
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Any special requirements or questions?"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Summary */}
          <Card className="bg-community-green/10 border-community-green">
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Package Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-medium">All 12 Distribution Areas</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Circulation:</span>
                  <span className="font-medium">158,000 homes</span>
                </div>
                <div className="flex justify-between">
                  <span>Campaign Duration:</span>
                  <span className="font-medium">3 Months (6 editions)</span>
                </div>
                <div className="flex justify-between">
                  <span>Ad Size:</span>
                  <span className="font-medium">
                    {formData.adSize ? adSizes.find(s => s.id === formData.adSize)?.label : 'To be selected'}
                  </span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between text-xl font-bold text-community-navy">
                    <span>Special Offer Price:</span>
                    <span className="text-community-green">£999</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Regular price would be £1,500+ - Save over £500!
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  onClick={handlePayment}
                  className="w-full bg-community-green hover:bg-green-600 text-lg py-6"
                  disabled={!formData.fullName || !formData.emailAddress || !formData.phoneNumber || !formData.businessType || !formData.adSize}
                >
                  Proceed to Payment - £999
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Secure payment processing via Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpecialOfferForm;
