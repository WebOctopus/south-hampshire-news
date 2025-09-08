import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Phone, MessageCircle, ChevronDown, ChevronUp, User, MapPin, Ruler, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    title: "Select Your Target Areas",
    description: "Choose the geographic areas where your potential customers live and work.",
    tips: [
      "Select areas close to your business location",
      "Consider areas with your target demographic",
      "More areas = wider reach but higher cost",
      "Check circulation numbers for each area"
    ]
  },
  3: {
    title: "Choose Your Advertisement Size",
    description: "Pick the size that gives your ad the right impact and fits your budget.",
    tips: [
      "Larger ads get more attention and response",
      "Quarter page is the most popular choice",
      "Full page ads dominate the publication",
      "See real-time pricing as you select"
    ]
  },
  4: {
    title: "Complete Your Booking",
    description: "You're almost done! Review your selection and choose your next step.",
    tips: [
      "Save as quote to review later",
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const currentContent = stepContent[currentStep] || stepContent[1];
  const progress = ((currentStep - 1) / 3) * 100;

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
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80 animate-fade-in">
      <Card className="shadow-elegant border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
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

        <CardContent className={cn("pt-0 transition-all duration-300", isMinimized && "pb-4")}>
          <div className={cn("transition-all duration-300 overflow-hidden", isMinimized ? "max-h-0 opacity-0" : "max-h-96 opacity-100")}>
            <div className="space-y-4">
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

              {/* Current Selection Summary */}
              {campaignData && currentStep >= 2 && (
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

              {/* Action Buttons */}
              <div className="flex gap-2">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};