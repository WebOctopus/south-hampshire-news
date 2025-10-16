import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateUK } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeafletAreas, useLeafletData } from '@/hooks/useLeafletData';
import { calculateLeafletingPrice, formatLeafletPrice, calculateLeafletCPM } from '@/lib/leafletingCalculator';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AlertCircle, Loader2, RefreshCw, MapPin, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeafletingCalculatorProps {
  children: React.ReactNode;
}

const LeafletingCalculator = ({ children }: LeafletingCalculatorProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: '',
    selectedAreas: [] as string[],
    leafletSize: '',
    duration: '1' // Default to 1 issue (2 months)
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch leafleting data from Supabase
  const { leafletAreas, leafletDurations, leafletSizes, isLoading, isError } = useLeafletData();

  const handleAreaChange = useCallback((areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: checked 
        ? [...prev.selectedAreas, areaId]
        : prev.selectedAreas.filter(id => id !== areaId)
    }));
  }, []);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
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
        .eq('voucher_code', voucherCode.toUpperCase())
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
    setVoucherCode('');
    toast({
      title: "Voucher Removed",
      description: "Voucher discount has been removed."
    });
  };

  // Calculate pricing using Supabase data
  const pricingBreakdown = useMemo(() => {
    if (!leafletAreas?.length || !leafletDurations?.length) return null;
    
    // Get the selected duration data to find the issues count
    const selectedDurationData = leafletDurations.find(d => d.id === formData.duration);
    const durationMultiplier = selectedDurationData?.issues || 1;
    const issuesCount = selectedDurationData?.issues || 1;
    
    const basePricing = calculateLeafletingPrice(
      formData.selectedAreas,
      leafletAreas,
      durationMultiplier,
      issuesCount
    );

    if (!basePricing || !appliedVoucher) return basePricing;

    // Apply voucher discount
    let voucherDiscount = 0;
    if (appliedVoucher.voucher_type === 'percentage') {
      voucherDiscount = (basePricing.finalTotal * appliedVoucher.discount_value) / 100;
    } else {
      voucherDiscount = Math.min(appliedVoucher.discount_value, basePricing.finalTotal);
    }

    return {
      ...basePricing,
      voucherDiscount,
      voucherCode: appliedVoucher.voucher_code,
      finalTotal: basePricing.finalTotal - voucherDiscount
    };
  }, [formData.selectedAreas, formData.duration, leafletAreas, appliedVoucher]);

  const handleSubmitQuote = async () => {
    if (!formData.fullName || !formData.emailAddress || !formData.selectedAreas.length || !formData.leafletSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const quoteData = {
        contact_name: formData.fullName,
        email: formData.emailAddress,
        phone: formData.phoneNumber,
        company: formData.companyName,
        pricing_model: 'leafleting',
        selections: {
          selectedAreas: formData.selectedAreas,
          leafletSize: formData.leafletSize,
          duration: formData.duration
        },
        pricing_breakdown: pricingBreakdown || {},
        subtotal: pricingBreakdown?.subtotal || 0,
        final_total: pricingBreakdown?.finalTotal || 0,
        total_circulation: pricingBreakdown?.totalCirculation || 0,
        duration_multiplier: parseInt(formData.duration),
        notes: `Leafleting service quote for ${formData.selectedAreas.length} area(s)`
      };

      const { error } = await supabase
        .from('quote_requests')
        .insert([quoteData]);

      if (error) throw error;

      toast({
        title: "Quote Submitted Successfully!",
        description: "We'll get back to you within 24 hours with your leafleting quote."
      });

      // Reset form
      setFormData({
        fullName: '',
        emailAddress: '',
        phoneNumber: '',
        companyName: '',
        selectedAreas: [],
        leafletSize: '',
        duration: '1'
      });

    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error Submitting Quote",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading leafleting options...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <span className="ml-2">Error loading leafleting data</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ErrorBoundary>
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leafleting Service Calculator
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Configuration */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailAddress">Email Address *</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData({...formData, emailAddress: e.target.value})}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Enter your company name"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Distribution Areas *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                    {leafletAreas?.map((area) => (
                      <div key={area.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <Checkbox
                          id={area.id}
                          checked={formData.selectedAreas.includes(area.id)}
                          onCheckedChange={(checked) => handleAreaChange(area.id, !!checked)}
                        />
                        <Label htmlFor={area.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">Area {area.area_number}: {area.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {area.bimonthly_circulation.toLocaleString()} homes per campaign
                          </div>
                          <div className="text-sm font-medium text-primary">
                            £{area.price_with_vat.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Postcodes: {area.postcodes}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Leaflet Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Leaflet Size *</CardTitle>
                </CardHeader>
                <CardContent>
                  {leafletSizes && leafletSizes.length > 0 ? (
                    <Select 
                      value={formData.leafletSize} 
                      onValueChange={(value) => setFormData({...formData, leafletSize: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leaflet size" />
                      </SelectTrigger>
                      <SelectContent>
                        {leafletSizes.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.label}
                            {size.description && (
                              <div className="text-sm text-muted-foreground">{size.description}</div>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No leaflet sizes available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Duration */}
              <Card className="border-primary/50 shadow-md bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Campaign Duration *
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please select how long you'd like your campaign to run
                  </p>
                </CardHeader>
                <CardContent>
                  {leafletDurations && leafletDurations.length > 0 ? (
                    <RadioGroup value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                      {leafletDurations.map((duration) => (
                        <div key={duration.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={duration.issues.toString()} id={`duration-${duration.id}`} />
                          <Label htmlFor={`duration-${duration.id}`}>
                            {duration.issues} {duration.issues === 1 ? 'Issue' : 'Issues'} – {duration.issues} delivery {duration.issues === 1 ? 'slot' : 'slots'} per area selected
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <RadioGroup value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="duration-1" />
                        <Label htmlFor="duration-1">1 Issue (2 months)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="duration-3" />
                        <Label htmlFor="duration-3">3 Issues (6 months)</Label>
                      </div>
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>

              {/* Voucher Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="h-5 w-5" />
                    Voucher Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter voucher code"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherCode.trim()}
                        className="whitespace-nowrap"
                      >
                        {voucherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Publication Schedule */}
              {formData.selectedAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Publication Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leafletAreas
                        ?.filter(area => formData.selectedAreas.includes(area.id))
                        .map((area) => (
                          <div key={area.id} className="p-3 border rounded-lg">
                            <div className="font-medium mb-2">Area {area.area_number}: {area.name}</div>
                            {area.schedule && Array.isArray(area.schedule) && area.schedule.length > 0 ? (
                              <div className="space-y-2 text-sm">
                                {area.schedule.map((schedule: any, index: number) => (
                                  <div key={index} className="grid grid-cols-3 gap-4 p-2 bg-muted rounded">
                                    <div>
                                      <span className="font-medium">Copy Deadline:</span>
                                      <div className="text-muted-foreground">{schedule.copyDeadline ? formatDateUK(schedule.copyDeadline) : 'TBA'}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Print Deadline:</span>
                                      <div className="text-muted-foreground">{schedule.printDeadline || 'TBA'}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Delivery Date:</span>
                                      <div className="text-muted-foreground">{schedule.deliveryDate || 'TBA'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Schedule information not available for this area
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Quote Summary */}
            <div className="space-y-6">
              <Card className="sticky top-0">
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {pricingBreakdown ? (
                    <div className="space-y-4">
                      {/* Selected Areas */}
                      <div>
                        <h4 className="font-semibold mb-2">Selected Areas ({formData.selectedAreas.length})</h4>
                        <div className="space-y-1 text-sm">
                          {pricingBreakdown.areaBreakdown.map((item) => (
                            <div key={item.areaId} className="flex justify-between">
                              <span>{item.areaName}</span>
                              <span>{formatLeafletPrice(item.basePrice)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                       {/* Pricing Breakdown */}
                       <div className="space-y-2">
                         <div className="flex justify-between">
                           <span>Subtotal:</span>
                           <span>{formatLeafletPrice(pricingBreakdown.subtotal)}</span>
                         </div>
                         
                         {pricingBreakdown.volumeDiscountPercent > 0 && (
                           <div className="flex justify-between text-green-600">
                             <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                             <span>-{formatLeafletPrice(pricingBreakdown.volumeDiscount)}</span>
                           </div>
                         )}

                         {pricingBreakdown.comboDiscountPercent > 0 && (
                           <div className="flex justify-between text-green-600">
                             <span>Combo Discount ({pricingBreakdown.comboDiscountPercent}%):</span>
                             <span>-{formatLeafletPrice(pricingBreakdown.comboDiscount)}</span>
                           </div>
                         )}

                         {pricingBreakdown.voucherDiscount > 0 && (
                           <div className="flex justify-between text-green-600">
                             <span>Voucher Discount ({pricingBreakdown.voucherCode}):</span>
                             <span>-{formatLeafletPrice(pricingBreakdown.voucherDiscount)}</span>
                           </div>
                         )}

                         <div className="flex justify-between">
                           <span>Duration Multiplier:</span>
                           <span>x{pricingBreakdown.durationMultiplier}</span>
                         </div>

                         <Separator />

                         <div className="flex justify-between font-bold text-lg">
                           <span>Total:</span>
                           <span className="text-primary">{formatLeafletPrice(pricingBreakdown.finalTotal)}</span>
                         </div>
                       </div>

                      {/* Stats */}
                      <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Circulation:</span>
                          <span>{pricingBreakdown.totalCirculation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost per 1,000 (CPM):</span>
                          <span>{formatLeafletPrice(calculateLeafletCPM(pricingBreakdown.finalTotal, pricingBreakdown.totalCirculation))}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSubmitQuote}
                        className="w-full"
                        disabled={!formData.fullName || !formData.emailAddress || !formData.selectedAreas.length || !formData.leafletSize}
                      >
                        Get Quote
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select areas and options to see pricing</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default LeafletingCalculator;