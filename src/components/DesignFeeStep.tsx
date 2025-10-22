import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DesignFeeStepProps {
  needsDesign: boolean;
  onDesignChoiceChange: (needsDesign: boolean) => void;
  designFee: number;
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
}

export const DesignFeeStep: React.FC<DesignFeeStepProps> = ({
  needsDesign,
  onDesignChoiceChange,
  designFee,
  pricingModel
}) => {
  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  const productTypeName = pricingModel === 'fixed' 
    ? 'Fixed Term' 
    : pricingModel === 'bogof' 
    ? '3+ Repeat Package' 
    : 'Leafleting';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Palette className="h-6 w-6" />
          Artwork Design Service
        </h2>
        <p className="text-muted-foreground">
          Do you need help designing your advertisement?
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong> Professional artwork is essential for effective advertising. 
          Our design team can create eye-catching materials that drive results.
        </AlertDescription>
      </Alert>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Artwork Design Fee
            {designFee > 0 && (
              <Badge variant="secondary" className="ml-auto text-base">
                {formatPrice(designFee)} + VAT
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Select whether you need our professional design services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={needsDesign ? 'yes' : 'no'}
            onValueChange={(value) => onDesignChoiceChange(value === 'yes')}
            className="space-y-4"
          >
            {/* YES - Need Design */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                needsDesign 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => onDesignChoiceChange(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem value="yes" id="design-yes" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <Label 
                      htmlFor="design-yes" 
                      className="text-lg font-semibold cursor-pointer flex items-center gap-2"
                    >
                      Yes, please contact me to start the design process
                      {needsDesign && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our professional design team will work with you to create compelling artwork 
                      that captures attention and drives customer engagement. The design fee of {formatPrice(designFee)} + VAT 
                      will be added to your booking.
                    </p>
                    {designFee > 0 && needsDesign && (
                      <div className="pt-3 mt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Design Fee:</span>
                          <Badge variant="default" className="text-base">
                            {formatPrice(designFee)} + VAT
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="pt-2">
                      <p className="text-xs text-primary font-medium">✓ Professional design consultation</p>
                      <p className="text-xs text-primary font-medium">✓ Unlimited revisions until you're satisfied</p>
                      <p className="text-xs text-primary font-medium">✓ Print-ready artwork delivered</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NO - Supply Own Artwork */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                !needsDesign 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => onDesignChoiceChange(false)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem value="no" id="design-no" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <Label 
                      htmlFor="design-no" 
                      className="text-lg font-semibold cursor-pointer flex items-center gap-2"
                    >
                      No, finished artwork will be supplied
                      {!needsDesign && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You'll provide your own print-ready artwork that meets our specifications. 
                      No design fee will be added to your booking.
                    </p>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        ℹ️ Artwork must be supplied in high-resolution print-ready format (PDF, AI, or EPS)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> The design fee covers the creation of your artwork. 
              If you choose to supply your own artwork, please ensure it meets our 
              <a href="/support" className="text-primary hover:underline ml-1">
                technical specifications
              </a>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignFeeStep;
