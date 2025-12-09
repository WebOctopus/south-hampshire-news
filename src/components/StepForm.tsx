import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepFormProps {
  children: React.ReactNode[];
  onComplete?: () => void;
  onStepChange?: (stepNumber: number) => void;
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

export const StepForm: React.FC<StepFormProps> = ({ children, onComplete, stepLabels, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = React.Children.count(children);
  const formRef = useRef<HTMLDivElement>(null);

  // Set up global functions and handle step changes
  const prevStepRef = useRef(currentStep);
  
  useEffect(() => {
    // Only scroll when step actually changes (not on initial render or re-renders)
    if (prevStepRef.current !== currentStep && formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    prevStepRef.current = currentStep;

    // Notify parent component of step change
    onStepChange?.(currentStep + 1); // Convert to 1-indexed

    // Set up global functions for Sales Assistant
    (window as any).salesAssistantNextStep = () => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      }
    };
    
    (window as any).salesAssistantPrevStep = () => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };
    
    (window as any).salesAssistantGoToStep = (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step - 1); // Convert from 1-indexed to 0-indexed
      }
    };
    
    (window as any).salesAssistantGetCurrentStep = () => currentStep + 1; // Return 1-indexed
  }, [currentStep, totalSteps, onStepChange]);

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
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 px-4 xs:px-6 sm:px-0">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer relative",
                    index < currentStep
                      ? "bg-community-green text-white shadow-lg hover:bg-community-green/90"
                      : index === currentStep
                      ? "bg-community-navy text-white shadow-xl ring-4 ring-community-navy/20 animate-pulse"
                      : "bg-white text-muted-foreground border-2 border-stone-300 hover:border-community-navy/50 hover:bg-stone-50"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-base">{index + 1}</span>
                  )}
                </button>
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-16 h-1 rounded-full transition-all duration-300",
                      index < currentStep 
                        ? "bg-gradient-to-r from-community-green to-community-navy" 
                        : "bg-stone-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Navigation - Only show on steps after the first */}
        {currentStep > 0 && (
          <div className="mb-6 pb-6 border-b border-border">
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              {/* Left side - Previous button */}
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">{stepLabels?.prevButtonLabel || 'Previous Step'}</span>
                <span className="xs:hidden">Previous</span>
              </Button>
              
              {/* Center - Step indicator */}
              <div className="text-sm text-muted-foreground text-center font-medium">
                Step {currentStep + 1} of {totalSteps}
              </div>
              
              {/* Right side - Action buttons */}
              {currentStep === totalSteps - 1 ? (
                <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if ((window as any).handleContactFormSave) {
                        (window as any).handleContactFormSave();
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full xs:w-auto min-h-[44px] text-sm"
                  >
                    <span className="hidden xs:inline">Save My Quote</span>
                    <span className="xs:hidden">Save Quote</span>
                  </Button>
                  <Button
                    onClick={() => {
                      if ((window as any).handleContactFormBook) {
                        (window as any).handleContactFormBook();
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full xs:w-auto min-h-[44px] text-sm"
                  >
                    Book Now
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] text-sm"
                >
                  <span className="hidden xs:inline">{stepLabels?.nextButtonLabels?.[currentStep] || 'Next Step'}</span>
                  <span className="xs:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

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

        {/* Bottom Navigation - Only show on steps after the first */}
        {currentStep > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              {/* Left side - Previous button */}
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">{stepLabels?.prevButtonLabel || 'Previous Step'}</span>
                <span className="xs:hidden">Previous</span>
              </Button>
              
              {/* Center - Step indicator */}
              <div className="text-sm text-muted-foreground text-center font-medium">
                Step {currentStep + 1} of {totalSteps}
              </div>
              
              {/* Right side - Action buttons */}
              {currentStep === totalSteps - 1 ? (
                <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if ((window as any).handleContactFormSave) {
                        (window as any).handleContactFormSave();
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full xs:w-auto min-h-[44px] text-sm"
                  >
                    <span className="hidden xs:inline">Save My Quote</span>
                    <span className="xs:hidden">Save Quote</span>
                  </Button>
                  <Button
                    onClick={() => {
                      if ((window as any).handleContactFormBook) {
                        (window as any).handleContactFormBook();
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full xs:w-auto min-h-[44px] text-sm"
                  >
                    Book Now
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] text-sm"
                >
                  <span className="hidden xs:inline">{stepLabels?.nextButtonLabels?.[currentStep] || 'Next Step'}</span>
                  <span className="xs:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </StepFormContext.Provider>
  );
};

export default StepForm;