import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepFormProps {
  children: React.ReactNode[];
  onComplete?: () => void;
  stepLabels?: {
    nextButtonLabels?: string[];
    prevButtonLabel?: string;
    onLastStepNext?: (formData?: any) => Promise<void>;
    onStepTransition?: (currentStep: number, nextStep: () => void) => void;
  };
}

interface StepFormContextValue {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  stepLabels?: {
    nextButtonLabels?: string[];
    prevButtonLabel?: string;
    onLastStepNext?: (formData?: any) => Promise<void>;
    onStepTransition?: (currentStep: number, nextStep: () => void) => void;
  };
}

const StepFormContext = React.createContext<StepFormContextValue | undefined>(undefined);

export const useStepForm = () => {
  const context = React.useContext(StepFormContext);
  if (!context) {
    throw new Error('useStepForm must be used within a StepForm');
  }
  return context;
};

export const StepForm: React.FC<StepFormProps> = ({ children, onComplete, stepLabels }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = React.Children.count(children);
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top of form when step changes
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [currentStep]);

  const nextStep = async () => {
    const standardNextStep = () => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (currentStep === totalSteps - 1 && stepLabels?.onLastStepNext) {
        // On the last step, call the custom handler if provided
        // Try to get form data from the global handler set by ContactInformationStep
        if ((window as any).handleContactFormSave) {
          (window as any).handleContactFormSave().then(() => {
            setCurrentStep(prev => prev + 1); // Move to completion step only on success
          }).catch(() => {
            // Error is already handled in the parent component
          });
        } else {
          // Fallback to old method
          stepLabels.onLastStepNext().then(() => {
            setCurrentStep(prev => prev + 1);
          }).catch(() => {
            // Error is already handled in the parent component
          });
        }
      } else if (onComplete) {
        onComplete();
      }
    };

    // Check if there's a custom step transition handler
    if (stepLabels?.onStepTransition) {
      stepLabels.onStepTransition(currentStep, standardNextStep);
    } else {
      standardNextStep();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const contextValue = {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    stepLabels,
  };

  return (
    <StepFormContext.Provider value={contextValue}>
      <div ref={formRef} className="w-full max-w-none mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    index <= currentStep
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground border-2 border-muted"
                  )}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      "w-16 h-0.5 transition-colors duration-200",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="relative">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={cn(
                "transition-all duration-300 ease-in-out",
                index === currentStep
                  ? "opacity-100 translate-x-0 relative"
                  : "opacity-0 absolute inset-0 translate-x-4 pointer-events-none"
              )}
            >
              {child}
            </div>
          ))}
        </div>

        {/* Navigation - Only show on steps after the first */}
        {currentStep > 0 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {stepLabels?.prevButtonLabel || 'Previous Step'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
            
            {currentStep === totalSteps - 1 ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if ((window as any).handleContactFormSave) {
                      (window as any).handleContactFormSave();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  Save My Quote
                </Button>
                <Button
                  onClick={() => {
                    if ((window as any).handleContactFormBook) {
                      (window as any).handleContactFormBook();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  Book Now
                </Button>
              </div>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                {stepLabels?.nextButtonLabels?.[currentStep] || 'Next Step'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </StepFormContext.Provider>
  );
};

export default StepForm;