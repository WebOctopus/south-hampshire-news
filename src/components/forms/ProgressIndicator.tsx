import { JourneyType } from './types';
import { Check, PenLine, Megaphone, Mail, Lightbulb, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  journeyType: JourneyType;
  currentStep: number;
  steps: string[];
}

const getJourneyIcon = (journeyType: JourneyType) => {
  switch (journeyType) {
    case 'editorial':
      return { icon: PenLine, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'advertising':
      return { icon: Megaphone, color: 'text-community-green', bgColor: 'bg-community-green/20' };
    case 'discover_extra':
      return { icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' };
    case 'think_advertising':
      return { icon: Lightbulb, color: 'text-rose-600', bgColor: 'bg-rose-100' };
    case 'distributor':
      return { icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    default:
      return null;
  }
};

const getJourneyLabel = (journeyType: JourneyType) => {
  switch (journeyType) {
    case 'editorial': return 'Editorial Submission';
    case 'advertising': return 'Advertising Quote';
    case 'discover_extra': return 'Discover EXTRA';
    case 'think_advertising': return 'THINK Advertising';
    case 'distributor': return 'Distributor Application';
    default: return '';
  }
};

const ProgressIndicator = ({ journeyType, currentStep, steps }: ProgressIndicatorProps) => {
  const journeyInfo = getJourneyIcon(journeyType);
  
  if (!journeyType || steps.length <= 1) {
    return null;
  }

  const Icon = journeyInfo?.icon;

  return (
    <div className="mb-8">
      {/* Journey Header */}
      {journeyInfo && Icon && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={cn("p-2 rounded-full", journeyInfo.bgColor)}>
            <Icon className={cn("h-5 w-5", journeyInfo.color)} />
          </div>
          <span className={cn("font-semibold", journeyInfo.color)}>
            {getJourneyLabel(journeyType)}
          </span>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted && "bg-community-green text-white",
                    isCurrent && "bg-community-navy text-white ring-4 ring-community-navy/20",
                    isUpcoming && "bg-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Step Label - Only show on larger screens */}
                <span className={cn(
                  "hidden sm:block text-xs mt-2 max-w-[80px] text-center",
                  isCurrent ? "text-community-navy font-medium" : "text-gray-500"
                )}>
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-12 h-0.5 mx-1",
                    index < currentStep ? "bg-community-green" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Label */}
      <p className="sm:hidden text-center mt-4 text-sm text-gray-600">
        Step {currentStep + 1}: <span className="font-medium">{steps[currentStep]}</span>
      </p>
    </div>
  );
};

export default ProgressIndicator;
