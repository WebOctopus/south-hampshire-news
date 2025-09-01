import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, DollarSign, Package, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/pricingCalculator';

interface BookingCardProps {
  booking: {
    id: string;
    title: string;
    pricing_model: string;
    status: string;
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
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onDelete, isDeleting }) => {
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg leading-tight">{booking.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
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
              onClick={() => onDelete(booking)}
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
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatPrice(booking.final_total)}</div>
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
      </CardContent>
    </Card>
  );
};

export default BookingCard;