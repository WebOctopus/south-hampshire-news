
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CostCalculatorProps {
  children: React.ReactNode;
}

const CostCalculator = ({ children }: CostCalculatorProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    companyName: '',
    selectedAreas: [] as string[],
    adSize: '',
    duration: ''
  });

  const areas = [
    { 
      id: 'area1', 
      name: 'SOUTHAMPTON SUBURBS', 
      postcodes: 'SO15 SO16 SO17', 
      townsVillages: 'Chilworth, Upper Shirley, Rownhams, Bassett, Highfield', 
      circulation: 13500 
    },
    { 
      id: 'area2', 
      name: 'CHANDLER\'S FORD & NORTH BADDESLEY', 
      postcodes: 'SO53 SO52', 
      townsVillages: 'Chandler\'s Ford, North Baddesley', 
      circulation: 13500 
    },
    { 
      id: 'area3', 
      name: 'EASTLEIGH & VILLAGES', 
      postcodes: 'SO50', 
      townsVillages: 'Fair Oak, Bishopstoke, Horton Heath, Allbrook, Boyatt Wood, Eastleigh', 
      circulation: 10500 
    },
    { 
      id: 'area4', 
      name: 'HEDGE END & SURROUNDS', 
      postcodes: 'SO30', 
      townsVillages: 'Hedge End, West End, Botley', 
      circulation: 13000 
    },
    { 
      id: 'area5', 
      name: 'LOCKS HEATH & SURROUNDS', 
      postcodes: 'SO31', 
      townsVillages: 'Locks Heath, Warsash, Swanwick, Bursledon, Hamble, Netley', 
      circulation: 13000 
    },
    { 
      id: 'area6', 
      name: 'FAREHAM & SURROUNDS', 
      postcodes: 'PO13 PO14 PO15', 
      townsVillages: 'Fareham, Titchfield, Stubbington, Lee on Solent, Hill Head', 
      circulation: 14000 
    },
    { 
      id: 'area7', 
      name: 'WICKHAM & BISHOP\'S WALTHAM', 
      postcodes: 'SO32 PO17', 
      townsVillages: 'Wickham, Bishop\'s Waltham', 
      circulation: 14000 
    },
    { 
      id: 'area8', 
      name: 'WINCHESTER & VILLAGES', 
      postcodes: 'SO21 SO22 SO23', 
      townsVillages: 'Winchester, Otterbourne, Colden Common, Hursley, Crawley, South Wonston, Littleton, Sparsholt', 
      circulation: 13500 
    },
    { 
      id: 'area9', 
      name: 'ROMSEY & TEST VALLEY', 
      postcodes: 'SO51 SO20', 
      townsVillages: 'Romsey, Stockbridge, The Wellows, Braishfield, Ampfield, Kings Somborne', 
      circulation: 15000 
    },
    { 
      id: 'area10', 
      name: 'WATERSIDE & TOTTON', 
      postcodes: 'SO40 SO45', 
      townsVillages: 'Totton, Marchwood, Hythe, Dibden, Dibden Purlieu, Holbury, Blackfield', 
      circulation: 14000 
    },
    { 
      id: 'area11', 
      name: 'NEW FOREST TO LYMINGTON', 
      postcodes: 'SO41 SO42 SO43 BH24 4', 
      townsVillages: 'Lymington, Brockenhurst, Lyndhurst, New Milton, Beaulieu', 
      circulation: 13500 
    },
    { 
      id: 'area12', 
      name: 'MEON VALLEY*', 
      postcodes: 'PO9 PO10 PO11 PO12', 
      townsVillages: 'Havant, Waterlooville, Emsworth, Cosham, Drayton, Denmead', 
      circulation: 15000 
    },
    { 
      id: 'area13', 
      name: 'PORTSMOUTH NORTH', 
      postcodes: 'PO6 PO7 PO8', 
      townsVillages: 'Cosham, Drayton, Farlington, Widley, Purbrook', 
      circulation: 14500 
    },
    { 
      id: 'area14', 
      name: 'PORTSMOUTH SOUTH', 
      postcodes: 'PO1 PO2 PO3 PO4 PO5', 
      townsVillages: 'Portsmouth, Southsea, Eastney, Milton, Fratton', 
      circulation: 16000 
    }
  ];

  const adSizes = [
    { id: '1/8-page', label: '1/8 Page', price: 150 },
    { id: '1/4-page', label: '1/4 Page', price: 280 },
    { id: '1/2-page', label: '1/2 Page', price: 520 },
    { id: 'full-page', label: 'Full Page', price: 980 }
  ];

  const durations = [
    { id: '1-month', label: '1 Month' },
    { id: '3-months', label: '3 Months' },
    { id: '6-months', label: '6 Months' }
  ];

  const handleAreaChange = (areaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: checked 
        ? [...prev.selectedAreas, areaId]
        : prev.selectedAreas.filter(id => id !== areaId)
    }));
  };

  const calculatePrice = () => {
    const selectedAdSize = adSizes.find(size => size.id === formData.adSize);
    if (!selectedAdSize || !formData.selectedAreas.length) return 0;

    const basePrice = selectedAdSize.price;
    const areasCount = formData.selectedAreas.length;
    const totalDistribution = formData.selectedAreas.reduce((total, areaId) => {
      const area = areas.find(a => a.id === areaId);
      return total + (area ? area.circulation : 0);
    }, 0);

    let multiplier = 1;
    if (formData.duration === '3-months') multiplier = 2.7;
    if (formData.duration === '6-months') multiplier = 5.1;

    return Math.round(basePrice * areasCount * multiplier);
  };

  const finalPrice = calculatePrice();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-community-navy">
            Advertising Cost Calculator
          </DialogTitle>
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

          {/* Select Distribution Areas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Select Distribution Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={area.id}
                      checked={formData.selectedAreas.includes(area.id)}
                      onCheckedChange={(checked) => handleAreaChange(area.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={area.id} className="font-bold text-community-navy cursor-pointer block">
                        {area.name}
                      </Label>
                      <p className="text-sm text-gray-700 font-medium mt-1">
                        {area.postcodes}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {area.townsVillages}
                      </p>
                      <p className="text-sm text-community-green font-bold mt-2">
                        Circulation: {area.circulation.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Select Advertisement Size */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Select Advertisement Size
              </h3>
              <RadioGroup
                value={formData.adSize}
                onValueChange={(value) => setFormData(prev => ({ ...prev, adSize: value }))}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {adSizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={size.id} id={size.id} />
                    <div>
                      <Label htmlFor={size.id} className="font-medium cursor-pointer">
                        {size.label}
                      </Label>
                      <p className="text-sm text-community-green">£{size.price} per area</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Campaign Duration */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Campaign Duration
              </h3>
              <RadioGroup
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                className="grid grid-cols-3 gap-4"
              >
                {durations.map((duration) => (
                  <div key={duration.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={duration.id} id={duration.id} />
                    <Label htmlFor={duration.id} className="font-medium cursor-pointer">
                      {duration.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-bold text-community-navy mb-4">
                Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Circulation:</span>
                  <span className="font-medium">
                    {formData.selectedAreas.reduce((total, areaId) => {
                      const area = areas.find(a => a.id === areaId);
                      return total + (area ? area.circulation : 0);
                    }, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Areas:</span>
                  <span className="font-medium">{formData.selectedAreas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ad Size:</span>
                  <span className="font-medium">
                    {formData.adSize ? adSizes.find(s => s.id === formData.adSize)?.label : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {formData.duration ? durations.find(d => d.id === formData.duration)?.label : 'Not selected'}
                  </span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between text-xl font-bold text-community-navy">
                    <span>Estimated Price:</span>
                    <span>£{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full bg-community-green hover:bg-green-600"
                  disabled={!formData.fullName || !formData.emailAddress || !formData.selectedAreas.length || !formData.adSize || !formData.duration}
                >
                  Request Quote
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  * This is an estimated price. Final pricing may vary based on specific requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CostCalculator;
