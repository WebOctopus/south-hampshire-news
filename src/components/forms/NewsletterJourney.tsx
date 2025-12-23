import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Newspaper } from 'lucide-react';
import { JourneyType, DiscoverExtraData, ThinkMonthlyData, Consents } from './types';

interface NewsletterJourneyProps {
  data: Partial<DiscoverExtraData> | Partial<ThinkMonthlyData>;
  onChange: (updates: Record<string, unknown>) => void;
  journeyType: JourneyType;
  consents: Consents;
  onConsentsChange: (updates: Partial<Consents>) => void;
}

const frequencyOptions = [
  { value: 'every_issue', label: 'Every issue' },
  { value: 'most_issues', label: 'Most issues' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'first_time', label: 'First time seeing it' }
];

const interestOptions = [
  { value: 'competitions', label: 'Competitions' },
  { value: 'whats_on', label: "What's On" },
  { value: 'on_the_grapevine_local_stories', label: 'On the Grapevine (Local Stories)' },
  { value: 'theatre_listings', label: 'Theatre Listings' },
  { value: 'puzzles', label: 'Puzzles' },
  { value: 'recipe', label: 'Recipe' },
  { value: 'editors_letter', label: "Editor's Letter" },
  { value: 'lifestyle_articles', label: 'Lifestyle Articles' }
];

const sourceBusinessOptions = [
  { value: 'yes_definitely', label: 'Yes, definitely' },
  { value: 'yes_already_have', label: 'Yes, I already have' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'unlikely', label: 'Unlikely' }
];

const ratingOptions = [
  { value: 'much_better', label: 'Much better' },
  { value: 'better', label: 'Better' },
  { value: 'about_same', label: 'About the same' },
  { value: 'not_as_good', label: 'Not as good' },
  { value: 'only_one_receive', label: "It's the only one I receive" }
];

const NewsletterJourney: React.FC<NewsletterJourneyProps> = ({ 
  data, 
  onChange, 
  journeyType,
  consents,
  onConsentsChange
}) => {
  const discoverData = data as Partial<DiscoverExtraData>;
  const thinkData = data as Partial<ThinkMonthlyData>;

  const toggleInterest = (interest: string) => {
    const currentInterests = discoverData.newsletter_discover_interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    onChange({ newsletter_discover_interests: newInterests });
  };

  if (journeyType === 'discover_extra') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Newspaper className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Discover EXTRA Feedback</h2>
            <p className="text-sm text-muted-foreground">Help us improve your Discover experience</p>
          </div>
        </div>

        {/* Keep/Use Frequency */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            How often do you keep and use Discover? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={discoverData.newsletter_discover_keep_use_frequency || ''}
            onValueChange={(value) => onChange({ newsletter_discover_keep_use_frequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency..." />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Which sections interest you most? (optional)
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interestOptions.map(option => {
              const isSelected = (discoverData.newsletter_discover_interests || []).includes(option.value);
              return (
                <div
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleInterest(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleInterest(option.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Local Business */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Would you use Discover to source a local business? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={discoverData.newsletter_discover_source_local_business || ''}
            onValueChange={(value) => onChange({ newsletter_discover_source_local_business: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {sourceBusinessOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Comparison */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            How does Discover rate compared to other community magazines you get? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={discoverData.newsletter_discover_rating || ''}
            onValueChange={(value) => onChange({ newsletter_discover_rating: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating..." />
            </SelectTrigger>
            <SelectContent>
              {ratingOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Comments */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Any other comments? (optional)
          </Label>
          <Textarea
            placeholder="Share your thoughts about Discover..."
            value={discoverData.newsletter_discover_comments || ''}
            onChange={(e) => onChange({ newsletter_discover_comments: e.target.value })}
            rows={4}
          />
        </div>

        {/* Consent */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <Checkbox
              id="discover_extra_consent"
              checked={consents.discover_extra}
              onCheckedChange={(checked) => onConsentsChange({ discover_extra: checked as boolean })}
            />
            <Label htmlFor="discover_extra_consent" className="text-sm leading-relaxed cursor-pointer">
              <span className="font-medium">Yes, I'd like to receive Discover EXTRA emails</span> <span className="text-destructive">*</span>
              <p className="text-muted-foreground mt-1">
                Get exclusive content, competitions, and local news delivered to your inbox.
              </p>
            </Label>
          </div>
        </div>
      </div>
    );
  }

  if (journeyType === 'think_advertising') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">THINK Monthly Newsletter</h2>
            <p className="text-sm text-muted-foreground">Stay updated with advertising tips and offers</p>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Feedback / what you'd like to see (optional)
          </Label>
          <Textarea
            placeholder="Tell us what topics or content you'd like us to cover..."
            value={thinkData.newsletter_think_feedback || ''}
            onChange={(e) => onChange({ newsletter_think_feedback: e.target.value })}
            rows={5}
          />
          <p className="text-sm text-muted-foreground">
            Your feedback helps us create content that's valuable to you.
          </p>
        </div>

        {/* Consent */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <Checkbox
              id="think_monthly_consent"
              checked={consents.think_monthly}
              onCheckedChange={(checked) => onConsentsChange({ think_monthly: checked as boolean })}
            />
            <Label htmlFor="think_monthly_consent" className="text-sm leading-relaxed cursor-pointer">
              <span className="font-medium">Yes, I'd like to receive THINK monthly emails</span> <span className="text-destructive">*</span>
              <p className="text-muted-foreground mt-1">
                Get advertising tips, special offers, and business insights delivered monthly.
              </p>
            </Label>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default NewsletterJourney;
