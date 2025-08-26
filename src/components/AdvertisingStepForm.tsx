import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import StepForm from '@/components/StepForm';
import PricingOptionsStep from '@/components/PricingOptionsStep';
import CalculatorStepForm from '@/components/CalculatorStepForm';
import ContactInformationStep from '@/components/ContactInformationStep';

export const AdvertisingStepForm: React.FC = () => {
  const [selectedPricingModel, setSelectedPricingModel] = useState<'fixed' | 'bogof' | 'leafleting'>('fixed');
  const [campaignData, setCampaignData] = useState({
    selectedAreas: [] as string[],
    bogofPaidAreas: [] as string[],
    bogofFreeAreas: [] as string[],
    selectedAdSize: '',
    selectedDuration: '',
    pricingBreakdown: null as any
  });

  const handleSelectOption = (option: 'fixed' | 'bogof' | 'leafleting') => {
    console.log('Selected pricing option:', option);
    setSelectedPricingModel(option);
  };

  const handleCampaignDataChange = (data: any) => {
    setCampaignData(data);
  };

  return (
    <StepForm>
      <PricingOptionsStep onSelectOption={handleSelectOption} />
      
      <CalculatorStepForm 
        pricingModel={selectedPricingModel} 
        onDataChange={handleCampaignDataChange}
      />
      
      <ContactInformationStep
        pricingModel={selectedPricingModel}
        selectedAreas={campaignData.selectedAreas}
        bogofPaidAreas={campaignData.bogofPaidAreas}
        bogofFreeAreas={campaignData.bogofFreeAreas}
        selectedAdSize={campaignData.selectedAdSize}
        selectedDuration={campaignData.selectedDuration}
        pricingBreakdown={campaignData.pricingBreakdown}
      />
      
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-600">Quote Submitted!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your quote request. Our sales team will contact you within 24 hours to discuss your advertising needs.
        </p>
      </div>
    </StepForm>
  );
};

export default AdvertisingStepForm;