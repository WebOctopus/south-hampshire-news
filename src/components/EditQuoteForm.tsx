import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateAdvertisingPrice, formatPrice } from '@/lib/pricingCalculator';
import { DbArea, DbAdSize, DbDuration } from '@/hooks/usePricingData';

interface EditQuoteFormProps {
  quote: any;
  areas: DbArea[];
  adSizes: DbAdSize[];
  durations: DbDuration[];
  subscriptionDurations: DbDuration[];
  onSave: (updatedQuote: any) => void;
  onCancel: () => void;
}

const EditQuoteForm: React.FC<EditQuoteFormProps> = ({
  quote,
  areas,
  adSizes,
  durations,
  subscriptionDurations,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    contact_name: quote.contact_name || '',
    email: quote.email || '',
    phone: quote.phone || '',
    company: quote.company || '',
    title: quote.title || ''
  });

  const [pricingModel, setPricingModel] = useState<'fixed' | 'subscription' | 'bogof'>(quote.pricing_model || 'fixed');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(quote.selected_area_ids || []);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>(quote.bogof_paid_area_ids || []);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>(quote.bogof_free_area_ids || []);
  const [selectedAdSize, setSelectedAdSize] = useState<string>(quote.ad_size_id || '');
  const [selectedDuration, setSelectedDuration] = useState<string>(quote.duration_id || '');
  const [submitting, setSubmitting] = useState(false);

  // Calculate effective areas based on pricing model
  const effectiveSelectedAreas = pricingModel === 'bogof' ? bogofPaidAreas : selectedAreas;

  // Filter ad sizes and durations based on pricing model
  const availableAdSizes = adSizes.filter(size => 
    size.available_for.includes(pricingModel === 'bogof' ? 'subscription' : pricingModel)
  );

  const relevantDurations = (pricingModel === 'subscription' || pricingModel === 'bogof') 
    ? subscriptionDurations 
    : durations;

  // Calculate pricing breakdown
  const pricingBreakdown = React.useMemo(() => {
    if (!selectedAdSize || !selectedDuration || effectiveSelectedAreas.length === 0) {
      return null;
    }

    const adSize = adSizes.find(size => size.id === selectedAdSize);
    const duration = relevantDurations.find(d => d.id === selectedDuration);
    
    if (!adSize || !duration) return null;

    const isSubscription = pricingModel === 'subscription' || pricingModel === 'bogof';
    
    return calculateAdvertisingPrice(
      effectiveSelectedAreas,
      selectedAdSize,
      selectedDuration,
      isSubscription,
      areas,
      adSizes,
      relevantDurations,
      subscriptionDurations,
      [] // volume discounts array - we can add this later if needed
    );
  }, [selectedAdSize, selectedDuration, effectiveSelectedAreas, pricingModel, bogofPaidAreas, bogofFreeAreas, areas, adSizes, relevantDurations, subscriptionDurations]);

  const handleAreaSelection = (areaId: string, checked: boolean) => {
    if (pricingModel === 'bogof') {
      // BOGOF logic - handle paid and free areas
      if (checked) {
        if (bogofPaidAreas.length === 0) {
          setBogofPaidAreas([areaId]);
        } else if (bogofPaidAreas.length === 1 && !bogofPaidAreas.includes(areaId)) {
          setBogofFreeAreas([areaId]);
        }
      } else {
        setBogofPaidAreas(prev => prev.filter(id => id !== areaId));
        setBogofFreeAreas(prev => prev.filter(id => id !== areaId));
      }
    } else {
      // Regular area selection
      setSelectedAreas(prev => 
        checked 
          ? [...prev, areaId]
          : prev.filter(id => id !== areaId)
      );
    }
  };

  const handleSave = async () => {
    if (!pricingBreakdown) return;

    setSubmitting(true);
    try {
      const relevantDurationData = relevantDurations.find(d => d.id === selectedDuration);
      const durationDiscountPercent = relevantDurationData?.discount_percentage || 0;
      const subtotalAfterVolume = pricingBreakdown.subtotal - pricingBreakdown.volumeDiscount;
      const monthlyFinal = subtotalAfterVolume * (1 - durationDiscountPercent / 100);

      const updatedQuote = {
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        title: formData.title,
        pricing_model: pricingModel,
        ad_size_id: selectedAdSize,
        duration_id: selectedDuration,
        selected_area_ids: effectiveSelectedAreas,
        bogof_paid_area_ids: pricingModel === 'bogof' ? bogofPaidAreas : [],
        bogof_free_area_ids: pricingModel === 'bogof' ? bogofFreeAreas : [],
        monthly_price: monthlyFinal,
        subtotal: pricingBreakdown.subtotal,
        final_total: pricingBreakdown.finalTotal,
        duration_multiplier: pricingBreakdown.durationMultiplier,
        total_circulation: pricingBreakdown.totalCirculation,
        volume_discount_percent: pricingBreakdown.volumeDiscountPercent,
        duration_discount_percent: durationDiscountPercent,
        pricing_breakdown: JSON.parse(JSON.stringify(pricingBreakdown)),
        selections: {
          pricingModel,
          selectedAdSize,
          selectedDuration,
          selectedAreas,
          bogofPaidAreas,
          bogofFreeAreas
        }
      };

      await onSave(updatedQuote);
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
          <RadioGroup value={pricingModel} onValueChange={(value: 'fixed' | 'subscription' | 'bogof') => setPricingModel(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed">Fixed Rate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="subscription" id="subscription" />
              <Label htmlFor="subscription">Subscription</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bogof" id="bogof" />
              <Label htmlFor="bogof">Buy 1 Get 1 Free</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Ad Size Selection */}
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
              {relevantDurations.map((duration) => (
                <SelectItem key={duration.id} value={duration.id}>
                  {duration.name}
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
            {pricingModel === 'bogof' ? 'Area Selection (Buy 1 Get 1 Free)' : 'Distribution Areas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area) => {
              const isSelected = pricingModel === 'bogof' 
                ? bogofPaidAreas.includes(area.id) || bogofFreeAreas.includes(area.id)
                : selectedAreas.includes(area.id);
              const isPaid = bogofPaidAreas.includes(area.id);
              const isFree = bogofFreeAreas.includes(area.id);

              return (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={area.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAreaSelection(area.id, checked as boolean)}
                    disabled={pricingModel === 'bogof' && bogofPaidAreas.length === 1 && bogofFreeAreas.length === 1 && !isSelected}
                  />
                  <Label htmlFor={area.id} className="text-sm">
                    {area.name}
                    {pricingModel === 'bogof' && isPaid && <span className="ml-1 text-green-600">(Paid)</span>}
                    {pricingModel === 'bogof' && isFree && <span className="ml-1 text-blue-600">(Free)</span>}
                  </Label>
                </div>
              );
            })}
          </div>
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