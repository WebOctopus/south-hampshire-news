import React from 'react';
import { useStepForm } from './StepForm';
import { SalesAssistantPopup } from './SalesAssistantPopup';

interface SalesAssistantWrapperProps {
  campaignData?: any;
}

export const SalesAssistantWrapper: React.FC<SalesAssistantWrapperProps> = ({ campaignData }) => {
  const { currentStep } = useStepForm();
  
  return (
    <SalesAssistantPopup 
      campaignData={campaignData}
      currentStep={currentStep + 1} // Add 1 since useStepForm returns 0-based index but we want 1-based for display
    />
  );
};