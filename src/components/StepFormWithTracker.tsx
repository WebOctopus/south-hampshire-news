import React, { useEffect } from 'react';
import StepForm from './StepForm';
import { useStepForm } from './StepForm';
import { useStepTracker } from './StepTracker';

interface StepFormWithTrackerProps {
  stepLabels?: {
    nextButtonLabels?: string[];
    prevButtonLabel?: string;
    onLastStepNext?: (formData?: any) => Promise<void>;
    onStepTransition?: (currentStep: number, nextStep: () => void) => void;
  };
  children: React.ReactNode;
}

const StepFormContent: React.FC<StepFormWithTrackerProps> = ({ children, stepLabels }) => {
  const { currentStep } = useStepForm();
  const { setCurrentStep } = useStepTracker();

  // Update the tracker whenever the step form's current step changes
  useEffect(() => {
    setCurrentStep(currentStep + 1); // Convert from 0-based to 1-based
  }, [currentStep, setCurrentStep]);

  return <>{children}</>;
};

export const StepFormWithTracker: React.FC<StepFormWithTrackerProps> = ({ children, stepLabels }) => {
  return (
    <StepForm stepLabels={stepLabels}>
      <StepFormContent stepLabels={stepLabels}>
        {children}
      </StepFormContent>
    </StepForm>
  );
};