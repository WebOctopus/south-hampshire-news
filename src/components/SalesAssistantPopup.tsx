import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Phone, MessageCircle, ChevronDown, ChevronUp, User, MapPin, Ruler, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePricingData } from '@/hooks/usePricingData';

interface StepContent {
  title: string;
  description: string;
  tips: string[];
  action?: {
    text: string;
    variant?: "default" | "outline" | "secondary";
  };
}

const stepContent: Record<number, StepContent> = {
  1: {
    title: "Choose Your Advertising Package",
    description: "Select the package that best fits your business goals and budget.",
    tips: [
      "3+ Repeat Package offers the best value with 50% savings",
      "Fixed term is perfect for one-time promotions",
      "Leafleting reaches every door in your chosen areas"
    ],
    action: {
      text: "Need help choosing?",
      variant: "outline"
    }
  },
  2: {
    title: "Select Your Target Areas & Schedule",
    description: "Choose the geographic areas where your potential customers live and work. See your pricing summary update in real-time.",
    tips: [
      "Select areas close to your business location",
      "Consider areas with your target demographic",
      "BOGOF customers get FREE areas for 6 months",
      "Check circulation numbers for reach estimation"
    ]
  },
  3: {
    title: "Choose Your Advertisement Size",
    description: "Pick the size that gives your ad the right impact. View complete cost breakdown with VAT.",
    tips: [
      "Larger ads get more attention and response",
      "Quarter page is the most popular choice",
      "Full page ads dominate the publication",
      "Final pricing shows pre-payment required"
    ]
  },
  4: {
    title: "Complete Your Booking",
    description: "Review your complete pricing summary and choose your next step.",
    tips: [
      "Save as quote to review and modify later",
      "Book online for immediate confirmation", 
      "Call our sales team for personal assistance",
      "All bookings include professional design support"
    ],
    action: {
      text: "Call Sales Team",
      variant: "default"
    }
  }
};

interface SalesAssistantPopupProps {
  campaignData?: any;
  currentStep: number;
}

