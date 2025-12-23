import { DistributorData, Consents } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Home, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistributorJourneyProps {
  data: Partial<DistributorData>;
  onChange: (updates: Partial<DistributorData>) => void;
  consents: Consents;
  onConsentsChange: (updates: Partial<Consents>) => void;
}

const deliveryAreas = [
  { id: 'southampton', label: 'Southampton' },
  { id: 'chandlers_ford_north_baddesley', label: "Chandler's Ford & North Baddesley" },
  { id: 'eastleigh_surrounds', label: 'Eastleigh & Surrounds' },
  { id: 'hedge_end_west_end_botley', label: 'Hedge End, West End & Botley' },
  { id: 'locks_heath_surrounds', label: 'Locks Heath & Surrounds' },
  { id: 'fareham_surrounds', label: 'Fareham & Surrounds' },
  { id: 'winchester', label: 'Winchester' },
  { id: 'romsey', label: 'Romsey' },
  { id: 'totton_waterside_blackfield', label: 'Totton, Waterside & Blackfield' },
  { id: 'woolston_itchen_peartree_sholing', label: 'Woolston, Itchen, Peartree & Sholing' }
];

const safeStorageOptions = [
  { value: 'yes', label: 'Yes, I have safe storage' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' }
];

const ageBandOptions = [
  { value: 'under_16', label: 'Under 16' },
  { value: '16_17', label: '16-17' },
  { value: '18_plus', label: '18+' }
];

const DistributorJourney = ({ data, onChange, consents, onConsentsChange }: DistributorJourneyProps) => {
  const currentAreas = data.distribution_areas_interested || [];
  
  const toggleArea = (areaId: string) => {
    const newAreas = currentAreas.includes(areaId)
      ? currentAreas.filter(a => a !== areaId)
      : [...currentAreas, areaId];
    onChange({ distribution_areas_interested: newAreas });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          Distribution Details
        </h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your availability and location
        </p>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          Your Address
        </Label>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="address_1" className="text-sm">
              Address Line 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address_1"
              value={data.distribution_address_1 || ''}
              onChange={(e) => onChange({ distribution_address_1: e.target.value })}
              placeholder="Street address"
            />
          </div>
          
          <div>
            <Label htmlFor="address_2" className="text-sm">
              Address Line 2
            </Label>
            <Input
              id="address_2"
              value={data.distribution_address_2 || ''}
              onChange={(e) => onChange({ distribution_address_2: e.target.value })}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          
          <div>
            <Label htmlFor="city" className="text-sm">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={data.distribution_city || ''}
              onChange={(e) => onChange({ distribution_city: e.target.value })}
              placeholder="City"
            />
          </div>
        </div>
      </div>

      {/* Safe Storage */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Do you have safe storage available? <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.distribution_safe_storage || ''}
          onValueChange={(value) => onChange({ distribution_safe_storage: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {safeStorageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Areas Interested */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Areas interested in delivering <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">Select all areas you'd be willing to deliver to</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {deliveryAreas.map((area) => (
            <label
              key={area.id}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                currentAreas.includes(area.id)
                  ? "bg-primary/10 border-primary"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              <Checkbox
                checked={currentAreas.includes(area.id)}
                onCheckedChange={() => toggleArea(area.id)}
              />
              <span className="text-sm">{area.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Age Band */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Age Band <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.distribution_age_band || ''}
          onValueChange={(value) => onChange({ distribution_age_band: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your age band" />
          </SelectTrigger>
          <SelectContent>
            {ageBandOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Email Consent */}
      <div className="pt-4 border-t">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={consents.email_contact}
            onCheckedChange={(checked) => onConsentsChange({ email_contact: checked === true })}
            className="mt-0.5"
          />
          <span className="text-sm">
            I consent to be contacted by email regarding distribution opportunities <span className="text-destructive">*</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default DistributorJourney;
