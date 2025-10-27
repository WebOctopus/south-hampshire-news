import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MobilePricingSummary } from '@/components/MobilePricingSummary';


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
  currentStep?: number; // Add current step for mobile pricing summary
}

interface FormData {
  businessType: 'limited_company' | 'sole_trader' | 'non_profit' | 'partnership';
  firstName: string;
  lastName: string;
  jobTitle: string;
  companyName: string;
  companySector: string;
  charityNumber: string;
  email: string;
  phone: string;
  postcode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  password: string;
  voucherCode?: string;
  legalDocumentsAccepted: boolean;
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
  onBookNow,
  currentStep = 4
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessType: 'limited_company',
    firstName: "",
    lastName: "",
    jobTitle: "",
    companyName: "",
    companySector: "",
    charityNumber: "",
    email: "",
    phone: "",
    postcode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    password: "",
    voucherCode: "",
    legalDocumentsAccepted: false,
  });
  
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [legalDocumentsOpen, setLegalDocumentsOpen] = useState(false);

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

  const handleSaveQuote = useCallback(async () => {
    // Validation - companySector is no longer required
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.postcode || !formData.addressLine1) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.legalDocumentsAccepted) {
      toast({
        title: "Legal Documents Required", 
        description: "Please accept the legal documents to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Company name is required for all business types except sole trader
    if (formData.businessType !== 'sole_trader' && !formData.companyName) {
      toast({
        title: "Missing Information", 
        description: "Company/Organisation name is required.",
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
  }, [formData, onSaveQuote, toast]);

  const handleBookNow = useCallback(async () => {
    // Same validation as save quote
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.postcode || !formData.addressLine1) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.legalDocumentsAccepted) {
      toast({
        title: "Legal Documents Required", 
        description: "Please accept the legal documents to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Company name is required for all business types except sole trader
    if (formData.businessType !== 'sole_trader' && !formData.companyName) {
      toast({
        title: "Missing Information", 
        description: "Company/Organisation name is required.",
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
  }, [formData, onBookNow, onSaveQuote, toast]);

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
        <h2 className="text-2xl font-bold">Contact Information & Registration</h2>
        <p className="text-muted-foreground">
          We'll create your account so you can book online, revisit any future quotations, review campaign schedules and retrieve discount vouchers
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
                    onValueChange={(value: 'limited_company' | 'sole_trader' | 'non_profit' | 'partnership') => 
                      setFormData(prev => ({ ...prev, businessType: value }))
                    }
                    className="flex flex-col space-y-2"
                    disabled={submitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited_company" id="limited_company" />
                      <Label htmlFor="limited_company">Limited Company</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sole_trader" id="sole_trader" />
                      <Label htmlFor="sole_trader">Sole Trader</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non_profit" id="non_profit" />
                      <Label htmlFor="non_profit">Non Profit Organisation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partnership" id="partnership" />
                      <Label htmlFor="partnership">Partnership eg LLP</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Conditional form fields based on business type */}
                {formData.businessType !== 'sole_trader' ? (
                  // Company/Non-Profit/Partnership Form
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Organisation Details</h4>
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
                        <Label htmlFor="jobTitle">Job Title/Position</Label>
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="Enter your job title"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyName">
                          {formData.businessType === 'limited_company' 
                            ? 'Company/Organisation Name (as per Companies House)*' 
                            : 'Company/Organisation Name *'}
                        </Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Enter your company/organisation name"
                          disabled={submitting}
                        />
                      </div>
                      {formData.businessType === 'non_profit' ? (
                        <div>
                          <Label htmlFor="charityNumber">Charity Registration Number</Label>
                          <Input
                            id="charityNumber"
                            name="charityNumber"
                            value={formData.charityNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, charityNumber: e.target.value }))}
                            placeholder="Enter your charity registration number"
                            disabled={submitting}
                          />
                        </div>
                      ) : (
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
                    </div>

                    {/* Voucher Code Section - Only for leafleting - Highlighted in Green */}
                    {pricingModel === 'leafleting' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <Label htmlFor="voucher" className="text-green-800 font-medium">Voucher Code</Label>
                          <p className="text-sm text-green-600 mb-3">Have a discount voucher? Enter it below to save on your leafleting campaign.</p>
                          {appliedVoucher ? (
                            <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-200 text-green-800">
                                  {appliedVoucher.voucher_code}
                                </Badge>
                                <span className="text-sm text-green-800 font-medium">
                                  {appliedVoucher.voucher_type === 'percentage' 
                                    ? `${appliedVoucher.discount_value}% off` 
                                    : `£${appliedVoucher.discount_value} off`}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveVoucher}
                                className="text-green-700 hover:text-green-900 hover:bg-green-200"
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
                                className="border-green-300 focus:border-green-500 focus:ring-green-200"
                              />
                              <Button
                                variant="default"
                                onClick={handleApplyVoucher}
                                disabled={voucherLoading || !formData.voucherCode?.trim() || submitting}
                                className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
                              >
                                {voucherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
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
                        <Label htmlFor="jobTitle">Job Title/Position</Label>
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="Enter your job title"
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
                    </div>

                    {/* Voucher Code Section - Only for leafleting - Highlighted in Green */}
                    {pricingModel === 'leafleting' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <Label htmlFor="voucher" className="text-green-800 font-medium">Voucher Code</Label>
                          <p className="text-sm text-green-600 mb-3">Have a discount voucher? Enter it below to save on your leafleting campaign.</p>
                          {appliedVoucher ? (
                            <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-200 text-green-800">
                                  {appliedVoucher.voucher_code}
                                </Badge>
                                <span className="text-sm text-green-800 font-medium">
                                  {appliedVoucher.voucher_type === 'percentage' 
                                    ? `${appliedVoucher.discount_value}% off` 
                                    : `£${appliedVoucher.discount_value} off`}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveVoucher}
                                className="text-green-700 hover:text-green-900 hover:bg-green-200"
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
                                className="border-green-300 focus:border-green-500 focus:ring-green-200"
                              />
                              <Button
                                variant="default"
                                onClick={handleApplyVoucher}
                                disabled={voucherLoading || !formData.voucherCode?.trim() || submitting}
                                className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
                              >
                                {voucherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
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
                
                {/* Legal Documents Acceptance */}
                <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="legalDocuments"
                    checked={formData.legalDocumentsAccepted}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, legalDocumentsAccepted: !!checked }))
                    }
                    disabled={submitting}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="legalDocuments" className="text-sm font-medium cursor-pointer">
                        I accept the legal documents *
                      </Label>
                      <Dialog open={legalDocumentsOpen} onOpenChange={setLegalDocumentsOpen}>
                        <DialogTrigger asChild>
                          <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                            <Info className="h-4 w-4 mr-1" />
                            View Documents
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Legal Documents</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 text-sm">
                            
                            {/* Terms & Conditions */}
                            <div className="space-y-3">
                              <h3 className="text-lg font-semibold text-foreground">Terms & Conditions</h3>
                              <div className="space-y-2 text-muted-foreground">
                                <p>By using our advertising services, you agree to the following terms:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                  <li>Payment terms: Full payment required before campaign launch</li>
                                  <li>Campaign specifications are final once approved</li>
                                  <li>Cancellation policy: 48 hours notice required for cancellations</li>
                                  <li>We reserve the right to refuse advertising content that violates our content policy</li>
                                  <li>Delivery dates are estimates and may vary due to external factors</li>
                                  <li>Refunds are subject to our refund policy terms</li>
                                </ul>
                              </div>
                            </div>

                            {/* Service Agreement */}
                            <div className="space-y-3">
                              <h3 className="text-lg font-semibold text-foreground">Service Agreement</h3>
                              <div className="space-y-2 text-muted-foreground">
                                <p>This agreement outlines the specific details of your advertising campaign:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                  <li>Campaign duration and distribution schedule</li>
                                  <li>Target areas and circulation numbers</li>
                                  <li>Advertisement specifications and design requirements</li>
                                  <li>Quality standards and printing specifications</li>
                                  <li>Distribution methods and tracking procedures</li>
                                  <li>Performance metrics and reporting standards</li>
                                </ul>
                              </div>
                            </div>

                            {/* Data Protection Notice */}
                            <div className="space-y-3">
                              <h3 className="text-lg font-semibold text-foreground">Data Protection Notice</h3>
                              <div className="space-y-2 text-muted-foreground">
                                <p>We are committed to protecting your personal information:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                  <li>Personal data is collected only for service delivery purposes</li>
                                  <li>Information is stored securely and encrypted</li>
                                  <li>Data is not shared with third parties without consent</li>
                                  <li>You have the right to access, modify, or delete your data</li>
                                  <li>We comply with GDPR and UK data protection regulations</li>
                                  <li>Data retention policy: Information kept for 7 years for accounting purposes</li>
                                </ul>
                              </div>
                            </div>

                            {/* Privacy Policy */}
                            <div className="space-y-3">
                              <h3 className="text-lg font-semibold text-foreground">Privacy Policy</h3>
                              <div className="space-y-2 text-muted-foreground">
                                <p>Our privacy policy explains how we collect and use your information:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                  <li>Website cookies are used to improve user experience</li>
                                  <li>Analytics data helps us improve our services</li>
                                  <li>Marketing communications are opt-in only</li>
                                  <li>Account information is used for service delivery and support</li>
                                  <li>Payment information is processed by secure third-party providers</li>
                                  <li>You can update privacy preferences in your account settings</li>
                                </ul>
                              </div>
                            </div>

                            <div className="border-t pt-4 mt-6">
                              <p className="text-xs text-muted-foreground">
                                Last updated: September 2024. These documents will be available for download in your account dashboard after booking completion.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-xs text-blue-700">
                      By checking this box, you acknowledge that you have read and agree to our terms of service, 
                      data protection policies, and service agreement.
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
          <p className="text-muted-foreground">Creating your account and saving your quote...</p>
        </div>
      )}

      {/* Mobile Pricing Summary */}
      {campaignData && (
        <MobilePricingSummary 
          campaignData={{
            selectedModel: pricingModel,
            selectedAreas: selectedAreas,
            bogofPaidAreas: bogofPaidAreas,
            bogofFreeAreas: bogofFreeAreas,
            selectedSize: selectedAdSize,
            selectedDuration: selectedDuration,
            totalCost: pricingBreakdown?.finalTotal,
            pricingBreakdown: pricingBreakdown
          }} 
          currentStep={currentStep} 
        />
      )}
    </div>
  );
};

export default ContactInformationStep;