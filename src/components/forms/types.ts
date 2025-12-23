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
  story_title: string;
  story_summary: string;
  story_content: string;
  area: string;
  category: string;
}

export interface AdvertisingData {
  business_type: string;
  advertising_goal: string;
  budget_range: string;
  timeline: string;
  additional_info: string;
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
  privacy_accepted: false
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
