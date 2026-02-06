import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Phone, MessageCircle, ChevronLeft, ChevronRight, User, MapPin, Ruler, CreditCard, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePricingData } from '@/hooks/usePricingData';
import { useLeafletData } from '@/hooks/useLeafletData';

interface StepContent {
  title: string;
  description: string;
  tips: string[];
  action?: {
    text: string;
    variant?: "default" | "outline" | "secondary";
  };
}

// Step content organized by pricing model
const stepContentByModel: Record<string, Record<number, StepContent>> = {
  bogof: {
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
      title: "Review Your Booking & Choose Payment",
      description: "Your basket is ready! Review your selections and choose your preferred payment option.",
      tips: [
        "💰 3 Payment Options: Choose full payment (6 or 12 months) or monthly plan",
        "💸 Save 10%: Pay for 12 months upfront for extra savings",
        "📊 Monthly Plan: Spread costs over 6 months minimum",
        "🎯 Amazing Value: See your cost per 1,000 homes reached",
        "✅ What's Included: Professional design, guaranteed distribution, placement",
        "🚀 Next Step: Contact information to complete your booking"
      ]
    },
    5: {
      title: "Well Done! You've Chosen Your Advert Size and Selected Your Areas",
      description: "including the Free ones. Your quote and payment options is shown below",
      tips: [
        "💾 SAVE QUOTE: Click 'Save Quote' to store your campaign details and pricing. You can return anytime to modify or complete your booking. Simply register with your email and revisit anytime! Please note that quotes are valid for 30 days so you may need requote.",
        "🔄 GO BACK TO REVISE YOUR SELECTION: changing the advert size, reducing the number of areas will alter the monthly price. You can save every quote each time!",
        "📞 CALL FOR HELP AND ADVICE: Speak directly with our sales team 023 80 266 388 for immediate booking and tailored campaign advice. This online booking service is appreciated by those who are used to buying media space, prefer online to speaking to a sales person or have an account with Discover and know what they want.",
        "🎯 WHAT YOU'RE BOOKING: A complete advertising package including professional ad design, guaranteed distribution to your selected areas, and placement in our trusted local publication",
        "💰 INVESTMENT SHOWN: Your total includes all costs - ad creation, distribution, and VAT. No hidden fees or surprise charges",
        "⚡ IMMEDIATE CONFIRMATION: Book now for instant campaign confirmation and priority page position or call us for help and advice.",
        "📊 GUARANTEED REACH: Your ad will reach every household in your selected areas during the scheduled distribution period, on time, every time."
      ],
      action: {
        text: "Call Sales Team",
        variant: "default"
      }
    }
  },
  fixed: {
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
      description: "Choose the areas where your customers live and work to maximize your campaign effectiveness.",
      tips: [
        "Fixed Term campaigns are perfect for promoting specific events, sales, or new product launches",
        "Choose areas with your target demographic for maximum impact",
        "Consider your business location - nearby areas often have higher response rates",
        "Review circulation numbers to understand your potential reach",
        "One-time campaigns are ideal for testing new markets before committing to longer terms"
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
      title: "Well Done! You've Chosen Your Advert Size and Selected Your Areas",
      description: "including the Free ones. Your quote and payment options is shown below",
      tips: [
        "💾 SAVE QUOTE: Click 'Save Quote' to store your campaign details and pricing. You can return anytime to modify or complete your booking. Simply register with your email and revisit anytime! Please note that quotes are valid for 30 days so you may need requote.",
        "🔄 GO BACK TO REVISE YOUR SELECTION: changing the advert size, reducing the number of areas will alter the monthly price. You can save every quote each time!",
        "📞 CALL FOR HELP AND ADVICE: Speak directly with our sales team 023 80 266 388 for immediate booking and tailored campaign advice. This online booking service is appreciated by those who are used to buying media space, prefer online to speaking to a sales person or have an account with Discover and know what they want.",
        "🎯 WHAT YOU'RE BOOKING: A complete advertising package including professional ad design, guaranteed distribution to your selected areas, and placement in our trusted local publication",
        "💰 INVESTMENT SHOWN: Your total includes all costs - ad creation, distribution, and VAT. No hidden fees or surprise charges",
        "⚡ IMMEDIATE CONFIRMATION: Book now for instant campaign confirmation and priority page position or call us for help and advice.",
        "📊 GUARANTEED REACH: Your ad will reach every household in your selected areas during the scheduled distribution period, on time, every time."
      ],
      action: {
        text: "Call Sales Team",
        variant: "default"
      }
    }
  },
  leafleting: {
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
      title: "Select Distribution Areas & Schedule",
      description: "Choose the areas where you want your leaflets delivered door-to-door for maximum local impact.",
      tips: [
        "Leaflet campaigns deliver directly to every household - guaranteed 100% coverage",
        "Select areas within your service radius for optimal response rates",
        "Consider demographic data - choose areas that match your target customer profile",
        "Local businesses see higher response rates from nearby residential areas",
        "Multiple area campaigns can help you dominate entire neighborhoods"
      ]
    },
    3: {
      title: "Choose Your Leaflet Size & Format",
      description: "Select the leaflet format that best presents your business information and special offers.",
      tips: [
        "A5 Single-sided: Cost-effective, perfect for simple offers and contact details",
        "A5 Double-sided: More space for detailed information about your services",
        "A5 Folded: Professional presentation, ideal for menus and service lists",
        "A4 Four Sides: Maximum space for comprehensive business information",
        "A4 Tri-fold: Premium format, perfect for professional services and detailed offerings",
        "Postcard Format: Eye-catching, great for promotions and vouchers"
      ]
    },
    4: {
      title: "Well Done! You've Chosen Your Advert Size and Selected Your Areas",
      description: "including the Free ones. Your quote and payment options is shown below",
      tips: [
        "💾 SAVE QUOTE: Click 'Save Quote' to store your campaign details and pricing. You can return anytime to modify or complete your booking. Simply register with your email and revisit anytime! Please note that quotes are valid for 30 days so you may need requote.",
        "🔄 GO BACK TO REVISE YOUR SELECTION: changing the advert size, reducing the number of areas will alter the monthly price. You can save every quote each time!",
        "📞 CALL FOR HELP AND ADVICE: Speak directly with our sales team 023 80 266 388 for immediate booking and tailored campaign advice. This online booking service is appreciated by those who are used to buying media space, prefer online to speaking to a sales person or have an account with Discover and know what they want.",
        "🎯 WHAT YOU'RE BOOKING: A complete advertising package including professional ad design, guaranteed distribution to your selected areas, and placement in our trusted local publication",
        "💰 INVESTMENT SHOWN: Your total includes all costs - ad creation, distribution, and VAT. No hidden fees or surprise charges",
        "⚡ IMMEDIATE CONFIRMATION: Book now for instant campaign confirmation and priority page position or call us for help and advice.",
        "📊 GUARANTEED REACH: Your ad will reach every household in your selected areas during the scheduled distribution period, on time, every time."
      ],
      action: {
        text: "Call Sales Team",
        variant: "default"
      }
    }
  }
};

