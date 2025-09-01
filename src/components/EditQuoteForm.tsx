import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';
import { calculateLeafletingPrice, formatLeafletPrice } from '@/lib/leafletingCalculator';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletAreas, useLeafletCampaignDurations } from '@/hooks/useLeafletData';

interface EditQuoteFormProps {
  quote: any;
  onSave: (updatedQuote: any) => void;
  onCancel: () => void;
}

const EditQuoteForm: React.FC<EditQuoteFormProps> = ({
  quote,
  onSave,
  onCancel
}) => {
  const { areas, adSizes, durations, subscriptionDurations, isLoading: pricingLoading } = usePricingData();
  const { data: leafletAreas, isLoading: leafletAreasLoading } = useLeafletAreas();
  const { data: leafletDurations, isLoading: leafletDurationsLoading } = useLeafletCampaignDurations();
  
  const [formData, setFormData] = useState({
    contact_name: quote.contact_name || '',
    email: quote.email || '',
    phone: quote.phone || '',
    company: quote.company || '',
    title: quote.title || ''
  });

  const [pricingModel, setPricingModel] = useState<'fixed' | 'bogof' | 'leafleting'>(quote.pricing_model || 'fixed');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(quote.selected_area_ids || []);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>(quote.bogof_paid_area_ids || []);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>(quote.bogof_free_area_ids || []);
  const [selectedAdSize, setSelectedAdSize] = useState<string>(quote.ad_size_id || '');
  const [selectedDuration, setSelectedDuration] = useState<string>(quote.duration_id || '');
  const [selectedMonths, setSelectedMonths] = useState<Record<string, string[]>>(quote.selections?.selectedMonths || {});
  const [submitting, setSubmitting] = useState(false);

  // Calculate effective areas based on pricing model
  const effectiveSelectedAreas = pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;

  // Get effective areas and data sources based on pricing model
  const effectiveAreas = pricingModel === 'leafleting' ? leafletAreas : areas;
  const effectiveDurations = pricingModel === 'leafleting' ? leafletDurations : 
                            pricingModel === 'bogof' ? subscriptionDurations : durations;

  // Filter ad sizes and durations based on pricing model
  const availableAdSizes = pricingModel === 'leafleting' 
    ? [] // Leafleting doesn't use ad sizes
    : (adSizes?.filter(size => 
        size.available_for.includes(pricingModel === 'bogof' ? 'subscription' : pricingModel)
      ) || []);

  // Calculate pricing breakdown
  const pricingBreakdown = React.useMemo(() => {
    if (effectiveSelectedAreas.length === 0 || !effectiveAreas) {
      return null;
    }

    if (pricingModel === 'leafleting') {
      if (!selectedDuration || !leafletDurations) return null;
      const selectedLeafletDurationData = leafletDurations.find(d => d.id === selectedDuration);
      const durationMultiplier = selectedLeafletDurationData?.months || 1;
      return calculateLeafletingPrice(effectiveSelectedAreas, leafletAreas || [], durationMultiplier);
    }

    // Regular advertising pricing
    if (!selectedAdSize || !selectedDuration || !adSizes || !areas) {
      return null;
    }

    const adSize = adSizes.find(size => size.id === selectedAdSize);
    const duration = effectiveDurations?.find(d => d.id === selectedDuration);
    
    if (!adSize || !duration) return null;

    const isSubscription = pricingModel === 'bogof';
    
    return calculateAdvertisingPrice(
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      isSubscription,
      areas,
      adSizes,
      (effectiveDurations as any) || [],
      subscriptionDurations || [],
      [] // volume discounts array - we can add this later if needed
    );
  }, [selectedAdSize, selectedDuration, effectiveSelectedAreas, pricingModel, bogofPaidAreas, bogofFreeAreas, areas, adSizes, effectiveDurations, subscriptionDurations, leafletAreas, leafletDurations]);

  const handleAreaSelection = (areaId: string, checked: boolean) => {
    // Regular area selection for fixed/subscription/leafleting
    setSelectedAreas(prev => 
      checked 
        ? [...prev, areaId]
        : prev.filter(id => id !== areaId)
    );
  };

  const handleBogofPaidAreaChange = (areaId: string, checked: boolean) => {
    setBogofPaidAreas(prev => {
      const newPaidAreas = checked ? [...prev, areaId] : prev.filter(id => id !== areaId);
      
      // If we're reducing paid areas, also reduce free areas to match
      if (!checked && newPaidAreas.length < prev.length) {
        setBogofFreeAreas(currentFreeAreas => {
          // If we have more free areas than paid areas after reduction, trim the free areas
          if (currentFreeAreas.length > newPaidAreas.length) {
            const excessCount = currentFreeAreas.length - newPaidAreas.length;
            // Remove the excess free areas (from the end of the array)
            return currentFreeAreas.slice(0, currentFreeAreas.length - excessCount);
          }
          return currentFreeAreas;
        });
      }
      
      return newPaidAreas;
    });
  };

  const handleBogofFreeAreaChange = (areaId: string, checked: boolean) => {
    setBogofFreeAreas(prev => 
      checked ? [...prev, areaId] : prev.filter(id => id !== areaId)
    );
  };

  const handleSave = async () => {
    if (!pricingBreakdown) return;

    setSubmitting(true);
    try {
      console.log('Starting quote save...');
      
      let monthlyFinal, durationDiscountPercent = 0;
      
      if (pricingModel === 'leafleting') {
        monthlyFinal = pricingBreakdown.finalTotal;
      } else {
        const relevantDurationData = effectiveDurations?.find(d => d.id === selectedDuration);
        // Check if it's a regular duration (has discount_percentage) or leaflet duration
        const isRegularDuration = relevantDurationData && 'discount_percentage' in relevantDurationData;
        durationDiscountPercent = isRegularDuration ? (relevantDurationData as any).discount_percentage : 0;
        const subtotalAfterVolume = pricingBreakdown.subtotal - (pricingBreakdown.volumeDiscount || 0);
        monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);
      }

      const updatedQuote = {
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        title: formData.title,
        pricing_model: pricingModel,
        ad_size_id: pricingModel === 'leafleting' ? null : selectedAdSize,
        duration_id: selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : [],
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : [],
        monthly_price: monthlyFinal,
        subtotal: pricingBreakdown.subtotal || pricingBreakdown.finalTotal,
        final_total: pricingBreakdown.finalTotal,
        duration_multiplier: pricingBreakdown.durationMultiplier || 1,
        total_circulation: pricingBreakdown.totalCirculation,
        volume_discount_percent: pricingBreakdown.volumeDiscountPercent || 0,
        duration_discount_percent: durationDiscountPercent,
        pricing_breakdown: JSON.parse(JSON.stringify(pricingBreakdown)),
        selections: {
          pricingModel,
          selectedAdSize,
          selectedDuration,
          selectedAreas,
          bogofPaidAreas,
          bogofFreeAreas,
          selectedMonths
        }
      };

      console.log('About to call onSave with:', updatedQuote);
      await onSave(updatedQuote);
      console.log('onSave completed successfully');
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      console.log('Setting submitting to false');
      setSubmitting(false);
    }
  };

  if (pricingLoading || leafletAreasLoading || leafletDurationsLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div>Loading pricing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_name">Name *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="title">Quote Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a title for this quote"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Model */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Model</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={pricingModel} onValueChange={(value: 'fixed' | 'bogof' | 'leafleting') => setPricingModel(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed">Fixed Term</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bogof" id="bogof" />
              <Label htmlFor="bogof">3+ Repeat Package (BOGOF)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="leafleting" id="leafleting" />
              <Label htmlFor="leafleting">Leafleting Service</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Ad Size Selection - Only for non-leafleting */}
      {pricingModel !== 'leafleting' && (
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Size</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAdSize} onValueChange={setSelectedAdSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select ad size" />
              </SelectTrigger>
              <SelectContent>
                {availableAdSizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} ({size.dimensions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Duration Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {effectiveDurations?.map((duration) => (
                <SelectItem key={duration.id} value={duration.id}>
                  {duration.name}
                  {pricingModel === 'leafleting' && ` (${duration.months} months)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Area Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pricingModel === 'bogof' ? 'Area Selection (Buy 1 Get 1 Free)' : 
             pricingModel === 'leafleting' ? 'Leafleting Distribution Areas' : 'Distribution Areas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* BOGOF Paid Areas Section */}
          {pricingModel === 'bogof' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Paid Areas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {effectiveAreas?.map((area) => (
                    <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`paid-${area.id}`}
                            checked={bogofPaidAreas.includes(area.id)}
                            onCheckedChange={(checked) => handleBogofPaidAreaChange(area.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2" onClick={() => handleBogofPaidAreaChange(area.id, !bogofPaidAreas.includes(area.id))}>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`paid-${area.id}`} className="text-sm font-medium cursor-pointer">
                                {area.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {(area as any).circulation?.toLocaleString() || 0} homes
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Postcodes: {Array.isArray(area.postcodes) ? area.postcodes.join(', ') : 'N/A'}
                              </span>
                            </div>
                            
                            {/* Schedule Information */}
                            {area.schedule && Array.isArray(area.schedule) && area.schedule.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                                  <Calendar className="h-3 w-3" />
                                  Publication Schedule:
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium">Copy:</span> {(area.schedule[0] as any)?.copyDeadline || (area.schedule[0] as any)?.copy_deadline || 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Print:</span> {(area.schedule[0] as any)?.printDeadline || (area.schedule[0] as any)?.print_deadline || 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Delivery:</span> {(area.schedule[0] as any)?.deliveryDate || (area.schedule[0] as any)?.delivery_date || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* BOGOF Free Areas Section */}
              {bogofPaidAreas.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-600">Select Your FREE Areas!</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-3">
                      🎁 You can select up to {bogofPaidAreas.length} FREE area{bogofPaidAreas.length > 1 ? 's' : ''} to go with your {bogofPaidAreas.length} paid area{bogofPaidAreas.length > 1 ? 's' : ''}!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {effectiveAreas?.filter(area => !bogofPaidAreas.includes(area.id)).map((area) => (
                         <div key={area.id} className="flex items-center space-x-3 p-3 bg-white rounded border border-green-200">
                           <Checkbox
                             id={`free-${area.id}`}
                             checked={bogofFreeAreas.includes(area.id)}
                             onCheckedChange={(checked) => handleBogofFreeAreaChange(area.id, checked as boolean)}
                             disabled={!bogofFreeAreas.includes(area.id) && bogofFreeAreas.length >= bogofPaidAreas.length}
                           />
                          <Label htmlFor={`free-${area.id}`} className="text-sm cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{area.name}</span>
                              <Badge variant="secondary" className="text-xs text-green-700">FREE</Badge>
                            </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {(area as any).circulation?.toLocaleString() || 0} homes
                             </div>
                            {/* Schedule Information for Free Areas */}
                            {area.schedule && Array.isArray(area.schedule) && area.schedule.length > 0 && (
                              <div className="text-xs text-gray-600 mt-2">
                                <div className="font-medium mb-1">Publication Schedule:</div>
                                 <div className="grid grid-cols-3 gap-1">
                                   <div>Copy: {(area.schedule[0] as any)?.copyDeadline || (area.schedule[0] as any)?.copy_deadline || 'N/A'}</div>
                                   <div>Print: {(area.schedule[0] as any)?.printDeadline || (area.schedule[0] as any)?.print_deadline || 'N/A'}</div>
                                   <div>Delivery: {(area.schedule[0] as any)?.deliveryDate || (area.schedule[0] as any)?.delivery_date || 'N/A'}</div>
                                 </div>
                              </div>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Non-BOGOF Area Selection */}
          {pricingModel !== 'bogof' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effectiveAreas?.map((area) => {
                const isSelected = selectedAreas.includes(area.id);

                return (
                  <Card key={area.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={area.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleAreaSelection(area.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={area.id} className="text-sm font-medium cursor-pointer">
                              {area.name}
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {pricingModel === 'leafleting' 
                                ? `${area.bimonthly_circulation?.toLocaleString() || 0} homes`
                                : `${area.circulation?.toLocaleString() || 0} homes`
                              }
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Postcodes: {pricingModel === 'leafleting' 
                                ? area.postcodes || 'N/A'
                                : (Array.isArray(area.postcodes) ? area.postcodes.join(', ') : 'N/A')
                              }
                            </span>
                          </div>
                          
                          {pricingModel === 'leafleting' && area.price_with_vat && (
                            <div className="text-xs font-medium text-primary">
                              Price: {formatLeafletPrice(area.price_with_vat)} (inc. VAT)
                            </div>
                          )}
                          
                          {/* Schedule Information */}
                          {area.schedule && Array.isArray(area.schedule) && area.schedule.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                                <Calendar className="h-3 w-3" />
                                Publication Schedule:
                              </div>
                               <div className="grid grid-cols-3 gap-2 text-xs">
                                 <div>
                                   <span className="font-medium">Copy:</span> {(area.schedule[0] as any)?.copyDeadline || (area.schedule[0] as any)?.copy_deadline || 'N/A'}
                                 </div>
                                 <div>
                                   <span className="font-medium">Print:</span> {(area.schedule[0] as any)?.printDeadline || (area.schedule[0] as any)?.print_deadline || 'N/A'}
                                 </div>
                                 <div>
                                   <span className="font-medium">Delivery:</span> {(area.schedule[0] as any)?.deliveryDate || (area.schedule[0] as any)?.delivery_date || 'N/A'}
                                 </div>
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {pricingBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pricingModel === 'leafleting' ? (
                <>
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
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Price:</span>
                    <span>{formatLeafletPrice(pricingBreakdown.finalTotal)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Circulation: {pricingBreakdown.totalCirculation?.toLocaleString()} homes
                  </div>
                  {pricingBreakdown.totalCirculation && pricingBreakdown.finalTotal && (
                    <div className="text-sm text-muted-foreground">
                      CPM: {formatLeafletPrice((pricingBreakdown.finalTotal / pricingBreakdown.totalCirculation) * 1000)}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(pricingBreakdown.subtotal)}</span>
                  </div>
                  {pricingBreakdown.volumeDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Volume Discount ({pricingBreakdown.volumeDiscountPercent}%):</span>
                      <span>-{formatPrice(pricingBreakdown.volumeDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Monthly Price:</span>
                    <span>{formatPrice(pricingBreakdown.finalTotal)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Circulation: {pricingBreakdown.totalCirculation?.toLocaleString()} homes
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={submitting || !pricingBreakdown || !formData.contact_name || !formData.email}
        >
          {submitting ? 'Saving...' : 'Save Quote'}
        </Button>
      </div>
    </div>
  );
};

export default EditQuoteForm;