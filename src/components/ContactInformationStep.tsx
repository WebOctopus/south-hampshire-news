import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Info, AlertCircle, Phone, Calendar, Shield, Clock, CheckCircle2, Mail, MapPin, Lock, User, Building2, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MobilePricingSummary } from '@/components/MobilePricingSummary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBogofEligibility } from '@/hooks/useBogofEligibility';


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
  currentStep?: number;
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

// Trust Badge Component
const TrustBadge: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
    <div className="text-community-green">{icon}</div>
    <span className="text-sm text-slate-600 font-medium">{text}</span>
  </div>
);

// Form Section Component
const FormSection: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode;
  className?: string;
}> = ({ icon, title, children, className = "" }) => (
  <div className={`space-y-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100 ${className}`}>
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      <div className="text-community-navy">{icon}</div>
      <h4 className="font-semibold text-community-navy">{title}</h4>
    </div>
    {children}
  </div>
);

// Timeline Step Component
const TimelineStep: React.FC<{ 
  number: number; 
  title: string; 
  description: string;
  isLast?: boolean;
}> = ({ number, title, description, isLast = false }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-community-green text-white flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      {!isLast && <div className="w-0.5 h-full bg-community-green/20 mt-2" />}
    </div>
    <div className="pb-6">
      <h5 className="font-medium text-slate-800">{title}</h5>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

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
  const [userEmailForBogof, setUserEmailForBogof] = useState<string | undefined>();
  const [userPhoneForBogof, setUserPhoneForBogof] = useState<string | undefined>();
  const { data: eligibilityData, isLoading: checkingEligibility } = useBogofEligibility(userEmailForBogof, userPhoneForBogof);

  // Get current user's email and phone for BOGOF eligibility check
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmailForBogof(user.email);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.phone) {
          setUserPhoneForBogof(profile.phone);
        }
      }
    };
    
    fetchUserData();
  }, []);

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
      const response = await fetch(`https://api.postcodes.io/postcodes/${formData.postcode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const district = data.result.admin_district || '';
          const ward = data.result.admin_ward || '';
          
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
    } finally {
      setSubmitting(false);
    }
  }, [formData, onSaveQuote, toast]);

  const handleBookNow = useCallback(async () => {
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

  React.useEffect(() => {
    (window as any).handleContactFormSave = handleSaveQuote;
    (window as any).handleContactFormBook = handleBookNow;
    return () => {
      delete (window as any).handleContactFormSave;
      delete (window as any).handleContactFormBook;
    };
  }, [handleSaveQuote, handleBookNow]);

  const isBogof = pricingModel === 'bogof';
  const showBogofWarning = isBogof && eligibilityData && !eligibilityData.isEligible;

  return (
    <div className="space-y-8">
      {/* Calm Transition Section - Emotional Reset */}
      <div className="relative bg-gradient-to-b from-amber-50/60 via-slate-50/40 to-white rounded-2xl p-8 lg:p-10 border border-amber-100/50">
        {/* Decorative sparkle */}
        <div className="absolute top-4 right-4 text-amber-400/60">
          <Sparkles className="h-6 w-6" />
        </div>
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-community-green/10 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-community-green" />
            <span className="text-sm font-medium text-community-green">Final Step</span>
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-bold text-community-navy">
            You're Almost There!
          </h2>
          
          <p className="text-slate-600 text-lg">
            Just a few details to secure your campaign. We'll take care of everything from here.
          </p>
        </div>
        
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <TrustBadge icon={<Phone className="h-4 w-4" />} text="023 8000 0000" />
          <TrustBadge icon={<Calendar className="h-4 w-4" />} text="Since 2005" />
          <TrustBadge icon={<Shield className="h-4 w-4" />} text="No Hidden Fees" />
          <TrustBadge icon={<Clock className="h-4 w-4" />} text="Quick Setup" />
        </div>
      </div>

      {showBogofWarning && (
        <Alert className="bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-800">
          <AlertCircle className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          <AlertDescription className="text-pink-800 dark:text-pink-300">
            <strong>Returning Customer</strong> — You've previously used this offer. Complete your booking and our team will contact you with exclusive returning customer rates!
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200/80 shadow-lg">
        <CardContent className="p-6 lg:p-8">
          <form className="space-y-6">
            {/* Section 1: Business Type */}
            <FormSection icon={<Building2 className="h-5 w-5" />} title="Business Type">
              <RadioGroup
                value={formData.businessType}
                onValueChange={(value: 'limited_company' | 'sole_trader' | 'non_profit' | 'partnership') => 
                  setFormData(prev => ({ ...prev, businessType: value }))
                }
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                disabled={submitting}
              >
                {[
                  { value: 'limited_company', label: 'Limited Company' },
                  { value: 'sole_trader', label: 'Sole Trader' },
                  { value: 'non_profit', label: 'Non Profit' },
                  { value: 'partnership', label: 'Partnership' },
                ].map((option) => (
                  <div key={option.value} className="relative">
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value} 
                      className="peer sr-only"
                    />
                    <Label 
                      htmlFor={option.value}
                      className="flex items-center justify-center p-3 bg-white border-2 border-slate-200 rounded-lg cursor-pointer transition-all hover:border-community-green/50 peer-data-[state=checked]:border-community-green peer-data-[state=checked]:bg-community-green/5 text-sm font-medium text-center"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormSection>
            
            {/* Section 2: Personal/Organisation Details */}
            <FormSection 
              icon={<User className="h-5 w-5" />} 
              title={formData.businessType === 'sole_trader' ? 'Your Details' : 'Organisation Details'}
            >
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
                    className="mt-1.5"
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
                    className="mt-1.5"
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
                    className="mt-1.5"
                  />
                </div>
                {formData.businessType !== 'sole_trader' ? (
                  <div>
                    <Label htmlFor="companyName">
                      {formData.businessType === 'limited_company' 
                        ? 'Company Name (as per Companies House) *' 
                        : 'Organisation Name *'}
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter your company/organisation name"
                      disabled={submitting}
                      className="mt-1.5"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="companyName">Business/Trading Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter your business name (optional)"
                      disabled={submitting}
                      className="mt-1.5"
                    />
                  </div>
                )}
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
                      className="mt-1.5"
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
                      <SelectTrigger className="mt-1.5">
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
              </div>
            </FormSection>

            {/* Section 3: Contact Details */}
            <FormSection icon={<Mail className="h-5 w-5" />} title="Contact Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="mt-1.5"
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
                    className="mt-1.5"
                  />
                </div>
              </div>
            </FormSection>

            {/* Voucher Code Section - Only for leafleting */}
            {pricingModel === 'leafleting' && (
              <div className="p-5 bg-green-50/80 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-lg">🎟️</span>
                  </div>
                  <Label className="text-green-800 font-semibold">Have a Voucher Code?</Label>
                </div>
                <p className="text-sm text-green-600 mb-4">Enter your discount code below to save on your leafleting campaign.</p>
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
            )}

            {/* Section 4: Invoice Address */}
            <FormSection icon={<MapPin className="h-5 w-5" />} title="Invoice Address">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <div className="flex gap-2 mt-1.5">
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
                      className="shrink-0"
                    >
                      {isLoadingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
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
                    className="mt-1.5"
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
                    className="mt-1.5"
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
                    className="mt-1.5"
                  />
                </div>
              </div>
            </FormSection>

            {/* Section 5: Create Account */}
            <FormSection icon={<Lock className="h-5 w-5" />} title="Create Your Account">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  disabled={submitting}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  We'll create your account automatically and sign you in. Access your saved quotes anytime.
                </p>
              </div>
              
              {/* Legal Documents Acceptance */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50/80 border border-blue-200 rounded-lg mt-4">
                <Checkbox
                  id="legalDocuments"
                  checked={formData.legalDocumentsAccepted}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, legalDocumentsAccepted: !!checked }))
                  }
                  disabled={submitting}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="legalDocuments" className="text-sm font-medium cursor-pointer">
                      I accept the T&C's *
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
                                <li>Payment terms: Full payment required before print date</li>
                                <li>Campaign specifications are final once approved</li>
                                <li>We reserve the right to refuse advertising content that violates our content policy</li>
                                <li>Delivery dates are estimates and may vary due to external factors</li>
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
            </FormSection>
          </form>
        </CardContent>
      </Card>

      {/* What Happens Next Section */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-community-green/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-community-green" />
          </div>
          <h3 className="text-xl font-semibold text-community-navy">What Happens Next?</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <TimelineStep 
              number={1} 
              title="Account Created" 
              description="Your quote is saved and you can access it anytime" 
            />
            <TimelineStep 
              number={2} 
              title="Confirmation Email" 
              description="Campaign details sent to your inbox" 
            />
          </div>
          <div>
            <TimelineStep 
              number={3} 
              title="Design Team Contact" 
              description="If design is included, we'll be in touch within 24 hours" 
            />
            <TimelineStep 
              number={4} 
              title="Campaign Goes Live" 
              description="Your ads reach 142,000 homes across Hampshire" 
              isLast 
            />
          </div>
        </div>

        {/* Inline Trust Cues */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-community-green" />
            <span>Questions? <strong className="text-community-navy">023 8000 0000</strong></span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="h-4 w-4 text-community-green" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-community-green" />
            <span>Established 2005</span>
          </div>
        </div>
      </div>

      {submitting && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-community-green/10 rounded-full">
            <Loader2 className="h-5 w-5 animate-spin text-community-green" />
            <p className="text-community-navy font-medium">Creating your account and saving your quote...</p>
          </div>
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
