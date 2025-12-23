import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvertisingData, Consents } from './types';

interface AdvertisingJourneyProps {
  data: AdvertisingData;
  onChange: (data: Partial<AdvertisingData>) => void;
  consents: Consents;
  onConsentsChange: (consents: Partial<Consents>) => void;
  errors?: Record<string, string>;
}

const situationOptions = [
  { value: 'not_currently_advertising', label: 'Not currently advertising', icon: '🆕' },
  { value: 'currently_advertising_change_extend_improve', label: 'Currently advertising - want to change, extend or improve', icon: '📈' },
  { value: 'advertising_marketing_agency', label: 'Advertising/marketing agency', icon: '🏢' },
];

const leafletOptions = [
  { value: 'yes_distribution_only', label: 'Yes - distribution only', icon: '📬' },
  { value: 'yes_design_print_distribution', label: 'Yes - design, print & distribution', icon: '🎨' },
  { value: 'no_thanks', label: 'No thanks', icon: '❌' },
];

const editionOptions = [
  { value: 'southampton_city_suburbs', label: 'Southampton City & Suburbs' },
  { value: 'chandlers_ford', label: "Chandler's Ford" },
  { value: 'eastleigh_surrounds', label: 'Eastleigh & Surrounds' },
  { value: 'hedge_end_botley', label: 'Hedge End & Botley' },
  { value: 'locks_heath_warsash_whiteley', label: 'Locks Heath, Warsash & Whiteley' },
  { value: 'itchfield_lee_on_solent_stubbington_alverstoke', label: 'Titchfield, Lee-on-Solent, Stubbington & Alverstoke' },
  { value: 'meon_valley', label: 'Meon Valley' },
  { value: 'winchester_villages', label: 'Winchester Villages' },
  { value: 'romsey_north_baddesley', label: 'Romsey & North Baddesley' },
  { value: 'totton', label: 'Totton' },
  { value: 'new_forest_waterside', label: 'New Forest Waterside' },
  { value: 'woolston_itchen_peartree_sholing', label: 'Woolston, Itchen, Peartree & Sholing' },
  { value: 'hamble_netley_bursledon_west_end', label: 'Hamble, Netley, Bursledon & West End' },
  { value: 'test_valley_stockbridge', label: 'Test Valley & Stockbridge' },
];

const adSizeOptions = [
  { value: 'full_page_a5', label: 'Full Page (A5)' },
  { value: 'full_page_premium_back_cover', label: 'Full Page Premium (Back Cover)' },
  { value: 'two_thirds_page', label: 'Two Thirds Page' },
  { value: 'half_page', label: 'Half Page' },
  { value: 'one_third_page', label: 'One Third Page' },
  { value: 'quarter_page', label: 'Quarter Page' },
  { value: 'one_sixth_page', label: 'One Sixth Page' },
  { value: 'one_eighth_page', label: 'One Eighth Page' },
  { value: 'none_unsure', label: "Not sure / Need advice" },
];

const howHeardOptions = [
  { value: 'received_magazine', label: 'Received the magazine through my door' },
  { value: 'picked_up_magazine', label: 'Picked up a copy somewhere' },
  { value: 'word_of_mouth', label: 'Word of mouth / recommendation' },
  { value: 'google_search', label: 'Google search' },
  { value: 'social_media', label: 'Social media (Facebook, Instagram, etc.)' },
  { value: 'local_event', label: 'Local event or networking' },
  { value: 'email_newsletter', label: 'Email newsletter' },
  { value: 'existing_advertiser', label: 'Already an advertiser' },
  { value: 'sales_call', label: 'Sales call or visit' },
  { value: 'leaflet_flyer', label: 'Leaflet or flyer' },
  { value: 'other', label: 'Other' },
];