// Helper function to get step content based on pricing model
const getStepContent = (pricingModel: string, step: number): StepContent => {
  const modelContent = stepContentByModel[pricingModel] || stepContentByModel.bogof;
  return modelContent[step] || modelContent[1];
};

interface SalesAssistantPopupProps {
  campaignData?: any;
  currentStep: number;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onBookNow?: () => void;
  onSaveQuote?: () => void;
  totalSteps?: number;
}

export const SalesAssistantPopup: React.FC<SalesAssistantPopupProps> = ({ 
  campaignData, 
  currentStep, 
  onNextStep, 
  onPrevStep, 
  onBookNow,
  onSaveQuote,
  totalSteps = 4 
}) => {
  console.log('🎯 Sales Assistant - All Campaign Data:', campaignData);
  console.log('🔍 Sales Assistant - Agency Discount Check:', {
    agencyDiscount: campaignData?.pricingBreakdown?.agencyDiscount,
    agencyDiscountPercent: campaignData?.pricingBreakdown?.agencyDiscountPercent,
    shouldShowAgencyDiscount: (campaignData?.pricingBreakdown?.agencyDiscountPercent || 0) > 0
  });
  
  const { areas, adSizes } = usePricingData();
  const { leafletAreas, leafletSizes } = useLeafletData();
  const [isCollapsed, setIsCollapsed] = useState(currentStep === 4 || currentStep === 5); // Auto-collapse on step 4 and 5
  const [isVisible, setIsVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const currentContent = getStepContent(campaignData?.selectedModel || 'bogof', currentStep);
  const progress = ((currentStep - 1) / 3) * 100;

  // Auto-collapse on step 4 and 5, expand on other steps
  useEffect(() => {
    setIsCollapsed(currentStep === 4 || currentStep === 5);
  }, [currentStep]);

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
    // Use leaflet areas for leafleting services, regular areas for advertising
    const effectiveAreas = campaignData?.selectedModel === 'leafleting' ? leafletAreas : areas;
    const area = effectiveAreas?.find(a => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  // Helper function to get ad size name by ID
  const getAdSizeName = (adSizeId: string) => {
    // Use leaflet sizes for leafleting services, regular ad sizes for advertising
    if (campaignData?.selectedModel === 'leafleting') {
      const leafletSize = leafletSizes?.find(s => s.id === adSizeId);
      return leafletSize ? leafletSize.label : adSizeId;
    } else {
      const adSize = adSizes?.find(s => s.id === adSizeId);
      return adSize ? adSize.name : adSizeId;
    }
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

              </div>
              
              {/* Action Buttons - Reorganized Layout */}
              <div className="flex flex-col gap-2 pt-3 border-t border-muted/20 mt-3 flex-shrink-0">
                {/* Top Row: Navigation and Action Buttons */}
                <div className="flex gap-2">
                  {/* Step Navigation - Back Button */}
                  {currentStep > 1 && onPrevStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={onPrevStep}
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Back
                    </Button>
                  )}
                  
                  {/* Step Navigation - Next Button (when not on last step) */}
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
                  
                  {/* Call Sales Team Button (when no next step or on step 4) */}
                  {(currentStep === totalSteps || !onNextStep) && currentContent.action && (
                    <Button
                      variant={currentContent.action.variant || "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={currentStep === 4 ? handleCallSales : undefined}
                    >
                      {currentContent.action.text}
                    </Button>
                  )}
                  
                  {/* Save Quote Button - Only show on step 5 */}
                  {currentStep === 5 && onSaveQuote && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-blue-500 text-blue-600 hover:bg-blue-50"
                      onClick={onSaveQuote}
                    >
                      Save Quote
                    </Button>
                  )}
                </div>
                
                {/* Bottom Row: Book Now Button - Full Width on Step 5 */}
                {currentStep === 5 && onBookNow && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-xs bg-green-600 hover:bg-green-700 text-white font-medium"
                    onClick={onBookNow}
                  >
                    Book Now
                  </Button>
                )}
              </div>
             </CardContent>
           </Card>
         </div>
       )}
     </div>
   );
 };