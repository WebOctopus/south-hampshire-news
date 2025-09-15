import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';


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
  onBookNow?: (formData: FormData) => Promise<void>;
}

interface FormData {
  businessType: 'sole_trader' | 'company';
  firstName: string;
  lastName: string;
  companyName: string;
  companySector: string;
  email: string;
  phone: string;
  postcode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  password: string;
  voucherCode?: string;
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
  onSaveQuote,
  onBookNow
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
    postcode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    password: "",
    voucherCode: "",
  });
  
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  const businessSectors = [
    "Accounting & Finance",
    "Advertising & Marketing", 
    "Architecture & Construction",
    "Arts & Entertainment",
    "Automotive",
    "Beauty & Wellness",
    "Consulting",
    "Education & Training",
    "Engineering",
    "Food & Beverage",
    "Healthcare & Medical",
    "Hospitality & Tourism",
    "Information Technology",
    "Legal Services",
    "Manufacturing",
    "Non-profit",
    "Real Estate",
    "Retail & E-commerce",
    "Sports & Recreation",
    "Transportation & Logistics",
    "Other"
  ];

  const handleApplyVoucher = async () => {
    if (!formData.voucherCode?.trim()) {
      toast({
        title: "Invalid Voucher",
        description: "Please enter a voucher code.",
        variant: "destructive"
      });
      return;
    }

    setVoucherLoading(true);

    try {
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('voucher_code', formData.voucherCode.toUpperCase())
        .eq('service_type', 'leafleting')
        .eq('is_active', true)
        .eq('is_used', false)
        .single();

      if (error || !voucher) {
        toast({
          title: "Invalid Voucher",
          description: "Voucher code not found or expired.",
          variant: "destructive"
        });
        return;
      }

      // Check if voucher is expired
      if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
        toast({
          title: "Expired Voucher",
          description: "This voucher code has expired.",
          variant: "destructive"
        });
        return;
      }

      setAppliedVoucher(voucher);
      toast({
        title: "Voucher Applied!",
        description: `${voucher.voucher_type === 'percentage' ? voucher.discount_value + '% off' : '£' + voucher.discount_value + ' off'} applied to your order.`
      });

    } catch (error: any) {
      console.error('Error applying voucher:', error);
      toast({
        title: "Error",
        description: "Failed to apply voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setFormData(prev => ({ ...prev, voucherCode: '' }));
    toast({
      title: "Voucher Removed",
      description: "Voucher discount has been removed."
    });
  };

  // Enhanced postcode lookup function
  const handlePostcodeLookup = async () => {
    if (!formData.postcode) {
      toast({
        title: "No Postcode Entered",
        description: "Please enter a postcode to lookup addresses.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAddress(true);
    try {
      // First try postcodes.io for basic info
      const response = await fetch(`https://api.postcodes.io/postcodes/${formData.postcode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          // Populate available address information
          const district = data.result.admin_district || '';
          const ward = data.result.admin_ward || '';
          const region = data.result.region || '';
          
          // Create a more comprehensive address line 2 with available location info
          let addressLine2 = '';
          if (ward && ward !== district) {
            addressLine2 = ward;
          }
          
          setFormData(prev => ({
            ...prev,
            addressLine2: addressLine2,
            city: district || data.result.parish || ''
          }));
          
          toast({
            title: "Postcode Found",
            description: `Found: ${district}${ward && ward !== district ? `, ${ward}` : ''}. Please enter your house number and street name in Address Line 1.`,
          });
        }
      } else {
        // Try alternative format or show helpful error
        const cleanPostcode = formData.postcode.replace(/\s/g, '');
        const altResponse = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (altData.result) {
            const district = altData.result.admin_district || '';
            const ward = altData.result.admin_ward || '';
            
            let addressLine2 = '';
            if (ward && ward !== district) {
              addressLine2 = ward;
            }
            
            setFormData(prev => ({
              ...prev,
              addressLine2: addressLine2,
              city: district || altData.result.parish || ''
            }));
            
            toast({
              title: "Postcode Found",
              description: `Found: ${district}${ward && ward !== district ? `, ${ward}` : ''}. Please enter your house number and street name in Address Line 1.`,
            });
          }
        } else {
          toast({
            title: "Invalid Postcode",
            description: "Please check your postcode format (e.g. SW1A 1AA) and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Postcode lookup error:', error);
      toast({
        title: "Lookup Failed",
        description: "Unable to lookup postcode. Please enter your address manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleSaveQuote = async () => {
    // Validation - companySector is no longer required
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.postcode || !formData.addressLine1) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Company name is required for company type
    if (formData.businessType === 'company' && !formData.companyName) {
      toast({
        title: "Missing Information", 
        description: "Company name is required for business type 'Company'.",
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

  const handleBookNow = async () => {
    // Same validation as save quote
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.postcode || !formData.addressLine1) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Company name is required for company type
    if (formData.businessType === 'company' && !formData.companyName) {
      toast({
        title: "Missing Information", 
        description: "Company name is required for business type 'Company'.",
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
      if (onBookNow) {
        await onBookNow(formData);
      } else {
        await onSaveQuote(formData);
      }
    } catch (error) {
      console.error('Error booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Expose the functions to parent component
  React.useEffect(() => {
    (window as any).handleContactFormSave = handleSaveQuote;
    (window as any).handleContactFormBook = handleBookNow;
    return () => {
      delete (window as any).handleContactFormSave;
      delete (window as any).handleContactFormBook;
    };
  }, [handleSaveQuote, handleBookNow]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Contact Information & Account Setup</h2>
        <p className="text-muted-foreground">
          We'll create your account and save your quote to your dashboard
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
                
                {/* Conditional form fields based on business type */}
                {formData.businessType === 'company' ? (
                  // Company Form
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Company Details</h4>
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
                        <Label htmlFor="companySector">Business Sector</Label>
                        <Select 
                          value={formData.companySector} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, companySector: value }))}
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessSectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                      {/* Voucher Code Section - Only for leafleting */}
                      {pricingModel === 'leafleting' && (
                        <div className="md:col-span-2">
                          <Label htmlFor="voucher">Voucher Code</Label>
                          {appliedVoucher ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  {appliedVoucher.voucher_code}
                                </Badge>
                                <span className="text-sm text-green-700">
                                  {appliedVoucher.voucher_type === 'percentage' 
                                    ? `${appliedVoucher.discount_value}% off` 
                                    : `£${appliedVoucher.discount_value} off`}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveVoucher}
                                className="text-green-700 hover:text-green-900"
                                disabled={submitting}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                id="voucher"
                                placeholder="Enter voucher code"
                                value={formData.voucherCode || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, voucherCode: e.target.value.toUpperCase() }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
                                disabled={submitting}
                              />
                              <Button
                                variant="outline"
                                onClick={handleApplyVoucher}
                                disabled={voucherLoading || !formData.voucherCode?.trim() || submitting}
                                className="whitespace-nowrap"
                              >
                                {voucherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Company Address Section with Postcode Lookup */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium">Company Address</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="postcode">Postcode *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="postcode"
                              name="postcode"
                              value={formData.postcode}
                              onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                              placeholder="e.g. SW1A 1AA"
                              disabled={submitting}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handlePostcodeLookup}
                              disabled={isLoadingAddress || submitting}
                              size="sm"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="addressLine1">Address Line 1 *</Label>
                          <Input
                            id="addressLine1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                            placeholder="House number and street name"
                            disabled={submitting}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="addressLine2">Address Line 2</Label>
                          <Input
                            id="addressLine2"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                            placeholder="Area, district (optional)"
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Town/City *</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Town or city"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Sole Trader Form
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Personal Details</h4>
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
                        <Label htmlFor="companyName">Business/Trading Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Enter your business name (optional)"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companySector">Business Sector</Label>
                        <Select 
                          value={formData.companySector} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, companySector: value }))}
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessSectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                      {/* Voucher Code Section - Only for leafleting */}
                      {pricingModel === 'leafleting' && (
                        <div className="md:col-span-2">
                          <Label htmlFor="voucher">Voucher Code</Label>
                          {appliedVoucher ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  {appliedVoucher.voucher_code}
                                </Badge>
                                <span className="text-sm text-green-700">
                                  {appliedVoucher.voucher_type === 'percentage' 
                                    ? `${appliedVoucher.discount_value}% off` 
                                    : `£${appliedVoucher.discount_value} off`}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveVoucher}
                                className="text-green-700 hover:text-green-900"
                                disabled={submitting}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                id="voucher"
                                placeholder="Enter voucher code"
                                value={formData.voucherCode || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, voucherCode: e.target.value.toUpperCase() }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
                                disabled={submitting}
                              />
                              <Button
                                variant="outline"
                                onClick={handleApplyVoucher}
                                disabled={voucherLoading || !formData.voucherCode?.trim() || submitting}
                                className="whitespace-nowrap"
                              >
                                {voucherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Business Address Section with Postcode Lookup */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium">Business Address</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="postcode">Postcode *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="postcode"
                              name="postcode"
                              value={formData.postcode}
                              onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                              placeholder="e.g. SW1A 1AA"
                              disabled={submitting}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handlePostcodeLookup}
                              disabled={isLoadingAddress || submitting}
                              size="sm"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="addressLine1">Address Line 1 *</Label>
                          <Input
                            id="addressLine1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                            placeholder="House number and street name"
                            disabled={submitting}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="addressLine2">Address Line 2</Label>
                          <Input
                            id="addressLine2"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                            placeholder="Area, district (optional)"
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Town/City *</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Town or city"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="password">Create Account Password *</Label>
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
                    We'll create your account automatically and sign you in. You can access your saved quotes anytime.
                  </p>
                </div>
              </div>
            </form>
          </div>

        </CardContent>
      </Card>

      
      {submitting && (
        <div className="text-center">
          <p className="text-muted-foreground">Creating your account and saving your quote...</p>
        </div>
      )}
    </div>
  );
};

export default ContactInformationStep;