const AdvertisingJourney: React.FC<AdvertisingJourneyProps> = ({ 
  data, 
  onChange, 
  consents, 
  onConsentsChange,
  errors 
}) => {
  const handleMultiSelect = (field: 'advertising_editions_interested' | 'advertising_ad_sizes', value: string) => {
    const currentValues = data[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onChange({ [field]: newValues });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Advertising Quote Request
        </h2>
        <p className="text-muted-foreground">
          Tell us about your business and advertising needs.
        </p>
      </div>

      {/* Business Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Business Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="advertising_business_name">Business Name *</Label>
          <Input
            id="advertising_business_name"
            value={data.advertising_business_name || ''}
            onChange={(e) => onChange({ advertising_business_name: e.target.value })}
            placeholder="Your business name"
            className={errors?.advertising_business_name ? 'border-destructive' : ''}
          />
          {errors?.advertising_business_name && (
            <p className="text-sm text-destructive">{errors.advertising_business_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="advertising_landline">Landline (optional)</Label>
          <Input
            id="advertising_landline"
            value={data.advertising_landline || ''}
            onChange={(e) => onChange({ advertising_landline: e.target.value })}
            placeholder="Landline number"
            type="tel"
          />
          <p className="text-sm text-muted-foreground">Mobile number is captured in contact details</p>
        </div>
      </div>

      {/* Hard Copy Question */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Have you seen/read a hard copy of Discover magazine? *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'yes', label: 'Yes', icon: '✅' },
            { value: 'no', label: 'No', icon: '❌' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ advertising_seen_hard_copy: option.value })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                data.advertising_seen_hard_copy === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-xl mr-2">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {errors?.advertising_seen_hard_copy && (
          <p className="text-sm text-destructive">{errors.advertising_seen_hard_copy}</p>
        )}
      </div>

      {/* Current Advertising Situation */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Current advertising situation *</Label>
        <div className="space-y-2">
          {situationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ advertising_current_situation: option.value })}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                data.advertising_current_situation === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-xl mr-3">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {errors?.advertising_current_situation && (
          <p className="text-sm text-destructive">{errors.advertising_current_situation}</p>
        )}
      </div>

      {/* Leaflet Interest */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Interested in our leaflet delivery service? *</Label>
        <div className="space-y-2">
          {leafletOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ advertising_leaflet_interest: option.value })}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                data.advertising_leaflet_interest === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-xl mr-3">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {errors?.advertising_leaflet_interest && (
          <p className="text-sm text-destructive">{errors.advertising_leaflet_interest}</p>
        )}
      </div>

      {/* Editions Multi-Select */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Which editions are you interested in advertising in? *</Label>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {editionOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                (data.advertising_editions_interested || []).includes(option.value)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={(data.advertising_editions_interested || []).includes(option.value)}
                onCheckedChange={() => handleMultiSelect('advertising_editions_interested', option.value)}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        {errors?.advertising_editions_interested && (
          <p className="text-sm text-destructive">{errors.advertising_editions_interested}</p>
        )}
      </div>

      {/* Ad Sizes Multi-Select */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Which ad sizes are you interested in? *</Label>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {adSizeOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                (data.advertising_ad_sizes || []).includes(option.value)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={(data.advertising_ad_sizes || []).includes(option.value)}
                onCheckedChange={() => handleMultiSelect('advertising_ad_sizes', option.value)}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        {errors?.advertising_ad_sizes && (
          <p className="text-sm text-destructive">{errors.advertising_ad_sizes}</p>
        )}
      </div>

      {/* Extra Info */}
      <div className="space-y-2">
        <Label htmlFor="advertising_extra_info">Anything else you'd like us to know? (optional)</Label>
        <Textarea
          id="advertising_extra_info"
          value={data.advertising_extra_info || ''}
          onChange={(e) => onChange({ advertising_extra_info: e.target.value })}
          placeholder="Tell us about your goals, timeline, or any specific requirements..."
          rows={4}
        />
      </div>

      {/* How Heard */}
      <div className="space-y-2">
        <Label htmlFor="advertising_how_heard">How did you hear about us? *</Label>
        <Select
          value={data.advertising_how_heard || ''}
          onValueChange={(value) => onChange({ advertising_how_heard: value })}
        >
          <SelectTrigger className={errors?.advertising_how_heard ? 'border-destructive' : ''}>
            <SelectValue placeholder="Please select..." />
          </SelectTrigger>
          <SelectContent>
            {howHeardOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.advertising_how_heard && (
          <p className="text-sm text-destructive">{errors.advertising_how_heard}</p>
        )}
      </div>

      {/* Consents */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground">Communication Preferences</h3>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={consents.consent_email_contact_required}
            onCheckedChange={(checked) => onConsentsChange({ consent_email_contact_required: !!checked })}
            className="mt-1"
          />
          <div>
            <span className="font-medium">
              I consent to being contacted by email about my advertising enquiry *
            </span>
            <p className="text-sm text-muted-foreground">
              We'll use your email to send you a quote and follow up on your enquiry.
            </p>
          </div>
        </label>
        {errors?.consent_email_contact_required && (
          <p className="text-sm text-destructive">{errors.consent_email_contact_required}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={consents.consent_think_monthly_optional}
            onCheckedChange={(checked) => onConsentsChange({ consent_think_monthly_optional: !!checked })}
            className="mt-1"
          />
          <div>
            <span className="font-medium">
              Subscribe to THINK monthly newsletter (optional)
            </span>
            <p className="text-sm text-muted-foreground">
              Get tips and insights for local businesses, delivered monthly.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AdvertisingJourney;
