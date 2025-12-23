import { AdvertisingData } from './types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Target, PoundSterling, Calendar } from 'lucide-react';

interface AdvertisingJourneyProps {
  data: Partial<AdvertisingData>;
  onChange: (updates: Partial<AdvertisingData>) => void;
  errors?: Partial<Record<keyof AdvertisingData, string>>;
}

const businessTypes = [
  'Retail / Shop',
  'Restaurant / Cafe / Pub',
  'Professional Services',
  'Health & Beauty',
  'Home Services',
  'Automotive',
  'Events / Entertainment',
  'Charity / Non-profit',
  'Other'
];

const advertisingGoals = [
  'Increase brand awareness',
  'Drive footfall / visits',
  'Generate leads / enquiries',
  'Promote a specific offer or event',
  'Recruit staff',
  'Other'
];

const budgetRanges = [
  'Under £100',
  '£100 - £300',
  '£300 - £500',
  '£500 - £1,000',
  '£1,000+',
  'Not sure yet'
];

const timelines = [
  'ASAP / Next issue',
  'Within 1 month',
  'Within 3 months',
  'Just researching for now'
];

const AdvertisingJourney = ({ data, onChange, errors = {} }: AdvertisingJourneyProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Tell Us About Your Campaign
        </h2>
        <p className="text-gray-600 text-sm">
          Help us understand your advertising needs
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business_type" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            What type of business are you? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.business_type || ''}
            onValueChange={(value) => onChange({ business_type: value })}
          >
            <SelectTrigger id="business_type">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.business_type && (
            <p className="text-sm text-destructive">{errors.business_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="advertising_goal" className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            What's your main goal? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.advertising_goal || ''}
            onValueChange={(value) => onChange({ advertising_goal: value })}
          >
            <SelectTrigger id="advertising_goal">
              <SelectValue placeholder="Select your main objective" />
            </SelectTrigger>
            <SelectContent>
              {advertisingGoals.map((goal) => (
                <SelectItem key={goal} value={goal}>{goal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget_range" className="flex items-center gap-2">
              <PoundSterling className="h-4 w-4 text-gray-400" />
              Budget Range
            </Label>
            <Select
              value={data.budget_range || ''}
              onValueChange={(value) => onChange({ budget_range: value })}
            >
              <SelectTrigger id="budget_range">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              Timeline
            </Label>
            <Select
              value={data.timeline || ''}
              onValueChange={(value) => onChange({ timeline: value })}
            >
              <SelectTrigger id="timeline">
                <SelectValue placeholder="When do you want to start?" />
              </SelectTrigger>
              <SelectContent>
                {timelines.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_info">
            Anything else we should know?
          </Label>
          <Textarea
            id="additional_info"
            value={data.additional_info || ''}
            onChange={(e) => onChange({ additional_info: e.target.value })}
            placeholder="Tell us about your business, any specific requirements, or questions you have..."
            rows={4}
          />
        </div>

        <div className="bg-community-green/5 border border-community-green/20 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> For detailed quotes and to build your own campaign, 
            you can also use our{' '}
            <a href="/advertising" className="text-community-green hover:underline font-medium">
              Advertising Calculator
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvertisingJourney;
