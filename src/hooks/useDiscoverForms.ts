import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  DiscoverFormsState, 
  JourneyType, 
  ContactDetails, 
  Consents,
  initialContactDetails,
  initialConsents,
  getStepsForJourney
} from '@/components/forms/types';

const getCategoryLabel = (journeyType: JourneyType): string => {
  switch (journeyType) {
    case 'editorial':
      return 'Submit a Story';
    case 'advertising':
      return 'Request an Advertising Quote';
    case 'discover_extra':
      return 'Subscribe to Discover EXTRA';
    case 'think_advertising':
      return 'Subscribe to THINK Advertising';
    case 'distributor':
      return 'Apply for Magazine Distribution';
    default:
      return 'Unknown';
  }
};

const captureUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: 'discover_combined_form',
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    page_url: window.location.href
  };
};

const getInitialState = (): DiscoverFormsState => ({
  journey_type: null,
  current_step: 0,
  contact: initialContactDetails,
  data: {},
  consents: initialConsents,
  meta: captureUTMParams()
});

export const useDiscoverForms = () => {
  const [formState, setFormState] = useState<DiscoverFormsState>(getInitialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Recapture UTM params on mount
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      meta: captureUTMParams()
    }));
  }, []);

  const setJourneyType = useCallback((type: JourneyType) => {
    setFormState(prev => ({
      ...prev,
      journey_type: type,
      current_step: 1,
      data: {}
    }));
  }, []);

  const updateContact = useCallback((updates: Partial<ContactDetails>) => {
    setFormState(prev => ({
      ...prev,
      contact: { ...prev.contact, ...updates }
    }));
  }, []);

  const updateData = useCallback((updates: Record<string, unknown>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }));
  }, []);

  const updateConsents = useCallback((updates: Partial<Consents>) => {
    setFormState(prev => ({
      ...prev,
      consents: { ...prev.consents, ...updates }
    }));
  }, []);

  const nextStep = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      current_step: prev.current_step + 1
    }));
  }, []);

  const prevStep = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      current_step: Math.max(0, prev.current_step - 1)
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setFormState(prev => ({
      ...prev,
      current_step: step
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(getInitialState());
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmissionError(null);
  }, []);

  const getTotalSteps = useCallback(() => {
    return getStepsForJourney(formState.journey_type).length;
  }, [formState.journey_type]);

  const getStepNames = useCallback(() => {
    return getStepsForJourney(formState.journey_type);
  }, [formState.journey_type]);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    
    const payload = {
      form_category: getCategoryLabel(formState.journey_type),
      journey_type: formState.journey_type,
      contact: formState.contact,
      data: formState.data,
      consents: formState.consents,
      meta: {
        ...formState.meta,
        source: 'discover_combined_form',
        page_url: window.location.href,
        submitted_at: new Date().toISOString()
      }
    };

    try {
      const { data, error } = await supabase.functions.invoke('submit-discover-form', {
        body: payload
      });

      if (error) {
        throw new Error(error.message || 'Submission failed');
      }

      console.log('Form submitted successfully:', payload);
      setIsSubmitted(true);
      setSubmissionError(null);
      return payload;
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(
        error instanceof Error 
          ? 'Unable to submit your form. Please check your connection and try again.' 
          : 'An unexpected error occurred. Please try again.'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formState]);

  const retrySubmit = useCallback(() => {
    return submitForm();
  }, [submitForm]);

  return {
    formState,
    isSubmitting,
    isSubmitted,
    submissionError,
    setJourneyType,
    updateContact,
    updateData,
    updateConsents,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    getTotalSteps,
    getStepNames,
    submitForm,
    retrySubmit
  };
};
