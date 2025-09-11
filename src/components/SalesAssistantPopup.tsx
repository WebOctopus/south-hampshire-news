import React, { useState, useEffect, useRef } from 'react';
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
    title: "Ready to Book Your Campaign?",
    description: "You're booking a professional advertising campaign that includes ad design, targeted distribution, and ongoing support. Here are your next steps to get started.",
    tips: [
      "💾 SAVE QUOTE: Click 'Save Quote' to store your campaign details and pricing. You can return anytime to modify or complete your booking",
      "📞 CALL TO BOOK: Speak directly with our sales team at [phone number] for immediate booking and personalized campaign advice",
      "🎯 WHAT YOU'RE BOOKING: A complete advertising package including professional ad design, guaranteed distribution to your selected areas, and placement in our trusted local publication",
      "💰 INVESTMENT SHOWN: Your total includes all costs - ad creation, distribution, and VAT. No hidden fees or surprise charges",
      "⚡ IMMEDIATE CONFIRMATION: Book now for instant campaign confirmation and priority design queue placement",
      "🎨 FREE DESIGN SERVICE: Our professional design team creates stunning ads at no extra cost - just provide your content and branding",
      "📊 GUARANTEED REACH: Your ad will reach every household in your selected areas during the scheduled distribution period"
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
  onNextStep?: () => void;
  onPrevStep?: () => void;
  totalSteps?: number;
}

