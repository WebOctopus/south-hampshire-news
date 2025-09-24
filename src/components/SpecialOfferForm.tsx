
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

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
    additionalInfo: '',
    artworkOption: '',
    uploadedFile: null as File | null
  });

  const businessTypes = [
    { id: 'retail', label: 'Retail/Shop' },
    { id: 'restaurant', label: 'Restaurant/Food Service' },
    { id: 'healthcare', label: 'Healthcare/Medical' },
    { id: 'professional', label: 'Professional Services' },
    { id: 'home-services', label: 'Home Services' },
    { id: 'fitness', label: 'Fitness/Wellness' },
    { id: 'plumber', label: 'Plumber' },
    { id: 'electrician', label: 'Electrician' },
    { id: 'builder', label: 'Builder/Construction' },
    { id: 'gardener', label: 'Gardener/Landscaper' },
    { id: 'decorator', label: 'Painter/Decorator' },
    { id: 'roofer', label: 'Roofer' },
    { id: 'mechanic', label: 'Mechanic/Auto Services' },
    { id: 'cleaner', label: 'Cleaning Services' },
    { id: 'heating', label: 'Heating/Gas Engineer' },
    { id: 'carpenter', label: 'Carpenter/Joiner' },
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

  const artworkOptions = [
    { id: 'upload', label: 'I will upload my own artwork' },
    { id: 'design-service', label: 'Have Discover Magazines create my advert (+£35)' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image (JPG, PNG, GIF, SVG) or PDF file",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, uploadedFile: file }));
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = 999;
    if (formData.artworkOption === 'design-service') {
      basePrice += 35;
    }
    return basePrice;
  };

  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.emailAddress || !formData.phoneNumber || !formData.businessType || !formData.adSize || !formData.artworkOption) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    // Validate artwork requirements
    if (formData.artworkOption === 'upload' && !formData.uploadedFile) {
      toast({
        title: "Artwork Required",
        description: "Please upload your artwork file or choose our design service",
        variant: "destructive"
      });
      return;
    }

    try {
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

          {/* Artwork Options */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Artwork & Design Options *
              </h3>
              <div className="space-y-4">
                <RadioGroup
                  value={formData.artworkOption}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, artworkOption: value, uploadedFile: value === 'design-service' ? null : prev.uploadedFile }))}
                  className="space-y-4"
                >
                  {artworkOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer text-base">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {formData.artworkOption === 'upload' && (
                  <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="artwork-upload" className="cursor-pointer">
                          <span className="text-community-green font-medium hover:underline">
                            Click to upload your artwork
                          </span>
                        </Label>
                        <Input
                          id="artwork-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Accepted formats: JPG, PNG, GIF, SVG, PDF (Max 10MB)
                        </p>
                        {formData.uploadedFile && (
                          <p className="text-sm text-community-green font-medium mt-2">
                            ✓ {formData.uploadedFile.name} uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {formData.artworkOption === 'design-service' && (
                  <div className="mt-4 p-4 bg-community-green/10 border border-community-green rounded-lg">
                    <h4 className="font-medium text-community-navy mb-2">Professional Design Service</h4>
                    <p className="text-sm text-gray-600">
                      Our experienced design team will create a professional, eye-catching advertisement for your business. 
                      We'll work with you to ensure the design matches your brand and messaging perfectly.
                    </p>
                    <p className="text-sm font-bold text-community-green mt-2">
                      Additional cost: £35
                    </p>
                  </div>
                )}
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
                  <span className="font-medium">142,000 homes</span>
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
                <div className="flex justify-between">
                  <span>Artwork:</span>
                  <span className="font-medium">
                    {formData.artworkOption === 'upload' ? 'Customer Provided' : 
                     formData.artworkOption === 'design-service' ? 'Professional Design (+£35)' : 
                     'To be selected'}
                  </span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between">
                    <span>Base Package:</span>
                    <span>£999</span>
                  </div>
                  {formData.artworkOption === 'design-service' && (
                    <div className="flex justify-between">
                      <span>Design Service:</span>
                      <span>£35</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-community-navy mt-2">
                    <span>Total Price:</span>
                    <span className="text-community-green">£{calculateTotalPrice()}</span>
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
                  disabled={!formData.fullName || !formData.emailAddress || !formData.phoneNumber || !formData.businessType || !formData.adSize || !formData.artworkOption || (formData.artworkOption === 'upload' && !formData.uploadedFile)}
                >
                  Proceed to Payment - £{calculateTotalPrice()}
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
