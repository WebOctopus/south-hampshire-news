import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users } from 'lucide-react';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletData } from '@/hooks/useLeafletData';

interface MobilePricingSummaryProps {
  campaignData: any;
  currentStep: number;
}

export const MobilePricingSummary: React.FC<MobilePricingSummaryProps> = ({
  campaignData,
  currentStep
}) => {
  const { areas, adSizes } = usePricingData();
  const { leafletAreas, leafletSizes } = useLeafletData();

  // Helper function to get area name by ID
  const getAreaName = (areaId: string) => {
    const effectiveAreas = campaignData?.selectedModel === 'leafleting' ? leafletAreas : areas;
    const area = effectiveAreas?.find(a => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  // Helper function to get ad size name by ID
  const getAdSizeName = (adSizeId: string) => {
    if (campaignData?.selectedModel === 'leafleting') {
      const size = leafletSizes?.find(s => s.id === adSizeId);
      return size ? size.label : adSizeId;
    } else {
      const size = adSizes?.find(s => s.id === adSizeId);
      return size ? size.name : adSizeId;
    }
  };

  if (!campaignData || currentStep < 2 || !campaignData.pricingBreakdown) {
    return null;
  }

  return (
    <div className="md:hidden mt-6">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {currentStep >= 3 ? 'FINAL PRICING BREAKDOWN' : 'SUMMARY & COST TO BOOK'}
          </h4>
          
          {/* Total Homes Reached */}
          {campaignData.pricingBreakdown?.totalCirculation && (
            <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  TOTAL HOMES YOU'LL REACH
                </div>
                <div className="text-xl font-bold text-primary">
                  {campaignData.pricingBreakdown.totalCirculation.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  homes per insertion
                </div>
              </div>
            </div>
          )}
          
          {/* Booking Type */}
          {campaignData.selectedModel && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-foreground">
                <span className="text-muted-foreground">Booking Type:</span>{" "}
                {campaignData.selectedModel === 'fixed' ? 'Fixed Term' : 
                 campaignData.selectedModel === 'bogof' ? '3+ Repeat Package' : 
                 'Leafleting Campaign'}
              </div>
            </div>
          )}

          {/* Size label */}
          {campaignData.selectedSize && (
            <div className="text-xs">
              <span className="text-muted-foreground">
                {campaignData.selectedModel === 'leafleting' ? 'Leaflet Size:' : 'Advert Size:'}
              </span>{" "}
              <span className="font-medium">{getAdSizeName(campaignData.selectedSize)}</span>
            </div>
          )}

          {/* Paid Areas */}
          {((campaignData.selectedModel === 'bogof' && campaignData.bogofPaidAreas?.length > 0) || 
            (campaignData.selectedModel !== 'bogof' && campaignData.selectedAreas?.length > 0)) && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-foreground">Paid Area Locations:</div>
              <div className="space-y-0.5 ml-2">
                {(campaignData.selectedModel === 'bogof' ? campaignData.bogofPaidAreas : campaignData.selectedAreas)?.map((areaId: string) => (
                  <div key={areaId} className="text-xs text-muted-foreground">
                    • Paid - {getAreaName(areaId)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FREE Areas (BOGOF only) */}
          {campaignData.selectedModel === 'bogof' && campaignData.bogofFreeAreas?.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-green-600">FREE Area Locations:</div>
              <div className="text-xs text-green-600/80 italic mb-1">
                These are the free areas that you'll get for the next 3 Issues/6 Months
              </div>
              <div className="space-y-0.5 ml-2">
                {campaignData.bogofFreeAreas?.map((areaId: string) => (
                  <div key={areaId} className="text-xs text-green-600">
                    • Free - {getAreaName(areaId)}
                  </div>
                ))}
              </div>
              <div className="text-xs text-green-600/70 italic mb-2">
                To keep these areas after 6 months, you'll need to purchase them separately. 
                Use these areas to experiment with new customer generation.
              </div>
            </div>
          )}

          {/* Pricing */}
          {campaignData.pricingBreakdown?.finalTotal && (
            <div className="bg-primary/10 rounded p-3 space-y-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Pre-payment Required:</span>
              </div>
              <div className="text-sm font-bold text-primary">
                £{(campaignData.pricingBreakdown.finalTotal || 0).toFixed(2)} + VAT 
                (£{(((campaignData.pricingBreakdown.finalTotal || 0) * 1.2)).toFixed(2)})
              </div>
              <div className="text-xs text-muted-foreground">
                per insertion reaching {campaignData.pricingBreakdown.totalCirculation?.toLocaleString() || 'selected'} homes
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};