export const SalesAssistantPopup: React.FC<SalesAssistantPopupProps> = ({ 
  campaignData, 
  currentStep, 
  onNextStep, 
  onPrevStep, 
  totalSteps = 4 
}) => {
  const { areas, adSizes } = usePricingData();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const currentContent = stepContent[currentStep] || stepContent[1];
  const progress = ((currentStep - 1) / 3) * 100;

  // Reset scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentStep]);

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

  // Show the component from step 2 onwards
  const shouldShow = isVisible && currentStep >= 2;

  return (
    <div style={{ display: shouldShow ? 'block' : 'none' }}>
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
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setIsCollapsed(true)}
                    title="Minimize to side"
                  >
                    <span className="mr-1">Hide Assistant</span>
                    <ChevronRight className="h-3 w-3" />
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

            <CardContent className="pt-0 flex-1 overflow-y-auto" ref={scrollContainerRef}>
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
                     {currentStep >= 3 ? 'FINAL PRICING BREAKDOWN' : 'SUMMARY & COST TO BOOK'}
                   </h4>
                   
                   {/* Total Homes Reached - Prominent Display */}
                   {campaignData.pricingBreakdown?.totalCirculation && (
                     <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
                       <div className="text-center">
                         <div className="text-xs font-medium text-muted-foreground mb-1">
                           TOTAL HOMES YOU'LL REACH
                         </div>
                         <div className="text-2xl font-bold text-primary">
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

                   {/* Advert Size */}
                   {campaignData.selectedSize && (
                     <div className="text-xs">
                       <span className="text-muted-foreground">Advert Size:</span>{" "}
                       <span className="font-medium">{getAdSizeName(campaignData.selectedSize)}</span>
                     </div>
                   )}

                   {/* Area Breakdown - Clean List */}
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

                   {/* FREE Area Locations (BOGOF only) - Clean List */}
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
                       <div className="text-xs text-green-600/70 italic mb-2">
                         To keep these areas after 6 months, you'll need to purchase them separately. 
                         Use these areas to experiment with new customer generation.
                       </div>
                       
                       {/* Total Circulation for BOGOF */}
                       {campaignData.pricingBreakdown?.totalCirculation && (
                         <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                           <div className="text-xs text-center">
                             <span className="font-medium text-green-700">
                               Total: {campaignData.pricingBreakdown.totalCirculation.toLocaleString()} homes reached
                             </span>
                             <div className="text-xs text-green-600/70 mt-1">
                               ({(campaignData.bogofPaidAreas?.length || 0)} paid + {(campaignData.bogofFreeAreas?.length || 0)} free areas)
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {/* Clean Summary Subtitle for Non-BOGOF */}
                   {campaignData.selectedModel !== 'bogof' && campaignData.pricingBreakdown?.totalCirculation && (
                     <div className="bg-muted/30 rounded-lg p-2 border border-muted/40">
                       <div className="text-xs text-center text-muted-foreground">
                         <span className="font-medium">
                           {campaignData.selectedAreas?.length || 0} total areas selected
                         </span>
                         {" • "}
                         <span className="font-semibold text-primary">
                           {campaignData.pricingBreakdown.totalCirculation.toLocaleString()} homes reached
                         </span>
                       </div>
                     </div>
                   )}

                   {/* Enhanced Pricing Details for Step 3+ */}
                   {campaignData.pricingBreakdown && currentStep >= 3 && (
                     <div className="space-y-3 pt-2 border-t border-primary/10">
                       {/* Detailed Cost Breakdown */}
                       <div className="space-y-2">
                         <div className="text-xs font-medium text-foreground">Pricing Breakdown:</div>
                         
                         {/* Base Cost */}
                         <div className="text-xs flex justify-between">
                           <span className="text-muted-foreground">Base Cost:</span>
                           <span className="font-medium">£{campaignData.pricingBreakdown.subtotal?.toFixed(2) || '0.00'}</span>
                         </div>
                         
                         {/* Volume Discount */}
                         {campaignData.pricingBreakdown.volumeDiscountPercent > 0 && (
                           <div className="text-xs flex justify-between text-green-600">
                             <span>Volume Discount ({campaignData.pricingBreakdown.volumeDiscountPercent}%):</span>
                             <span>-£{campaignData.pricingBreakdown.volumeDiscount?.toFixed(2) || '0.00'}</span>
                           </div>
                         )}
                         
                         {/* Duration Multiplier */}
                         {campaignData.pricingBreakdown.durationMultiplier > 1 && (
                           <div className="text-xs flex justify-between">
                             <span className="text-muted-foreground">Duration ({campaignData.pricingBreakdown.durationMultiplier} issues):</span>
                             <span className="font-medium">×{campaignData.pricingBreakdown.durationMultiplier}</span>
                           </div>
                         )}
                         
                         {/* Cost Per Thousand (CPM) */}
                         {campaignData.pricingBreakdown.totalCirculation && campaignData.pricingBreakdown.finalTotal && (
                           <div className="text-xs flex justify-between">
                             <span className="text-muted-foreground">Cost per 1,000 homes:</span>
                             <span className="font-medium">
                               £{((campaignData.pricingBreakdown.finalTotal / campaignData.pricingBreakdown.totalCirculation) * 1000).toFixed(2)}
                             </span>
                           </div>
                         )}
                       </div>
                       
                       {/* Final Total */}
                       <div className="bg-primary/15 rounded-lg p-3 space-y-1">
                         <div className="text-xs font-medium text-primary">
                           TOTAL INVESTMENT REQUIRED:
                         </div>
                         <div className="text-lg font-bold text-primary">
                           £{campaignData.pricingBreakdown.finalTotal?.toFixed(2) || '0.00'} + VAT
                         </div>
                         <div className="text-sm font-semibold text-primary">
                           £{((campaignData.pricingBreakdown.finalTotal || 0) * 1.2).toFixed(2)} (inc. VAT)
                         </div>
                         <div className="text-xs text-muted-foreground">
                           per insertion reaching {campaignData.pricingBreakdown.totalCirculation?.toLocaleString() || 'selected'} homes
                         </div>
                         
                         {/* Savings Display for BOGOF */}
                         {campaignData.selectedModel === 'bogof' && campaignData.bogofFreeAreas?.length > 0 && (
                           <div className="text-xs text-green-600 font-medium pt-1 border-t border-green-200">
                             You're saving £{((campaignData.pricingBreakdown.finalTotal || 0) * 0.5).toFixed(2)} with FREE areas!
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                   
                   {/* Basic Pricing for Step 2 */}
                   {campaignData.pricingBreakdown && currentStep < 3 && (
                     <div className="space-y-2 pt-2 border-t border-primary/10">
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
                {/* Step Navigation Buttons */}
                {currentStep < totalSteps && onNextStep && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={onNextStep}
                  >
                    Next Step
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
                
                {currentStep > 1 && onPrevStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-4 text-xs"
                    onClick={onPrevStep}
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                )}
                
                {/* Contact/Action Buttons */}
                {currentContent.action && (
                  <Button
                    variant={currentContent.action.variant || "outline"}
                    size="sm"
                    className="text-xs"
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
     </div>
   );
 };