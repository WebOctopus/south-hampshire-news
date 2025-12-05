import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Clock, Edit, Download, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
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

  const isReturningBogofCustomer = quote.status === 'bogof_return_interest';
  const isDraft = quote.status === 'draft' || !quote.status;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bogof_return_interest': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Active';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'draft': return 'Draft';
      case 'bogof_return_interest': return 'Awaiting Contact';
      default: return 'Draft';
    }
  };

  const getPricingModelDisplay = (pricingModel: string) => {
    switch (pricingModel) {
      case 'fixed': return 'Fixed Term';
      case 'bogof': return '3+ Repeat Package';
      case 'leafleting': return 'Leafleting Service';
      case 'subscription': return 'Subscription';
      default: return pricingModel;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`h-full relative overflow-hidden transition-all duration-300 ${
        isDraft 
          ? 'border-2 border-amber-400 shadow-md hover:shadow-lg bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30' 
          : quote.status === 'active' || quote.status === 'approved'
          ? 'border-2 border-emerald-400 shadow-md hover:shadow-lg bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30'
          : isReturningBogofCustomer
          ? 'border-2 border-amber-400 shadow-md hover:shadow-lg bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30'
          : 'hover:shadow-md'
      }`}
    >
      {/* Animated gradient border for draft quotes */}
      {isDraft && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 opacity-20 animate-pulse pointer-events-none" />
      )}
      
      {/* Success glow for approved/active quotes */}
      {(quote.status === 'active' || quote.status === 'approved') && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 opacity-10 pointer-events-none" />
      )}
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg leading-tight">
                {quote.title || `${getPricingModelDisplay(quote.pricing_model)} Quote`}
              </CardTitle>
              {isDraft && (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {(quote.status === 'active' || quote.status === 'approved') && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="w-5 h-5 fill-emerald-600 text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(quote.status || 'draft')} ${
                  isDraft ? 'font-semibold' : ''
                }`}
              >
                {getStatusLabel(quote.status || 'draft')}
              </Badge>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(quote)}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
            >
              {isDeleting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Special Message for Returning BOGOF Customers */}
        {isReturningBogofCustomer && (
          <Alert className="border-amber-400 bg-amber-50/80 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <span className="font-semibold">Returning Customer - Awaiting Contact</span>
              <br />
              <span className="text-sm">Our team will contact you shortly with exclusive returning customer rates for the 3+ Repeat Package.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Draft Alert */}
        {isDraft && !isReturningBogofCustomer && (
          <Alert className="border-amber-400 bg-amber-50/80 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 font-medium">
              This quote is ready to book when you are
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div>
              <div className={`font-semibold text-xl ${isDraft ? 'text-amber-900' : 'text-primary'}`}>
                {formatPrice(quote.monthly_price || quote.final_total)} + vat
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{(quote.total_circulation || 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Circulation</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Created: {formatDate(quote.created_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className={isReturningBogofCustomer ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2"}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(quote)}
            disabled={isReturningBogofCustomer}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(quote)}
          >
            <Download className="h-4 w-4 mr-1" />
            View PDF
          </Button>
          {!isReturningBogofCustomer && onBookNow && (
            <Button 
              size="sm"
              onClick={() => onBookNow(quote)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Book Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}