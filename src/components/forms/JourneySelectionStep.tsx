import { JourneyType } from './types';
import { PenLine, Megaphone, Mail, Lightbulb, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyOption {
  type: JourneyType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const journeyOptions: JourneyOption[] = [
  {
    type: 'editorial',
    label: 'Submit a story (Editorial)',
    description: 'Share your news or community story with our readers',
    icon: PenLine,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200 data-[selected=true]:border-blue-500 data-[selected=true]:ring-2 data-[selected=true]:ring-blue-200'
  },
  {
    type: 'advertising',
    label: 'Request an advertising quote',
    description: 'Get pricing for your ad campaign in our magazine',
    icon: Megaphone,
    color: 'text-community-green',
    bgColor: 'bg-community-green/5 hover:bg-community-green/10',
    borderColor: 'border-community-green/30 data-[selected=true]:border-community-green data-[selected=true]:ring-2 data-[selected=true]:ring-community-green/20'
  },
  {
    type: 'discover_extra',
    label: 'Subscribe to Discover EXTRA',
    description: 'Our weekly email newsletter with local news & events',
    icon: Mail,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    borderColor: 'border-purple-200 data-[selected=true]:border-purple-500 data-[selected=true]:ring-2 data-[selected=true]:ring-purple-200'
  },
  {
    type: 'think_advertising',
    label: 'Subscribe to THINK Advertising',
    description: 'Monthly marketing insights and tips for local businesses',
    icon: Lightbulb,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    borderColor: 'border-rose-200 data-[selected=true]:border-rose-500 data-[selected=true]:ring-2 data-[selected=true]:ring-rose-200'
  },
  {
    type: 'distributor',
    label: 'Apply for magazine distribution',
    description: 'Become a distribution partner and earn extra income',
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    borderColor: 'border-orange-200 data-[selected=true]:border-orange-500 data-[selected=true]:ring-2 data-[selected=true]:ring-orange-200'
  }
];

interface JourneySelectionStepProps {
  selectedJourney: JourneyType;
  onSelect: (type: JourneyType) => void;
}

const JourneySelectionStep = ({ selectedJourney, onSelect }: JourneySelectionStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-community-navy mb-2">
          What would you like to do today?
        </h2>
        <p className="text-gray-600">
          Select an option below to get started
        </p>
      </div>

      <div className="grid gap-4">
        {journeyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedJourney === option.type;
          
          return (
            <button
              key={option.type}
              type="button"
              data-selected={isSelected}
              onClick={() => onSelect(option.type)}
              className={cn(
                "w-full p-5 rounded-xl border-2 transition-all duration-200 text-left group",
                "flex items-center gap-4",
                option.bgColor,
                option.borderColor,
                isSelected && "shadow-md"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                isSelected ? "bg-white shadow-sm" : "bg-white/50"
              )}>
                <Icon className={cn("h-6 w-6", option.color)} />
              </div>
              
              <div className="flex-grow min-w-0">
                <h3 className={cn(
                  "font-semibold text-lg text-community-navy group-hover:text-community-navy/80",
                  isSelected && "text-community-navy"
                )}>
                  {option.label}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {option.description}
                </p>
              </div>
              
              {isSelected && (
                <CheckCircle2 className={cn("flex-shrink-0 h-6 w-6", option.color)} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JourneySelectionStep;
