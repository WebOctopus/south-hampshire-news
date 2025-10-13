import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Users, TrendingUp, Edit, Download, CheckCircle, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/pricingCalculator';

interface QuoteConversionCardProps {
  quote: any;
  onEdit: (quote: any) => void;
  onView: (quote: any) => void;
  onDelete?: (quote: any) => void;
  isDeleting?: boolean;
  onBookNow?: (quote: any) => void;
}

export default function QuoteConversionCard({ quote, onEdit, onView, onDelete, isDeleting, onBookNow }: QuoteConversionCardProps) {
  // Add null safety check
  if (!quote) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCampaignTypeLabel = (pricingModel: string) => {
    switch (pricingModel) {
      case 'fixed': return 'Fixed Term Campaign';
      case 'bogof': return 'BOGOF Special Deal';
      case 'leafleting': return 'Leaflet Distribution';
      case 'subscription': return 'Subscription Campaign';
      default: return 'Campaign';
    }
  };

  const getAreasFromSelections = (selections: any) => {
    if (!selections) return [];
    
    // Try different area selection patterns
    if (selections.selectedAreas?.length > 0) return selections.selectedAreas;
    if (selections.bogofPaidAreas?.length > 0) return [...(selections.bogofPaidAreas || []), ...(selections.bogofFreeAreas || [])];
    if (quote.selected_area_ids?.length > 0) return quote.selected_area_ids;
    
    return [];
  };

  const areas = getAreasFromSelections(quote.selections);
  const progress = quote.status === 'active' ? 100 : quote.status === 'approved' ? 75 : 25;

  return (
    <Card className="group hover:shadow-lg transition-shadow border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-2">{quote.title || 'Advertising Campaign'}</CardTitle>
            <Badge className={getStatusColor(quote.status || 'pending')}>
              {quote.status || 'pending'}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{formatPrice(quote.final_total)}</p>
            <p className="text-sm text-muted-foreground">Total Investment</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Campaign Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Campaign Type
            </div>
            <p className="font-medium">{getCampaignTypeLabel(quote.pricing_model)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              Total Reach
            </div>
            <p className="font-medium">{(quote.total_circulation || 0).toLocaleString()} homes</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Campaign Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Quote Saved ✓</span>
            <span>{quote.status === 'approved' || quote.status === 'active' ? 'Approved ✓' : 'Awaiting Approval'}</span>
            <span>{quote.status === 'active' ? 'Campaign Live ✓' : 'Ready to Launch'}</span>
          </div>
        </div>

        {/* ROI Highlight */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Potential Impact</span>
          </div>
          <p className="text-sm text-green-700 mb-2">
            If just 1% of your {(quote.total_circulation || 0).toLocaleString()} reach responds, 
            that's {Math.round((quote.total_circulation || 0) / 100)} potential customers!
          </p>
          <p className="text-xs text-green-600">
            Cost per household: {formatPrice((quote.final_total || 0) / (quote.total_circulation || 1))}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(quote)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(quote)}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            View PDF
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(quote)}
              disabled={isDeleting}
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Button 
            size="sm"
            onClick={() => onBookNow && onBookNow(quote)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}