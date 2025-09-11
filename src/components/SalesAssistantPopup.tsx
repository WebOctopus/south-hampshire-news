import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Phone, MessageCircle, ChevronLeft, ChevronRight, User, MapPin, Ruler, CreditCard, Headphones } from 'lucide-react';
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
    description: "We offer three powerful advertising options to grow your business.",
    tips: [
      "3+ Repeat Package: Get 50% savings + FREE bonus areas for 6 months. Best value for ongoing campaigns",
      "Fixed Term: Perfect for one-time promotions, events, or testing new markets",
      "Leafleting: Direct door-to-door delivery reaching every household in your chosen areas"
    ],
    action: {
      text: "Need help choosing?",
      variant: "outline"
    }
  },
  2: {
    title: "Select Your Target Areas & Schedule", 
    description: "Choose up to 7 areas where your customers live and work. The more areas you select, the more FREE areas you get!",
    tips: [
      "BOGOF Deal: Select 2 paid areas → Get 2 FREE areas for 6 months",
      "Select 3 paid areas → Get 3 FREE areas. Select 7 paid areas → Get ALL remaining areas FREE!",
      "Choose areas close to your business for better response rates",
      "Check circulation numbers to see total households reached",
      "FREE areas are perfect for testing new markets risk-free"
    ]
  },
  3: {
    title: "Choose Your Advertisement Size",
    description: "Select the ad size that best showcases your business. Each size is optimized for different marketing goals.",
    tips: [
      "Business Card: Cost-effective, perfect for contact details and simple offers",
      "Quarter Page: Most popular choice - great balance of visibility and cost",
      "Half Page: High impact, ideal for detailed product/service information",
      "Full Page: Maximum impact, dominates the publication for major campaigns",
      "Pricing updates instantly as you select different sizes"
    ]
  },
  4: {
    title: "Review Your Investment & Book",
    description: "See your complete pricing breakdown and total investment required. All prices include professional design support.",
    tips: [
      "Your total shows the pre-payment required (+ VAT)",
      "FREE areas save you hundreds in additional advertising costs",
      "Save as quote to review with your team or modify later",
      "Book now for immediate campaign confirmation",
      "Our design team will create professional ads at no extra cost"
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <>
      {/* Collapsed Side Tab */}
      {isCollapsed && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 animate-slide-in-right">
          <Card 
            className="shadow-elegant border-primary/20 bg-background/95 backdrop-blur-sm cursor-pointer hover:bg-primary/5 transition-all duration-200 rounded-r-none border-r-0"
            onClick={() => setIsCollapsed(false)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Headphones className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-foreground whitespace-nowrap">Sales</div>
                  <div className="text-xs font-medium text-foreground whitespace-nowrap">Assistant</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Step {currentStep}
                  </Badge>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expanded Panel */}
      {!isCollapsed && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-96 max-w-[calc(100vw-2rem)] animate-slide-in-right">
          <Card className="shadow-elegant border-primary/20 bg-background/95 backdrop-blur-sm max-h-[600px] flex flex-col">
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
                    onClick={() => setIsCollapsed(true)}
                    title="Minimize to side"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsVisible(false)}
                    title="Close"
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

            <CardContent className="pt-0 flex-1 overflow-y-auto">
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
              
              {/* Action Buttons - Always visible at bottom */}
              <div className="flex gap-2 pt-3 border-t border-muted/20 mt-3 flex-shrink-0">
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
                  title="Call Sales"
                >
                  <Phone className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3"
                  title="Live Chat"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};