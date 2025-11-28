import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Package, MapPin, Calendar, Layout, Pencil, DollarSign } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletData } from '@/hooks/useLeafletData';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';
import { calculateLeafletingPrice, formatLeafletPrice } from '@/lib/leafletingCalculator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

interface CreateBookingFormProps {
  user: User;
  onBookingCreated?: () => void;
  onQuoteSaved?: () => void;
}

export default function CreateBookingForm({ user, onBookingCreated, onQuoteSaved }: CreateBookingFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  // Pricing model selection
  const [pricingModel, setPricingModel] = useState<'fixed' | 'bogof' | 'leafleting'>('fixed');
  
  // Area selections
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>([]);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>([]);
  
  // Duration and schedule
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<Record<string, string>>({});
  const [selectedLeafletDuration, setSelectedLeafletDuration] = useState<string>('');
  
  // Ad size and design
  const [selectedAdSize, setSelectedAdSize] = useState<string>('');
  const [includeDesign, setIncludeDesign] = useState(false);
  const [selectedLeafletSize, setSelectedLeafletSize] = useState<string>('');
  
  // Load data
  const { areas, adSizes, durations, subscriptionDurations, isLoading: pricingLoading } = usePricingData();
  const { leafletAreas, leafletDurations, leafletSizes, isLoading: leafletLoading } = useLeafletData();

  // Get user profile for pre-filling contact info
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setProfile(data);
    };
    loadProfile();
  }, [user.id]);

  // Reset selections when pricing model changes
  useEffect(() => {
    setSelectedAreas([]);
    setBogofPaidAreas([]);
    setBogofFreeAreas([]);
    setSelectedDuration('');
    setSelectedMonths({});
    setSelectedAdSize('');
    setSelectedLeafletDuration('');
    setSelectedLeafletSize('');
  }, [pricingModel]);

  // Calculate pricing based on selections
  const pricingBreakdown = useMemo(() => {
    if (pricingModel === 'leafleting') {
      if (!selectedAreas.length || !selectedLeafletDuration) return null;
      
      const duration = leafletDurations?.find(d => d.id === selectedLeafletDuration);
      if (!duration) return null;
      
      const multiplier = duration.months / 2;
      return calculateLeafletingPrice(selectedAreas, leafletAreas || [], multiplier, duration.issues);
    } else {
      const areasToUse = pricingModel === 'bogof' 
        ? [...bogofPaidAreas, ...bogofFreeAreas]
        : selectedAreas;
      
      if (!areasToUse.length || !selectedAdSize || !selectedDuration) return null;

      const durationData = pricingModel === 'fixed' 
        ? durations?.find(d => d.id === selectedDuration)
        : subscriptionDurations?.find(d => d.id === selectedDuration);
      
      const adSize = adSizes?.find(a => a.id === selectedAdSize);
      
      if (!durationData || !adSize) return null;

      return calculateAdvertisingPrice(
        areasToUse,
        selectedAdSize,
        selectedDuration,
        pricingModel === 'bogof',
        areas || [],
        adSizes || [],
        durations || [],
        subscriptionDurations || [],
        [],
        pricingModel === 'bogof' ? bogofFreeAreas : [],
        profile?.agency_discount_percent || 0
      );
    }
  }, [pricingModel, selectedAreas, bogofPaidAreas, bogofFreeAreas, selectedAdSize, selectedDuration, selectedLeafletDuration, includeDesign, areas, adSizes, durations, subscriptionDurations, leafletAreas, leafletDurations]);

  const isFormValid = () => {
    if (pricingModel === 'leafleting') {
      return selectedAreas.length > 0 && selectedLeafletDuration && selectedLeafletSize;
    } else if (pricingModel === 'bogof') {
      return bogofPaidAreas.length >= 3 && bogofFreeAreas.length >= 3 && selectedAdSize && selectedDuration;
    } else {
      return selectedAreas.length > 0 && selectedAdSize && selectedDuration;
    }
  };

  const handleSaveAsQuote = async () => {
    if (!isFormValid() || !pricingBreakdown) return;
    
    setSubmitting(true);
    try {
      const quotePayload = {
        user_id: user.id,
        contact_name: profile?.display_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: profile?.phone || null,
        pricing_model: pricingModel,
        ad_size_id: pricingModel === 'leafleting' ? null : selectedAdSize,
        duration_id: pricingModel === 'leafleting' ? null : selectedDuration,
        selected_area_ids: pricingModel === 'leafleting' ? selectedAreas : (pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas),
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : null,
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : null,
        monthly_price: pricingBreakdown.finalTotal,
        subtotal: pricingBreakdown.subtotal,
        final_total: pricingBreakdown.finalTotal,
        total_circulation: pricingBreakdown.totalCirculation,
        volume_discount_percent: ('volumeDiscount' in pricingBreakdown ? pricingBreakdown.volumeDiscount : 0) as number,
        duration_discount_percent: ('durationDiscount' in pricingBreakdown ? (pricingBreakdown.durationDiscount || 0) : 0) as number,
        agency_discount_percent: profile?.agency_discount_percent || 0,
        pricing_breakdown: pricingBreakdown as any,
        selections: {
          areas: pricingModel === 'leafleting' ? selectedAreas : (pricingModel === 'bogof' ? { paid: bogofPaidAreas, free: bogofFreeAreas } : selectedAreas),
          adSize: selectedAdSize,
          duration: selectedDuration,
          months: selectedMonths,
          includeDesign,
          leafletSize: selectedLeafletSize,
          leafletDuration: selectedLeafletDuration
        },
        status: 'draft'
      };

      const { error } = await supabase.from('quotes').insert([quotePayload]);
      
      if (error) throw error;

      toast({
        title: 'Quote Saved',
        description: 'Your quote has been saved successfully.'
      });

      onQuoteSaved?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookNow = async () => {
    if (!isFormValid() || !pricingBreakdown) return;
    
    setSubmitting(true);
    try {
      const bookingPayload = {
        user_id: user.id,
        contact_name: profile?.display_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: profile?.phone || null,
        pricing_model: pricingModel,
        ad_size_id: pricingModel === 'leafleting' ? null : selectedAdSize,
        duration_id: pricingModel === 'leafleting' ? null : selectedDuration,
        selected_area_ids: pricingModel === 'leafleting' ? selectedAreas : (pricingModel === 'bogof' ? [...bogofPaidAreas, ...bogofFreeAreas] : selectedAreas),
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : null,
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : null,
        monthly_price: pricingBreakdown.finalTotal,
        subtotal: pricingBreakdown.subtotal,
        final_total: pricingBreakdown.finalTotal,
        total_circulation: pricingBreakdown.totalCirculation,
        volume_discount_percent: ('volumeDiscount' in pricingBreakdown ? pricingBreakdown.volumeDiscount : 0) as number,
        duration_discount_percent: ('durationDiscount' in pricingBreakdown ? (pricingBreakdown.durationDiscount || 0) : 0) as number,
        agency_discount_percent: profile?.agency_discount_percent || 0,
        pricing_breakdown: pricingBreakdown as any,
        selections: {
          areas: pricingModel === 'leafleting' ? selectedAreas : (pricingModel === 'bogof' ? { paid: bogofPaidAreas, free: bogofFreeAreas } : selectedAreas),
          adSize: selectedAdSize,
          duration: selectedDuration,
          months: selectedMonths,
          includeDesign,
          leafletSize: selectedLeafletSize,
          leafletDuration: selectedLeafletDuration
        },
        status: 'pending',
        payment_status: 'pending',
        webhook_payload: {}
      };

      const { error } = await supabase.from('bookings').insert([bookingPayload]);
      
      if (error) throw error;

      toast({
        title: 'Booking Created',
        description: 'Your booking has been created. Please complete payment to confirm.'
      });

      onBookingCreated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setSelectedAreas([]);
    setBogofPaidAreas([]);
    setBogofFreeAreas([]);
    setSelectedDuration('');
    setSelectedMonths({});
    setSelectedAdSize('');
    setIncludeDesign(false);
    setSelectedLeafletDuration('');
    setSelectedLeafletSize('');
  };

  const totalCirculation = useMemo(() => {
    if (pricingModel === 'leafleting') {
      return selectedAreas.reduce((sum, areaId) => {
        const area = leafletAreas?.find(a => a.id === areaId);
        return sum + (area?.bimonthly_circulation || 0);
      }, 0);
    } else {
      const areasToUse = pricingModel === 'bogof' 
        ? [...bogofPaidAreas, ...bogofFreeAreas]
        : selectedAreas;
      
      return areasToUse.reduce((sum, areaId) => {
        const area = areas?.find(a => a.id === areaId);
        return sum + (area?.circulation || 0);
      }, 0);
    }
  }, [pricingModel, selectedAreas, bogofPaidAreas, bogofFreeAreas, areas, leafletAreas]);

  if (pricingLoading || leafletLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading form...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Package Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Package Type</Label>
            <RadioGroup value={pricingModel} onValueChange={(v: any) => setPricingModel(v)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`cursor-pointer transition-all ${pricingModel === 'fixed' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="pt-6">
                    <RadioGroupItem value="fixed" id="fixed" className="sr-only" />
                    <Label htmlFor="fixed" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="font-semibold">Fixed Term</div>
                        <div className="text-sm text-muted-foreground">One-time campaign with set duration</div>
                      </div>
                    </Label>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${pricingModel === 'bogof' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="pt-6">
                    <RadioGroupItem value="bogof" id="bogof" className="sr-only" />
                    <Label htmlFor="bogof" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="font-semibold">3+ Repeat Package</div>
                        <div className="text-sm text-muted-foreground">Best value for ongoing campaigns</div>
                      </div>
                    </Label>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${pricingModel === 'leafleting' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="pt-6">
                    <RadioGroupItem value="leafleting" id="leafleting" className="sr-only" />
                    <Label htmlFor="leafleting" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="font-semibold">Leafleting</div>
                        <div className="text-sm text-muted-foreground">Direct mail distribution</div>
                      </div>
                    </Label>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Area Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Areas
            </Label>
            
            {pricingModel === 'bogof' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Paid Areas (min. 3)</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {areas?.map((area) => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`paid-${area.id}`}
                          checked={bogofPaidAreas.includes(area.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBogofPaidAreas([...bogofPaidAreas, area.id]);
                            } else {
                              setBogofPaidAreas(bogofPaidAreas.filter(id => id !== area.id));
                            }
                          }}
                        />
                        <Label htmlFor={`paid-${area.id}`} className="text-sm cursor-pointer flex-1">
                          {area.name} ({area.circulation?.toLocaleString()} circulation)
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Badge variant="outline">{bogofPaidAreas.length} selected</Badge>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Free Areas (min. 3)</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {areas?.map((area) => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`free-${area.id}`}
                          checked={bogofFreeAreas.includes(area.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBogofFreeAreas([...bogofFreeAreas, area.id]);
                            } else {
                              setBogofFreeAreas(bogofFreeAreas.filter(id => id !== area.id));
                            }
                          }}
                        />
                        <Label htmlFor={`free-${area.id}`} className="text-sm cursor-pointer flex-1">
                          {area.name} ({area.circulation?.toLocaleString()} circulation)
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Badge variant="outline">{bogofFreeAreas.length} selected</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                {(pricingModel === 'leafleting' ? leafletAreas : areas)?.map((area) => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={area.id}
                      checked={selectedAreas.includes(area.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAreas([...selectedAreas, area.id]);
                        } else {
                          setSelectedAreas(selectedAreas.filter(id => id !== area.id));
                        }
                      }}
                    />
                    <Label htmlFor={area.id} className="text-sm cursor-pointer flex-1">
                      {area.name} ({(pricingModel === 'leafleting' ? area.bimonthly_circulation : area.circulation)?.toLocaleString()} circulation)
                    </Label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">Total: {totalCirculation.toLocaleString()} circulation</Badge>
            </div>
          </div>

          <Separator />

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Duration
            </Label>
            <Select 
              value={pricingModel === 'leafleting' ? selectedLeafletDuration : selectedDuration} 
              onValueChange={pricingModel === 'leafleting' ? setSelectedLeafletDuration : setSelectedDuration}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose duration" />
              </SelectTrigger>
              <SelectContent>
                {(pricingModel === 'leafleting' 
                  ? leafletDurations 
                  : (pricingModel === 'fixed' ? durations : subscriptionDurations)
                )?.map((duration) => (
                  <SelectItem key={duration.id} value={duration.id}>
                    {duration.name}
                    {duration.description && ` - ${duration.description}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pricingModel !== 'leafleting' && (
            <>
              <Separator />

              {/* Ad Size Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Select Advertisement Size
                </Label>
                <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose ad size" />
                  </SelectTrigger>
                  <SelectContent>
                    {adSizes?.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name} - {size.dimensions}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Design Service */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Design Service
                </Label>
                <RadioGroup value={includeDesign ? 'yes' : 'no'} onValueChange={(v) => setIncludeDesign(v === 'yes')}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="design-no" />
                      <Label htmlFor="design-no" className="cursor-pointer">No, I have my own design</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="design-yes" />
                      <Label htmlFor="design-yes" className="cursor-pointer">
                        Yes, include design service
                        {includeDesign && adSizes?.find(s => s.id === selectedAdSize) && (
                          <span className="ml-2 text-muted-foreground">
                            (+{formatPrice(adSizes.find(s => s.id === selectedAdSize)?.design_fee || 0)})
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {pricingModel === 'leafleting' && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Select Leaflet Size
                </Label>
                <Select value={selectedLeafletSize} onValueChange={setSelectedLeafletSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose leaflet size" />
                  </SelectTrigger>
                  <SelectContent>
                    {leafletSizes?.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.label}
                        {size.description && ` - ${size.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {pricingBreakdown && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <DollarSign className="h-5 w-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {'basePrice' in pricingBreakdown && (
              <div className="flex justify-between text-sm">
                <span>Base Price:</span>
                <span>{pricingModel === 'leafleting' ? formatLeafletPrice((pricingBreakdown as any).basePrice) : formatPrice((pricingBreakdown as any).basePrice)}</span>
              </div>
            )}
            {'volumeDiscount' in pricingBreakdown && (pricingBreakdown as any).volumeDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Volume Discount ({(pricingBreakdown as any).volumeDiscount}%):</span>
                <span>-{'basePrice' in pricingBreakdown && formatPrice((pricingBreakdown as any).basePrice * ((pricingBreakdown as any).volumeDiscount / 100))}</span>
              </div>
            )}
            {'durationDiscount' in pricingBreakdown && (pricingBreakdown as any).durationDiscount && (pricingBreakdown as any).durationDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Duration Discount ({(pricingBreakdown as any).durationDiscount}%):</span>
                <span>-{'basePrice' in pricingBreakdown && formatPrice((pricingBreakdown as any).basePrice * ((pricingBreakdown as any).durationDiscount / 100))}</span>
              </div>
            )}
            {includeDesign && 'designFee' in pricingBreakdown && (pricingBreakdown as any).designFee && (pricingBreakdown as any).designFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Design Service:</span>
                <span>+{formatPrice((pricingBreakdown as any).designFee)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{pricingModel === 'leafleting' ? formatLeafletPrice(pricingBreakdown.finalTotal) : formatPrice(pricingBreakdown.finalTotal)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total Circulation: {pricingBreakdown.totalCirculation.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Alert */}
      {!isFormValid() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete all required selections before saving or booking.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSaveAsQuote}
              disabled={!isFormValid() || submitting}
              variant="outline"
              className="flex-1"
            >
              Save as Quote
            </Button>
            <Button
              onClick={handleBookNow}
              disabled={!isFormValid() || submitting}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Book Now
            </Button>
            <Button
              onClick={handleClearForm}
              variant="ghost"
              disabled={submitting}
            >
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
