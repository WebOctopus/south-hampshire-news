import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLeafletData } from '@/hooks/useLeafletData';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { FileText, ChevronRight } from 'lucide-react';

interface LeafletSizeStepProps {
  selectedLeafletSize: string;
  onLeafletSizeChange: (sizeId: string) => void;
  onNext: () => void;
}

const LeafletSizeStep: React.FC<LeafletSizeStepProps> = ({
  selectedLeafletSize,
  onLeafletSizeChange,
  onNext
}) => {
  const { leafletSizes, isLoading } = useLeafletData();

  const handleNext = () => {
    if (selectedLeafletSize) {
      onNext();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading leaflet sizes...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leaflet Size & Specification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Select the size and format for your leaflet distribution.
            </p>
            
            {leafletSizes && leafletSizes.length > 0 ? (
              <RadioGroup 
                value={selectedLeafletSize} 
                onValueChange={onLeafletSizeChange}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {leafletSizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={size.id} id={`leaflet-size-${size.id}`} />
                    <Label 
                      htmlFor={`leaflet-size-${size.id}`} 
                      className="flex-1 cursor-pointer p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">{size.label}</div>
                      {size.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {size.description}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leaflet sizes available</p>
                <p className="text-sm">Please contact support to set up leaflet size options.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <div></div>
          <Button 
            onClick={handleNext}
            disabled={!selectedLeafletSize}
            className="flex items-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LeafletSizeStep;