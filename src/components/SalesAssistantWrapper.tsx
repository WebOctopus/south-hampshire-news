import React from 'react';
import { useStepTracker } from './StepTracker';
import { SalesAssistantPopup } from './SalesAssistantPopup';

interface SalesAssistantWrapperProps {
  campaignData?: any;
}

export const SalesAssistantWrapper: React.FC<SalesAssistantWrapperProps> = ({ campaignData }) => {
  const { currentStep } = useStepTracker();
  
  return (
    <SalesAssistantPopup 
      campaignData={campaignData}
      currentStep={currentStep}
    />
  );
};