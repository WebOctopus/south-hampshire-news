export type JourneyType = 'editorial' | 'advertising' | 'discover_extra' | 'think_advertising' | 'distributor' | null;

export interface ContactDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postcode: string;
  company: string;
}

export interface EditorialData {
  editorial_organisation: string;
  editorial_story_summary: string;
  editorial_category: string;
  editorial_story_text: string;
  editorial_attachments: File[];
}

export interface AdvertisingData {
  advertising_business_name: string;
  advertising_landline: string;
  advertising_seen_hard_copy: string;
  advertising_current_situation: string;
  advertising_leaflet_interest: string;
  advertising_editions_interested: string[];
  advertising_ad_sizes: string[];
  advertising_extra_info: string;
  advertising_how_heard: string;
}

export interface NewsletterData {
  interests: string[];
  frequency_preference: string;
}

export interface DistributorData {
  available_days: string[];
  preferred_areas: string[];
  vehicle_type: string;
  has_experience: boolean;
  experience_details: string;
  hours_per_week: string;
}

export interface Consents {
  marketing_email: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  consent_email_contact_required: boolean;
  consent_think_monthly_optional: boolean;
}

export interface MetaData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  page_url: string;
  submitted_at?: string;
}

export interface DiscoverFormsState {
  journey_type: JourneyType;
  current_step: number;
  contact: ContactDetails;
  data: EditorialData | AdvertisingData | NewsletterData | DistributorData | Record<string, unknown>;
  consents: Consents;
  meta: MetaData;
}

export const initialContactDetails: ContactDetails = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  postcode: '',
  company: ''
};

export const initialConsents: Consents = {
  marketing_email: false,
  terms_accepted: false,
  privacy_accepted: false,
  consent_email_contact_required: false,
  consent_think_monthly_optional: false
};

export const getRequiredContactFields = (journeyType: JourneyType): (keyof ContactDetails)[] => {
  switch (journeyType) {
    case 'editorial':
      return ['first_name', 'last_name', 'email', 'phone'];
    case 'advertising':
      return ['first_name', 'last_name', 'email', 'phone', 'company'];
    case 'discover_extra':
    case 'think_advertising':
      return ['first_name', 'email'];
    case 'distributor':
      return ['first_name', 'last_name', 'email', 'phone', 'postcode'];
    default:
      return ['first_name', 'email'];
  }
};

export const getStepsForJourney = (journeyType: JourneyType): string[] => {
  switch (journeyType) {
    case 'editorial':
      return ['Journey Selection', 'Story Details', 'Contact Information', 'Review & Submit'];
    case 'advertising':
      return ['Journey Selection', 'Campaign Details', 'Contact Information', 'Review & Submit'];
    case 'discover_extra':
    case 'think_advertising':
      return ['Journey Selection', 'Contact Information', 'Interests', 'Confirm Subscription'];
    case 'distributor':
      return ['Journey Selection', 'Contact Information', 'Availability', 'Experience', 'Review & Submit'];
    default:
      return ['Journey Selection'];
  }
};
