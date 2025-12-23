import { DistributorData } from './types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, MapPin, Car, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistributorJourneyProps {
  data: Partial<DistributorData>;
  onChange: (updates: Partial<DistributorData>) => void;
  step: 'availability' | 'experience';
}

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

const areas = [
  'Eastleigh',
  'Fair Oak & Horton Heath',
  'Hedge End',
  'West End',
  'Botley',
  'Bishops Waltham',
  'Chandlers Ford',
  'Southampton',
  'Winchester'
];

const vehicleTypes = [
  { value: 'foot', label: 'On foot' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' }
];

const hoursOptions = [
  '2-5 hours',
  '5-10 hours',
  '10-20 hours',
  '20+ hours'
];

const DistributorAvailabilityStep = ({ data, onChange }: Omit<DistributorJourneyProps, 'step'>) => {
  const currentDays = data.available_days || [];
  const currentAreas = data.preferred_areas || [];
  
  const toggleDay = (dayId: string) => {
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId];
    onChange({ available_days: newDays });
  };
  
  const toggleArea = (area: string) => {
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    onChange({ preferred_areas: newAreas });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Your Availability
        </h2>
        <p className="text-gray-600 text-sm">
          Tell us when and where you can distribute
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            Which days are you available? <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <label
                key={day.id}
                className={cn(
                  "px-4 py-2 rounded-full border cursor-pointer transition-colors text-sm font-medium",
                  currentDays.includes(day.id)
                    ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={currentDays.includes(day.id)}
                  onChange={() => toggleDay(day.id)}
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            Preferred areas <span className="text-destructive">*</span>
          </Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {areas.map((area) => (
              <label
                key={area}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  currentAreas.includes(area)
                    ? "bg-orange-50 border-orange-300"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <Checkbox
                  checked={currentAreas.includes(area)}
                  onCheckedChange={() => toggleArea(area)}
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            Hours per week you can commit
          </Label>
          <Select
            value={data.hours_per_week || ''}
            onValueChange={(value) => onChange({ hours_per_week: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hours" />
            </SelectTrigger>
            <SelectContent>
              {hoursOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const DistributorExperienceStep = ({ data, onChange }: Omit<DistributorJourneyProps, 'step'>) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Transport & Experience
        </h2>
        <p className="text-gray-600 text-sm">
          Tell us about your delivery experience
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium flex items-center gap-2 mb-3">
            <Car className="h-4 w-4 text-gray-400" />
            How will you deliver? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.vehicle_type || ''}
            onValueChange={(value) => onChange({ vehicle_type: value })}
            className="grid gap-2 sm:grid-cols-2"
          >
            {vehicleTypes.map((vehicle) => (
              <label
                key={vehicle.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  data.vehicle_type === vehicle.value
                    ? "bg-orange-50 border-orange-300"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <RadioGroupItem value={vehicle.value} />
                <span className="text-sm font-medium">{vehicle.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">
            Do you have delivery/distribution experience?
          </Label>
          <div className="flex gap-4">
            <label className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
              data.has_experience === true
                ? "bg-orange-50 border-orange-300"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}>
              <input
                type="radio"
                name="experience"
                className="sr-only"
                checked={data.has_experience === true}
                onChange={() => onChange({ has_experience: true })}
              />
              <span>Yes</span>
            </label>
            <label className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
              data.has_experience === false
                ? "bg-orange-50 border-orange-300"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}>
              <input
                type="radio"
                name="experience"
                className="sr-only"
                checked={data.has_experience === false}
                onChange={() => onChange({ has_experience: false })}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {data.has_experience && (
          <div className="space-y-2">
            <Label htmlFor="experience_details">
              Tell us about your experience
            </Label>
            <Textarea
              id="experience_details"
              value={data.experience_details || ''}
              onChange={(e) => onChange({ experience_details: e.target.value })}
              placeholder="What delivery work have you done before? How long? Any relevant skills?"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DistributorJourney = ({ data, onChange, step }: DistributorJourneyProps) => {
  if (step === 'availability') {
    return <DistributorAvailabilityStep data={data} onChange={onChange} />;
  }
  return <DistributorExperienceStep data={data} onChange={onChange} />;
};

export default DistributorJourney;
