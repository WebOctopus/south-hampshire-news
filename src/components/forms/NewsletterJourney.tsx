import { NewsletterData, JourneyType } from './types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Lightbulb, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsletterJourneyProps {
  data: Partial<NewsletterData>;
  onChange: (updates: Partial<NewsletterData>) => void;
  journeyType: JourneyType;
}

const discoverExtraInterests = [
  { id: 'local_news', label: 'Local News & Updates' },
  { id: 'events', label: 'Events & What\'s On' },
  { id: 'food_drink', label: 'Food & Drink' },
  { id: 'competitions', label: 'Competitions & Giveaways' },
  { id: 'business', label: 'Local Business News' },
  { id: 'community', label: 'Community Stories' }
];

const thinkInterests = [
  { id: 'marketing_tips', label: 'Marketing Tips & Strategies' },
  { id: 'case_studies', label: 'Local Business Case Studies' },
  { id: 'industry_news', label: 'Industry News & Trends' },
  { id: 'special_offers', label: 'Special Advertising Offers' },
  { id: 'events', label: 'Business Events & Networking' }
];

const frequencyOptions = [
  { value: 'weekly', label: 'Weekly digest', description: 'All the best content once a week' },
  { value: 'daily', label: 'Daily updates', description: 'Stay on top of everything' },
  { value: 'monthly', label: 'Monthly highlights', description: 'Just the essentials' }
];

const NewsletterJourney = ({ data, onChange, journeyType }: NewsletterJourneyProps) => {
  const isDiscoverExtra = journeyType === 'discover_extra';
  const interests = isDiscoverExtra ? discoverExtraInterests : thinkInterests;
  
  const currentInterests = data.interests || [];
  
  const toggleInterest = (interestId: string) => {
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(i => i !== interestId)
      : [...currentInterests, interestId];
    onChange({ interests: newInterests });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
          isDiscoverExtra ? "bg-purple-100" : "bg-rose-100"
        )}>
          {isDiscoverExtra 
            ? <Mail className="h-8 w-8 text-purple-600" />
            : <Lightbulb className="h-8 w-8 text-rose-600" />
          }
        </div>
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          {isDiscoverExtra ? 'Discover EXTRA' : 'THINK Advertising'}
        </h2>
        <p className="text-gray-600 text-sm">
          {isDiscoverExtra 
            ? 'Choose your interests to personalize your newsletter'
            : 'Select topics you\'d like to learn about'
          }
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-gray-400" />
          What interests you? <span className="text-gray-400 text-sm font-normal">(optional)</span>
        </Label>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {interests.map((interest) => (
            <label
              key={interest.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                currentInterests.includes(interest.id)
                  ? isDiscoverExtra 
                    ? "bg-purple-50 border-purple-300"
                    : "bg-rose-50 border-rose-300"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <Checkbox
                checked={currentInterests.includes(interest.id)}
                onCheckedChange={() => toggleInterest(interest.id)}
              />
              <span className="text-sm font-medium text-gray-700">{interest.label}</span>
            </label>
          ))}
        </div>
      </div>

      {isDiscoverExtra && (
        <div className="space-y-4 pt-4 border-t">
          <Label className="text-base font-medium">
            How often would you like to hear from us?
          </Label>
          
          <RadioGroup
            value={data.frequency_preference || 'weekly'}
            onValueChange={(value) => onChange({ frequency_preference: value })}
            className="space-y-3"
          >
            {frequencyOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  data.frequency_preference === option.value
                    ? "bg-purple-50 border-purple-300"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default NewsletterJourney;
