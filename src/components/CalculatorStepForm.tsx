import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { usePricingData } from '@/hooks/usePricingData';
import { useStepForm } from './StepForm';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import AreaSelectionStep from './AreaSelectionStep';
import AdvertisementSizeStep from './AdvertisementSizeStep';
import DurationScheduleStep from './DurationScheduleStep';

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
      <AreaSelectionStep 
        pricingModel={pricingModel}
        selectedAreas={selectedAreas}
        bogofPaidAreas={bogofPaidAreas}
        bogofFreeAreas={bogofFreeAreas}
        onAreasChange={setSelectedAreas}
        onBogofAreasChange={(paid, free) => {
          setBogofPaidAreas(paid);
          setBogofFreeAreas(free);
        }}
        onNext={nextStep}
      />
      
      <AdvertisementSizeStep
        selectedAdSize={selectedAdSize}
        onAdSizeChange={setSelectedAdSize}
        pricingModel={pricingModel}
        onNext={nextStep}
      />
      
      <DurationScheduleStep
        pricingModel={pricingModel}
        selectedAreas={selectedAreas}
        bogofPaidAreas={bogofPaidAreas}
        bogofFreeAreas={bogofFreeAreas}
        selectedAdSize={selectedAdSize}
        selectedDuration={selectedDuration}
        selectedMonths={selectedMonths}
        onDurationChange={setSelectedDuration}
        onMonthsChange={setSelectedMonths}
        onNext={nextStep}
      />
    </ErrorBoundary>
  );
};

export default CalculatorStepForm;