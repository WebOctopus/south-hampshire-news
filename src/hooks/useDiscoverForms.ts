import { useState, useEffect, useCallback } from 'react';
import { 
  DiscoverFormsState, 
  JourneyType, 
  ContactDetails, 
  Consents,
  initialContactDetails,
  initialConsents,
  getStepsForJourney
} from '@/components/forms/types';

const captureUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
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
      current_step: 1, // Move to first step after selection
      data: {} // Reset journey-specific data
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
  }, []);

  const getTotalSteps = useCallback(() => {
    return getStepsForJourney(formState.journey_type).length;
  }, [formState.journey_type]);

  const getStepNames = useCallback(() => {
    return getStepsForJourney(formState.journey_type);
  }, [formState.journey_type]);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    
    const submissionData = {
      ...formState,
      meta: {
        ...formState.meta,
        submitted_at: new Date().toISOString()
      }
    };

    // For now, just log the submission - can integrate with Supabase later
    console.log('Form Submission:', JSON.stringify(submissionData, null, 2));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    return submissionData;
  }, [formState]);

  return {
    formState,
    isSubmitting,
    isSubmitted,
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
    submitForm
  };
};
