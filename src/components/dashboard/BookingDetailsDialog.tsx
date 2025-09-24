import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, MapPin, Users, FileText, Download } from 'lucide-react';

interface BookingDetailsDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  booking,
  open,
  onOpenChange,
}) => {
  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingModelDisplay = (model: string) => {
    switch (model) {
      case 'fixed':
        return 'Fixed Placement';
      case 'bogof':
        return 'Buy One Get One Free';
      case 'leafleting':
        return 'Leaflet Distribution';
      default:
        return model;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const legalDocuments = [
    {
      id: 1,
      name: 'Terms & Conditions',
      description: 'Standard terms and conditions for advertising services',
      type: 'PDF',
      size: '245 KB'
    },
    {
      id: 2,
      name: 'Service Agreement',
      description: 'Detailed service agreement for your campaign',
      type: 'PDF',
      size: '189 KB'
    },
    {
      id: 3,
      name: 'Data Protection Notice',
      description: 'Information about how we handle your personal data',
      type: 'PDF',
      size: '156 KB'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {booking.title || 'Booking Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Campaign Overview
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Circulation</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.total_circulation?.toLocaleString() || 'N/A'} homes
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Campaign Type</p>
                    <p className="text-sm text-muted-foreground">
                      {getPricingModelDisplay(booking.pricing_model)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">£</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Cost</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(booking.final_total || booking.monthly_price)}
                    </p>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {booking.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Contact Name</p>
                  <p className="text-sm text-muted-foreground">{booking.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{booking.email}</p>
                </div>
                {booking.phone && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{booking.phone}</p>
                  </div>
                )}
                {booking.company && (
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{booking.company}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          {booking.pricing_breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm font-medium">
                      {formatPrice(booking.subtotal || booking.monthly_price)}
                    </span>
                  </div>
                  {booking.duration_discount_percent && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Duration Discount ({booking.duration_discount_percent}%)</span>
                      <span className="text-sm">
                        -{formatPrice((booking.subtotal * booking.duration_discount_percent) / 100)}
                      </span>
                    </div>
                  )}
                  {booking.volume_discount_percent && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Volume Discount ({booking.volume_discount_percent}%)</span>
                      <span className="text-sm">
                        -{formatPrice((booking.subtotal * booking.volume_discount_percent) / 100)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(booking.final_total || booking.monthly_price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legal Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Legal Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download your legal documents related to this booking. These documents contain important 
                information about your service agreement, terms and conditions, and data protection.
              </p>
              
              <div className="space-y-3">
                {legalDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{document.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {document.description} • {document.type} • {document.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Need help?</strong> If you have questions about any of these documents, 
                  please contact our support team who will be happy to assist you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};