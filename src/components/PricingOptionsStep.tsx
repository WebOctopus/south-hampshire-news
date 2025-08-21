import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Target, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepForm } from './StepForm';

interface PricingOption {
  id: 'fixed' | 'bogof' | 'subscription' | 'leafleting';
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
  features: Array<{
    label: string;
    value: string | boolean;
    highlight?: boolean;
  }>;
  cta: string;
  popular?: boolean;
}

interface PricingOptionsStepProps {
  onSelectOption: (option: 'fixed' | 'bogof' | 'subscription' | 'leafleting') => void;
}

const pricingOptions: PricingOption[] = [
  {
    id: 'fixed',
    title: 'Fixed Term',
    subtitle: 'Pay as you go with no contract',
    description: 'Perfect for businesses wanting flexibility with limited discounts and ad sizes.',
    icon: Target,
    features: [
      { label: 'Number of Inserts', value: '1, 2 or 3' },
      { label: 'Ad Hoc Option', value: true },
      { label: 'Consecutive Run', value: true },
      { label: 'Discount Available', value: 'Only on multi-area bookings' },
      { label: 'Advert Sizes', value: '1/2, 2/3 & full pages only' },
      { label: 'Free Ad Design', value: false },
      { label: 'Free Editorial', value: false },
      { label: 'Premium Position Upgrades', value: false },
      { label: 'Discount on Leaflet Bookings', value: false },
      { label: 'Pre-payment Required', value: true },
      { label: 'Monthly Payment Plan', value: false },
      { label: 'Cancellation Notice', value: 'Not applicable' },
    ],
    cta: 'Book Now',
  },
  {
    id: 'bogof',
    title: 'BOGOF Subscription',
    subtitle: 'Buy One Get One Free for 6 months',
    description: 'Double your advertising reach at no extra cost! Pay for areas, get equal number free.',
    badge: 'Special Offer',
    badgeVariant: 'default',
    icon: Star,
    popular: true,
    features: [
      { label: 'Duration', value: '6 months (3 issues)', highlight: true },
      { label: 'Double Up for Free', value: 'Equal number of free areas matched to paid', highlight: true },
      { label: 'Ad Hoc Option', value: false },
      { label: 'Consecutive Run', value: true },
      { label: 'Discount Available', value: 'Effectively 50% off total cost', highlight: true },
      { label: 'Advert Sizes', value: 'Available with all advert sizes', highlight: true },
      { label: 'Free Ad Design', value: true, highlight: true },
      { label: 'Free Editorial', value: 'After 4th issue', highlight: true },
      { label: 'Premium Position Upgrades', value: true },
      { label: 'Discount on Leaflet Bookings', value: true },
      { label: 'Pre-payment Required', value: false },
      { label: 'Monthly Payment Plan', value: true, highlight: true },
      { label: 'Cancellation Notice', value: '30 days' },
    ],
    cta: 'Book Now',
  },
  {
    id: 'subscription',
    title: '3+ Repeat Package',
    subtitle: 'Subscription with monthly payment plan',
    description: 'Best value with better rates and additional benefits for ongoing campaigns.',
    icon: Star,
    features: [
      { label: 'Minimum Duration', value: '3 issues + ongoing' },
      { label: 'Double Up for Free', value: false },
      { label: 'Ad Hoc Option', value: false },
      { label: 'Consecutive Run', value: true },
      { label: 'Discount Available', value: 'All bookings from 15% - 38%', highlight: true },
      { label: 'Advert Sizes', value: 'Available with all advert sizes', highlight: true },
      { label: 'Free Ad Design', value: true, highlight: true },
      { label: 'Free Editorial', value: true, highlight: true },
      { label: 'Premium Position Upgrades', value: true, highlight: true },
      { label: 'Discount on Leaflet Bookings', value: true, highlight: true },
      { label: 'Pre-payment Required', value: false },
      { label: 'Monthly Payment Plan', value: true, highlight: true },
      { label: 'Cancellation Notice', value: '30 days' },
    ],
    cta: 'Book Now',
  },
  {
    id: 'leafleting',
    title: 'Leafleting Service',
    subtitle: 'Design, Print & Delivery',
    description: 'Complete leaflet distribution service reaching up to 116,000 homes.',
    icon: MapPin,
    features: [
      { label: 'Coverage', value: 'Up to 116,000 homes', highlight: true },
      { label: 'Number of Inserts', value: '1 or more' },
      { label: 'Double Up for Free', value: false },
      { label: 'Ad Hoc Option', value: true },
      { label: 'Consecutive Run', value: true },
      { label: 'Discount Available', value: 'Up to 15%' },
      { label: 'Leaflet Size', value: 'A5 max', highlight: true },
      { label: 'Free Ad Design', value: false },
      { label: 'Free Editorial', value: false },
      { label: 'Premium Position Upgrades', value: 'N/A' },
      { label: 'Discount on Leaflet Bookings', value: 'N/A' },
      { label: 'Pre-payment Required', value: true },
      { label: 'Monthly Payment Plan', value: false },
      { label: 'Cancellation Notice', value: 'Not applicable' },
    ],
    cta: 'Book Now',
  },
];

const FeatureRow: React.FC<{ feature: PricingOption['features'][0] }> = ({ feature }) => {
  const isBoolean = typeof feature.value === 'boolean';
  
  return (
    <div className={cn(
      "flex items-start gap-3 py-2",
      feature.highlight && "bg-primary/5 -mx-2 px-2 rounded-sm"
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {isBoolean ? (
          feature.value ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <X className="w-4 h-4 text-muted-foreground" />
          )
        ) : (
          <div className="w-1 h-1 bg-primary rounded-full mt-2" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground mb-0.5">
          {feature.label}
        </div>
        {!isBoolean && (
          <div className={cn(
            "text-sm text-muted-foreground leading-relaxed",
            feature.highlight && "text-foreground font-medium"
          )}>
            {feature.value}
          </div>
        )}
      </div>
    </div>
  );
};

export const PricingOptionsStep: React.FC<PricingOptionsStepProps> = ({ onSelectOption }) => {
  const { nextStep } = useStepForm();

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'subscription' | 'leafleting') => {
    onSelectOption(option);
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Choose Your Advertising Package
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the package that best fits your business needs. Each option is designed for different advertising goals and budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {pricingOptions.map((option) => {
          const Icon = option.icon;
          
          return (
            <Card 
              key={option.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-elegant",
                option.popular && "border-primary shadow-lg scale-105"
              )}
            >
              {option.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular Choice
                </div>
              )}
              
              <CardHeader className={cn("space-y-4", option.popular && "pt-12")}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  {option.badge && (
                    <Badge variant={option.badgeVariant || 'default'} className="text-xs">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <p className="text-sm font-medium text-primary">{option.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-1">
                  {option.features.map((feature, index) => (
                    <FeatureRow key={index} feature={feature} />
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "w-full",
                    option.popular 
                      ? "bg-primary hover:bg-primary/90 shadow-glow" 
                      : "variant-outline hover:bg-primary hover:text-primary-foreground"
                  )}
                  size="lg"
                >
                  {option.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>* Terms and conditions apply. Contact our sales team for full details on BOGOF offers.</p>
      </div>
    </div>
  );
};

export default PricingOptionsStep;