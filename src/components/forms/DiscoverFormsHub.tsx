import { useDiscoverForms } from '@/hooks/useDiscoverForms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import JourneySelectionStep from './JourneySelectionStep';
import SharedContactStep from './SharedContactStep';
import EditorialJourney from './EditorialJourney';
import AdvertisingJourney from './AdvertisingJourney';
import NewsletterJourney from './NewsletterJourney';
import DistributorJourney from './DistributorJourney';
import ConfirmationStep from './ConfirmationStep';
import ProgressIndicator from './ProgressIndicator';
import { EditorialData, AdvertisingData, DiscoverExtraData, ThinkMonthlyData, DistributorData } from './types';

const DiscoverFormsHub = () => {
  const {
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
    resetForm,
    getStepNames,
    submitForm,
    retrySubmit
  } = useDiscoverForms();

  const { journey_type, current_step, contact, data, consents } = formState;
  const steps = getStepNames();

  const canProceed = () => {
    if (current_step === 0) return !!journey_type;
    
    // Check required fields based on step
    if (journey_type === 'editorial') {
      if (current_step === 1) {
        const d = data as Partial<EditorialData>;
        const summaryWords = (d.editorial_story_summary || '').trim().split(/\s+/).filter(Boolean).length;
        return !!(
          d.editorial_story_summary && 
          summaryWords <= 30 &&
          d.editorial_category && 
          d.editorial_story_text
        );
      }
      if (current_step === 2) return !!(contact.first_name && contact.last_name && contact.email && contact.phone);
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'advertising') {
      if (current_step === 1) {
        const d = data as Partial<AdvertisingData>;
        return !!(
          d.advertising_business_name &&
          d.advertising_seen_hard_copy &&
          d.advertising_current_situation &&
          d.advertising_leaflet_interest &&
          (d.advertising_editions_interested?.length ?? 0) > 0 &&
          (d.advertising_ad_sizes?.length ?? 0) > 0 &&
          d.advertising_how_heard &&
          consents.consent_email_contact_required
        );
      }
      if (current_step === 2) return !!(contact.first_name && contact.last_name && contact.email && contact.phone);
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'discover_extra') {
      if (current_step === 1) return !!(contact.first_name && contact.email);
      if (current_step === 2) {
        const d = data as Partial<DiscoverExtraData>;
        return !!(
          d.newsletter_discover_keep_use_frequency &&
          d.newsletter_discover_source_local_business &&
          d.newsletter_discover_rating &&
          consents.discover_extra
        );
      }
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'think_advertising') {
      if (current_step === 1) return !!(contact.first_name && contact.email);
      if (current_step === 2) return consents.think_monthly;
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'distributor') {
      if (current_step === 1) return !!(contact.first_name && contact.last_name && contact.email && contact.phone && contact.postcode);
      if (current_step === 2) {
        const d = data as Partial<DistributorData>;
        return !!(
          d.distribution_address_1 &&
          d.distribution_city &&
          d.distribution_safe_storage &&
          (d.distribution_areas_interested?.length ?? 0) > 0 &&
          d.distribution_age_band &&
          consents.email_contact
        );
      }
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    return true;
  };

  const isLastStep = current_step === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      try {
        await submitForm();
      } catch {
        // Error is handled in the hook and displayed via submissionError
      }
    } else {
      nextStep();
    }
  };

  const renderCurrentStep = () => {
    if (current_step === 0) {
      return <JourneySelectionStep selectedJourney={journey_type} onSelect={setJourneyType} />;
    }

    if (isSubmitted) {
      return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={true} />;
    }

    switch (journey_type) {
      case 'editorial':
        if (current_step === 1) return <EditorialJourney data={data as Partial<EditorialData>} onChange={updateData} />;
        if (current_step === 2) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 3) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
        break;
      
      case 'advertising':
        if (current_step === 1) return <AdvertisingJourney data={data as AdvertisingData} onChange={updateData} consents={consents} onConsentsChange={updateConsents} />;
        if (current_step === 2) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 3) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
        break;
      
      case 'discover_extra':
      case 'think_advertising':
        if (current_step === 1) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 2) return <NewsletterJourney data={data as Partial<DiscoverExtraData | ThinkMonthlyData>} onChange={updateData} journeyType={journey_type} consents={consents} onConsentsChange={updateConsents} />;
        if (current_step === 3) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
        break;
      
      case 'distributor':
        if (current_step === 1) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 2) return <DistributorJourney data={data as Partial<DistributorData>} onChange={updateData} consents={consents} onConsentsChange={updateConsents} />;
        if (current_step === 3) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
        break;
    }

    return null;
  };

  return (
    <Card className="border-community-green/20 shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <ProgressIndicator journeyType={journey_type} currentStep={current_step} steps={steps} />
        
        <div className="min-h-[400px]">
          {renderCurrentStep()}
        </div>

        {/* Error Display */}
        {submissionError && !isSubmitted && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive font-medium">Submission Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{submissionError}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retrySubmit}
              disabled={isSubmitting}
              className="flex-shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retry
                </>
              )}
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        {!isSubmitted ? (
          <div className="flex justify-between mt-8 pt-6 border-t">
            {current_step > 0 ? (
              <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            <Button 
              onClick={handleNext} 
              disabled={!canProceed() || isSubmitting}
              className="bg-community-green hover:bg-community-green/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : isLastStep ? (
                'Submit'
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mt-8 pt-6 border-t">
            <Button onClick={resetForm} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Form
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscoverFormsHub;
