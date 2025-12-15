import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Loader2, FileText, BookOpen, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStepForm } from './StepForm';
import { useProductPackages, type ProductPackageFeature } from '@/hooks/useProductPackages';
import { getIcon } from '@/lib/iconMap';
import { useBogofEligibility } from '@/hooks/useBogofEligibility';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricingOptionsStepProps {
  onSelectOption: (option: 'fixed' | 'bogof' | 'leafleting') => void;
}

const FeatureRow: React.FC<{ feature: ProductPackageFeature }> = ({ feature }) => {
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
  const { nextStep, currentStep } = useStepForm();
  const mountedRef = useRef(true);
  const hasRefetchedRef = useRef(false);
  const { data: packages, isLoading, isError, refetch } = useProductPackages();
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userPhone, setUserPhone] = useState<string | undefined>();
  const [forceError, setForceError] = useState(false);
  const { data: eligibilityData, isLoading: checkingEligibility } = useBogofEligibility(userEmail, userPhone);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Timeout safeguard to prevent infinite loading
  useEffect(() => {
    if (isLoading && !forceError) {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && isLoading) {
          console.warn('Product packages loading timeout - showing retry option');
          setForceError(true);
        }
      }, 15000);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [isLoading, forceError]);

  // Force refetch when this step becomes visible (step 1)
  useEffect(() => {
    if (currentStep === 1 && !hasRefetchedRef.current) {
      console.log('PricingOptionsStep visible - forcing fresh data fetch');
      hasRefetchedRef.current = true;
      setForceError(false);
      refetch();
    }
  }, [currentStep, refetch]);

  // Reset refetch flag when leaving this step
  useEffect(() => {
    if (currentStep !== 1) {
      hasRefetchedRef.current = false;
    }
  }, [currentStep]);

  // Reset forceError when packages load successfully
  useEffect(() => {
    if (packages && packages.length > 0 && forceError) {
      console.log('Packages loaded successfully - clearing error state');
      setForceError(false);
    }
  }, [packages, forceError]);

  // Get current user's email and phone from profile
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        
        // Try to get phone from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.phone) {
          setUserPhone(profile.phone);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'leafleting', packageData: any) => {
    onSelectOption(option);
    nextStep();
  };

  if (isLoading && !forceError) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading packages...</p>
      </div>
    );
  }

  if (isError || forceError || !packages || packages.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
        <p className="text-destructive">Unable to load pricing options.</p>
        <Button 
          variant="outline" 
          onClick={() => {
            setForceError(false);
            refetch();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

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

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        {packages.map((option, packageIndex) => {
          const Icon = getIcon(option.icon);
          const gradientColors = [
            'from-slate-600 to-slate-800',
            'from-community-green to-emerald-600',
            'from-amber-500 to-orange-600'
          ];
          const accentColors = [
            'border-t-slate-600',
            'border-t-community-green',
            'border-t-amber-500'
          ];
          const iconBgColors = [
            'bg-gradient-to-br from-slate-100 to-slate-200',
            'bg-gradient-to-br from-green-100 to-emerald-200',
            'bg-gradient-to-br from-amber-100 to-orange-200'
          ];

          // Mobile order: bogof (1), leafleting (2), fixed (3)
          // Desktop order: fixed (1), bogof (2), leafleting (3) - maintained by database sort_order
          const mobileOrder = option.package_id === 'bogof' ? 1 : option.package_id === 'leafleting' ? 2 : 3;
          
          return (
            <Card 
              key={option.id}
              style={{ order: mobileOrder }}
              className={cn(
                "relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-white to-slate-50/80 group lg:!order-none",
                "border-t-4 shadow-lg hover:shadow-2xl hover:-translate-y-1",
                option.is_popular 
                  ? "border-t-community-green ring-2 ring-community-green/20 lg:scale-105 z-10" 
                  : accentColors[packageIndex % 3]
              )}
            >
              {option.is_popular && (
                <div className={cn(
                  "absolute top-0 left-0 right-0 bg-gradient-to-r text-white text-center py-3 text-sm font-semibold tracking-wide",
                  gradientColors[1]
                )}>
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Most Popular Choice
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </span>
                </div>
              )}
              
              <CardHeader className={cn("space-y-4", option.is_popular && "pt-14")}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110",
                    option.is_popular ? iconBgColors[1] : iconBgColors[packageIndex % 3]
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      option.is_popular ? "text-community-green" : "text-community-navy"
                    )} />
                  </div>
                  {option.badge_text && (
                    <Badge 
                      variant={option.badge_variant as any} 
                      className="text-xs font-semibold px-3 py-1 shadow-sm"
                    >
                      {option.badge_text}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-community-navy">{option.title}</CardTitle>
                  <p className="text-sm font-semibold text-community-green">{option.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={() => handleSelectOption(option.package_id as 'fixed' | 'bogof' | 'leafleting', option)}
                  className={cn(
                    "w-full font-semibold transition-all duration-300",
                    option.is_popular 
                      ? "bg-community-green hover:bg-community-green/90 text-white shadow-lg hover:shadow-xl" 
                      : "bg-community-navy hover:bg-community-navy/90 text-white"
                  )}
                  size="lg"
                >
                  {option.cta_text}
                </Button>

                <div className="space-y-1 bg-slate-50/50 rounded-lg p-3 -mx-1">
                  {option.features.map((feature, index) => (
                    <FeatureRow key={index} feature={feature} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
        <Button
          className="bg-community-green hover:bg-community-green/90 text-white font-semibold px-6 py-3 rounded-full"
          onClick={() => window.open('/contact#advertising', '_blank')}
        >
          <FileText className="w-4 h-4 mr-2" />
          ENQUIRY FORM
        </Button>
        <Button
          variant="outline"
          className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-full"
          onClick={() => window.open('/contact#media-pack', '_blank')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          REQUEST A MEDIA PACK
        </Button>
        <Button
          variant="outline"
          className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-full"
          onClick={() => window.location.href = 'tel:02380123456'}
        >
          <Phone className="w-4 h-4 mr-2" />
          CONTACT US
        </Button>
      </div>
    </div>
  );
};

export default PricingOptionsStep;