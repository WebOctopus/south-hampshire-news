import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { usePricingData } from '@/hooks/usePricingData';
import { useStepForm } from './StepForm';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import AreaAndScheduleStep from './AreaAndScheduleStep';
import AdvertisementSizeStep from './AdvertisementSizeStep';

interface CalculatorStepFormProps {
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  onDataChange?: (data: any) => void;
  initialData?: {
    selectedAreas?: string[];
    bogofPaidAreas?: string[];
    bogofFreeAreas?: string[];
    selectedAdSize?: string;
    selectedDuration?: string;
    selectedMonths?: Record<string, string[]>;
  };
}

export const CalculatorStepForm: React.FC<CalculatorStepFormProps> = ({ 
  pricingModel, 
  onDataChange, 
  initialData 
}) => {
  const { nextStep } = useStepForm();
  
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData?.selectedAreas || []);
  const [bogofPaidAreas, setBogofPaidAreas] = useState<string[]>(initialData?.bogofPaidAreas || []);
  const [bogofFreeAreas, setBogofFreeAreas] = useState<string[]>(initialData?.bogofFreeAreas || []);
  const [selectedAdSize, setSelectedAdSize] = useState<string>(initialData?.selectedAdSize || "");
  const [selectedDuration, setSelectedDuration] = useState<string>(initialData?.selectedDuration || "");
  const [selectedMonths, setSelectedMonths] = useState<Record<string, string[]>>(initialData?.selectedMonths || {});

  // Call onDataChange whenever relevant data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        selectedAreas,
        bogofPaidAreas,
        bogofFreeAreas,
        selectedAdSize,
        selectedDuration,
        selectedMonths,
      });
    }
  }, [selectedAreas, bogofPaidAreas, bogofFreeAreas, selectedAdSize, selectedDuration, selectedMonths, onDataChange]);

  return (
    <ErrorBoundary>
      <AreaAndScheduleStep 
        pricingModel={pricingModel}
        selectedAreas={selectedAreas}
        bogofPaidAreas={bogofPaidAreas}
        bogofFreeAreas={bogofFreeAreas}
        selectedDuration={selectedDuration}
        selectedMonths={selectedMonths}
        onAreasChange={setSelectedAreas}
        onBogofAreasChange={(paid, free) => {
          setBogofPaidAreas(paid);
          setBogofFreeAreas(free);
        }}
        onDurationChange={setSelectedDuration}
        onMonthsChange={setSelectedMonths}
        onNext={nextStep}
      />
      
      <AdvertisementSizeStep
        selectedAdSize={selectedAdSize}
        onAdSizeChange={setSelectedAdSize}
        pricingModel={pricingModel}
        selectedAreas={selectedAreas}
        bogofPaidAreas={bogofPaidAreas}
        bogofFreeAreas={bogofFreeAreas}
        selectedDuration={selectedDuration}
        onNext={nextStep}
      />
    </ErrorBoundary>
  );
};

export default CalculatorStepForm;