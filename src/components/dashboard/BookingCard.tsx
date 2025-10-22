import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, DollarSign, Package, Trash2, CreditCard, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/pricingCalculator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookingCardProps {
  booking: {
    id: string;
    title: string;
    pricing_model: string;
    status: string;
    payment_status?: string;
    final_total: number;
    monthly_price: number;
    total_circulation: number;
    created_at: string;
    webhook_sent_at?: string;
    selections?: any;
    pricing_breakdown?: any;
  };
  onDelete?: (booking: any) => void;
  isDeleting?: boolean;
  onViewDetails?: (booking: any) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onDelete, isDeleting, onViewDetails }) => {
  const isPaymentRequired = !booking.payment_status || booking.payment_status === 'pending';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'webhook_failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status) {
      case 'paid':
      case 'subscription_active':
      case 'mandate_active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'payment_pending':
      case 'subscription_pending':
      case 'mandate_created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPaymentStatusLabel = (status?: string) => {
    if (!status || status === 'pending') return 'Payment Required';
    switch (status) {
      case 'paid': return 'Paid';
      case 'subscription_active': return 'Subscription Active';
      case 'mandate_active': return 'Direct Debit Setup';
      case 'payment_pending': return 'Payment Processing';
      case 'subscription_pending': return 'Setting Up';
      case 'mandate_created': return 'DD Setup Complete';
      case 'failed': return 'Payment Failed';
      default: return status.replace(/_/g, ' ');
    }
  };

  const getPricingModelDisplay = (model: string) => {
    switch (model) {
      case 'fixed': return 'Fixed Term';
      case 'bogof': return '3+ Repeat Package';
      case 'leafleting': return 'Leafleting Service';
      default: return model;
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
        isPaymentRequired 
          ? 'border-2 border-amber-400 shadow-lg hover:shadow-xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30' 
          : 'hover:shadow-md cursor-pointer'
      }`}
      onClick={() => onViewDetails?.(booking)}
    >
      {/* Animated gradient border for unpaid bookings */}
      {isPaymentRequired && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 opacity-20 animate-pulse pointer-events-none" />
      )}
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg leading-tight">{booking.title}</CardTitle>
              {isPaymentRequired && (
                <div className="flex items-center gap-1 text-amber-600 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getPaymentStatusColor(booking.payment_status)} ${
                  isPaymentRequired ? 'font-semibold' : ''
                }`}
              >
                {getPaymentStatusLabel(booking.payment_status)}
              </Badge>
              <Badge variant="secondary">
                {getPricingModelDisplay(booking.pricing_model)}
              </Badge>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(booking);
              }}
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
        {/* Payment Required Alert */}
        {isPaymentRequired && (
          <Alert className="border-amber-400 bg-amber-50/80 backdrop-blur-sm">
            <CreditCard className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 font-medium">
              Complete your booking payment to secure your advertising campaign
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className={`font-medium ${isPaymentRequired ? 'text-lg text-amber-900' : ''}`}>
                {formatPrice(booking.final_total)}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{booking.total_circulation?.toLocaleString() || 0}</div>
              <div className="text-xs text-muted-foreground">Circulation</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Booked: {formatDate(booking.created_at)}</span>
        </div>

        {booking.webhook_sent_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Submitted: {formatDate(booking.webhook_sent_at)}</span>
          </div>
        )}

        {booking.status === 'webhook_failed' && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            There was an issue submitting this booking. Our team will process it manually.
          </div>
        )}

        {/* Complete Payment CTA */}
        {isPaymentRequired && (
          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(booking);
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Complete Payment Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;