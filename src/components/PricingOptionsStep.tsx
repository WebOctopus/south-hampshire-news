import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
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
  const { nextStep } = useStepForm();
  const mountedRef = useRef(true);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {packages.map((option) => {
          const Icon = getIcon(option.icon);
          
          return (
            <Card 
              key={option.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200",
                option.is_popular && "border-primary shadow-lg scale-105",
                "hover:shadow-elegant"
              )}
            >
              {option.is_popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular Choice
                </div>
              )}
              
              <CardHeader className={cn("space-y-4", option.is_popular && "pt-12")}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  {option.badge_text && (
                    <Badge variant={option.badge_variant as any} className="text-xs">
                      {option.badge_text}
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
                <Button
                  onClick={() => handleSelectOption(option.package_id as 'fixed' | 'bogof' | 'leafleting', option)}
                  className={cn(
                    "w-full",
                    option.is_popular 
                      ? "bg-primary hover:bg-primary/90 shadow-glow" 
                      : "variant-outline hover:bg-primary hover:text-primary-foreground"
                  )}
                  size="lg"
                >
                  {option.cta_text}
                </Button>

                <div className="space-y-1">
                  {option.features.map((feature, index) => (
                    <FeatureRow key={index} feature={feature} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PricingOptionsStep;