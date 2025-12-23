import { useDiscoverForms } from '@/hooks/useDiscoverForms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import JourneySelectionStep from './JourneySelectionStep';
import SharedContactStep from './SharedContactStep';
import EditorialJourney from './EditorialJourney';
import AdvertisingJourney from './AdvertisingJourney';
import NewsletterJourney from './NewsletterJourney';
import DistributorJourney from './DistributorJourney';
import ConfirmationStep from './ConfirmationStep';
import ProgressIndicator from './ProgressIndicator';
import { EditorialData, AdvertisingData, NewsletterData, DistributorData } from './types';

const DiscoverFormsHub = () => {
  const {
    formState,
    isSubmitting,
    isSubmitted,
    setJourneyType,
    updateContact,
    updateData,
    updateConsents,
    nextStep,
    prevStep,
    resetForm,
    getStepNames,
    submitForm
  } = useDiscoverForms();

  const { journey_type, current_step, contact, data, consents } = formState;
  const steps = getStepNames();

  const canProceed = () => {
    if (current_step === 0) return !!journey_type;
    
    // Check required fields based on step
    if (journey_type === 'editorial') {
      if (current_step === 1) {
        const d = data as Partial<EditorialData>;
        return !!(d.story_title && d.area && d.category && d.story_summary && d.story_content);
      }
      if (current_step === 2) return !!(contact.first_name && contact.last_name && contact.email && contact.phone);
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'advertising') {
      if (current_step === 1) {
        const d = data as Partial<AdvertisingData>;
        return !!(d.business_type && d.advertising_goal);
      }
      if (current_step === 2) return !!(contact.first_name && contact.last_name && contact.email && contact.phone);
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'discover_extra' || journey_type === 'think_advertising') {
      if (current_step === 1) return !!(contact.first_name && contact.email);
      if (current_step === 2) return true; // Interests are optional
      if (current_step === 3) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    if (journey_type === 'distributor') {
      if (current_step === 1) return !!(contact.first_name && contact.last_name && contact.email && contact.phone && contact.postcode);
      if (current_step === 2) {
        const d = data as Partial<DistributorData>;
        return !!(d.available_days?.length && d.preferred_areas?.length);
      }
      if (current_step === 3) {
        const d = data as Partial<DistributorData>;
        return !!d.vehicle_type;
      }
      if (current_step === 4) return consents.terms_accepted && consents.privacy_accepted;
    }
    
    return true;
  };

  const isLastStep = current_step === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await submitForm();
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
        if (current_step === 1) return <AdvertisingJourney data={data as Partial<AdvertisingData>} onChange={updateData} />;
        if (current_step === 2) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 3) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
        break;
      
      case 'discover_extra':
      case 'think_advertising':
        if (current_step === 1) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 2) return <NewsletterJourney data={data as Partial<NewsletterData>} onChange={updateData} journeyType={journey_type} />;
        if (current_step === 3) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
        break;
      
      case 'distributor':
        if (current_step === 1) return <SharedContactStep contact={contact} journeyType={journey_type} onChange={updateContact} />;
        if (current_step === 2) return <DistributorJourney data={data as Partial<DistributorData>} onChange={updateData} step="availability" />;
        if (current_step === 3) return <DistributorJourney data={data as Partial<DistributorData>} onChange={updateData} step="experience" />;
        if (current_step === 4) return <ConfirmationStep journeyType={journey_type} consents={consents} onConsentChange={updateConsents} isSubmitted={false} />;
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
