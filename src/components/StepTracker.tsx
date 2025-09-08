import React, { createContext, useContext, useState, useEffect } from 'react';

interface StepTrackerContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const StepTrackerContext = createContext<StepTrackerContextValue | undefined>(undefined);

export const useStepTracker = () => {
  const context = useContext(StepTrackerContext);
  if (!context) {
    throw new Error('useStepTracker must be used within a StepTracker');
  }
  return context;
};

interface StepTrackerProps {
  children: React.ReactNode;
}

export const StepTracker: React.FC<StepTrackerProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const value = {
    currentStep,
    setCurrentStep,
  };

  return (
    <StepTrackerContext.Provider value={value}>
      {children}
    </StepTrackerContext.Provider>
  );
};