export const SalesAssistantPopup: React.FC<SalesAssistantPopupProps> = ({ campaignData, currentStep }) => {
  const { areas, adSizes } = usePricingData();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const currentContent = stepContent[currentStep] || stepContent[1];
  const progress = ((currentStep - 1) / 3) * 100;

  // Debug: Log pricing data to console
  useEffect(() => {
    console.log('Sales Assistant - All Campaign Data:', campaignData);
    if (campaignData?.pricingBreakdown) {
      console.log('Sales Assistant - Pricing Breakdown:', campaignData.pricingBreakdown);
      console.log('Sales Assistant - Total Cost:', campaignData.totalCost);
    } else {
      console.log('Sales Assistant - No pricingBreakdown found in campaignData');
    }
  }, [campaignData]);

  // Helper function to get area name by ID
  const getAreaName = (areaId: string) => {
    const area = areas?.find(a => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  // Helper function to get ad size name by ID
  const getAdSizeName = (adSizeId: string) => {
    const adSize = adSizes?.find(s => s.id === adSizeId);
    return adSize ? adSize.name : adSizeId;
  };

  const handleCallSales = () => {
    window.open('tel:+1234567890', '_self');
  };

  const getStepIcon = (step: number) => {
    const icons = {
      1: User,
      2: MapPin, 
      3: Ruler,
      4: CreditCard
    };
    const Icon = icons[step as keyof typeof icons] || User;
    return <Icon className="h-4 w-4" />;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-4 bottom-4 z-50 w-96 max-w-[calc(100vw-2rem)] animate-fade-in">
      <Card className="shadow-elegant border-primary/20 bg-background/95 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                {getStepIcon(currentStep)}
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Sales Assistant</CardTitle>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep} of 4
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-secondary/30 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("pt-0 flex-1 overflow-hidden transition-all duration-300", isMinimized && "pb-4")}>
          <div className={cn(
            "transition-all duration-300 h-full", 
            isMinimized ? "max-h-0 opacity-0 overflow-hidden" : "opacity-100 overflow-y-auto"
          )}>
            <div className="space-y-4 pr-2">
              <div>
                <h3 className="font-semibold text-sm mb-2">{currentContent.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentContent.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pro Tips
                </h4>
                <ul className="space-y-1.5">
                  {currentContent.tips.map((tip, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enhanced Pricing Summary for Steps 2+ */}
              {campaignData && currentStep >= 2 && (
                <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-lg p-4 space-y-3 border border-primary/20">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    SUMMARY & COST TO BOOK
                  </h4>
                  
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

                  {/* Advert Size */}
                  {campaignData.selectedSize && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Advert Size:</span>{" "}
                      <span className="font-medium">{getAdSizeName(campaignData.selectedSize)}</span>
                    </div>
                  )}

                  {/* Paid Area Locations */}
                  {((campaignData.selectedModel === 'bogof' && campaignData.bogofPaidAreas?.length > 0) || 
                    (campaignData.selectedModel !== 'bogof' && campaignData.selectedAreas?.length > 0)) && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-foreground">Paid Area Locations:</div>
                      <div className="space-y-0.5 ml-2">
                        {(campaignData.selectedModel === 'bogof' ? campaignData.bogofPaidAreas : campaignData.selectedAreas)?.map((areaId: string, index: number) => (
                          <div key={areaId} className="text-xs text-muted-foreground">
                            • Paid - {getAreaName(areaId)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FREE Area Locations (BOGOF only) */}
                  {campaignData.selectedModel === 'bogof' && campaignData.bogofFreeAreas?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-green-600">FREE Area Locations:</div>
                      <div className="text-xs text-green-600/80 italic mb-1">
                        These are the free areas that you'll get for the next 3 Issues/6 Months
                      </div>
                      <div className="space-y-0.5 ml-2">
                        {campaignData.bogofFreeAreas?.map((areaId: string, index: number) => (
                          <div key={areaId} className="text-xs text-green-600">
                            • Free - {getAreaName(areaId)}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-green-600/70 italic">
                        To keep these areas after 6 months, you'll need to purchase them separately. 
                        Use these areas to experiment with new customer generation.
                      </div>
                    </div>
                  )}

                  {/* Circulation & Pricing */}
                  {campaignData.pricingBreakdown && (
                    <div className="space-y-2 pt-2 border-t border-primary/10">
                      {campaignData.pricingBreakdown.totalCirculation && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Total Circulation per selection of area/s:</span>{" "}
                          <span className="font-semibold text-primary">
                            {campaignData.pricingBreakdown.totalCirculation?.toLocaleString()} homes
                          </span>
                        </div>
                      )}
                      
                      {campaignData.totalCost && (
                        <div className="bg-primary/10 rounded p-2 space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground">Pre-payment Required:</span>
                          </div>
                          <div className="text-sm font-bold text-primary">
                            £{campaignData.totalCost.toFixed(2)} + VAT (£{(campaignData.totalCost * 1.2).toFixed(2)})
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per insertion reaching {campaignData.pricingBreakdown.totalCirculation?.toLocaleString() || 'selected'} homes
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Selection Summary for Step 1 or No Pricing */}
              {(!campaignData || currentStep < 2 || !campaignData.pricingBreakdown) && campaignData && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-medium">Your Selection</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {campaignData.selectedModel && (
                      <div>Package: {campaignData.selectedModel}</div>
                    )}
                    {campaignData.selectedAreas?.length > 0 && (
                      <div>Areas: {campaignData.selectedAreas.length} selected</div>
                    )}
                    {campaignData.selectedSize && (
                      <div>Size: {campaignData.selectedSize}</div>
                    )}
                    {campaignData.totalCost && (
                      <div className="font-medium text-primary">
                        Total: £{campaignData.totalCost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Always visible at bottom */}
          <div className={cn(
            "flex gap-2 pt-3 border-t border-muted/20 mt-3 flex-shrink-0",
            isMinimized && "hidden"
          )}>
            {currentContent.action && (
              <Button
                variant={currentContent.action.variant || "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={currentStep === 4 ? handleCallSales : undefined}
              >
                {currentContent.action.text}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="px-3"
              onClick={handleCallSales}
            >
              <Phone className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-3"
            >
              <MessageCircle className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};