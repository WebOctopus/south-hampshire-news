import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EditableText } from '@/components/inline-editor/EditableText';
import { AdvertisingContent } from '@/hooks/useAdvertisingContent';

interface DesignFeeStepProps {
  needsDesign: boolean;
  onDesignChoiceChange: (needsDesign: boolean) => void;
  designFee: number;
  pricingModel: 'fixed' | 'bogof' | 'leafleting';
  advertisingContent?: AdvertisingContent;
  onContentSave?: (path: string, value: string) => void;
}

export const DesignFeeStep: React.FC<DesignFeeStepProps> = ({
  needsDesign,
  onDesignChoiceChange,
  designFee,
  pricingModel,
  advertisingContent,
  onContentSave
}) => {
  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  const df = advertisingContent?.designFee;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Palette className="h-6 w-6" />
          <EditableText
            value={df?.pageHeading || "Artwork Design Service"}
            onSave={(value) => onContentSave?.('designFee.pageHeading', value)}
            as="span"
          />
        </h2>
        <EditableText
          value={df?.pageDescription || "Do you need help designing your advertisement?"}
          onSave={(value) => onContentSave?.('designFee.pageDescription', value)}
          as="p"
          className="text-muted-foreground"
        />
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong>{' '}
          <EditableText
            value={df?.alertText || "Professional artwork is essential for effective advertising. Our design team can create eye-catching materials that drive results."}
            onSave={(value) => onContentSave?.('designFee.alertText', value)}
            as="span"
          />
        </AlertDescription>
      </Alert>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <EditableText
              value={df?.cardTitle || "Artwork Design Fee"}
              onSave={(value) => onContentSave?.('designFee.cardTitle', value)}
              as="span"
            />
            {designFee > 0 && (
              <Badge variant="secondary" className="ml-auto text-base">
                {formatPrice(designFee)} + VAT
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            <EditableText
              value={df?.cardDescription || "Select whether you need our professional design services"}
              onSave={(value) => onContentSave?.('designFee.cardDescription', value)}
              as="span"
            />
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
                      <EditableText
                        value={df?.yesLabel || "Yes, please contact me to start the design process"}
                        onSave={(value) => onContentSave?.('designFee.yesLabel', value)}
                        as="span"
                      />
                      {needsDesign && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <EditableText
                        value={df?.yesDescription || "Our professional design team will work with you to create compelling artwork that captures attention and drives customer engagement."}
                        onSave={(value) => onContentSave?.('designFee.yesDescription', value)}
                        as="span"
                      />
                      {' '}The design fee of {formatPrice(designFee)} + VAT will be added to your booking.
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
                      <p className="text-xs text-primary font-medium">
                        ✓ <EditableText
                          value={df?.bullet1 || "Professional design consultation"}
                          onSave={(value) => onContentSave?.('designFee.bullet1', value)}
                          as="span"
                        />
                      </p>
                      <p className="text-xs text-primary font-medium">
                        ✓ <EditableText
                          value={df?.bullet2 || "Unlimited revisions until you're satisfied"}
                          onSave={(value) => onContentSave?.('designFee.bullet2', value)}
                          as="span"
                        />
                      </p>
                      <p className="text-xs text-primary font-medium">
                        ✓ <EditableText
                          value={df?.bullet3 || "Print-ready artwork delivered"}
                          onSave={(value) => onContentSave?.('designFee.bullet3', value)}
                          as="span"
                        />
                      </p>
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
                      <EditableText
                        value={df?.noLabel || "No, finished artwork will be supplied"}
                        onSave={(value) => onContentSave?.('designFee.noLabel', value)}
                        as="span"
                      />
                      {!needsDesign && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <EditableText
                        value={df?.noDescription || "You'll provide your own print-ready artwork that meets our specifications. No design fee will be added to your booking."}
                        onSave={(value) => onContentSave?.('designFee.noDescription', value)}
                        as="span"
                      />
                    </p>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        ℹ️ <EditableText
                          value={df?.noNote || "Artwork must be supplied in high-resolution print-ready format (PDF, AI, or EPS)"}
                          onSave={(value) => onContentSave?.('designFee.noNote', value)}
                          as="span"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong>{' '}
              <EditableText
                value={df?.footerNote || "The design fee covers the creation of your artwork. If you choose to supply your own artwork, please ensure it meets our technical specifications."}
                onSave={(value) => onContentSave?.('designFee.footerNote', value)}
                as="span"
              />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignFeeStep;
