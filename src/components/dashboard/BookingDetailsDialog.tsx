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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarDays, MapPin, Users, FileText, Download, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePaymentOptions } from '@/hooks/usePaymentOptions';
import { useGoCardless } from '@/hooks/useGoCardless';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculatePaymentAmount } from '@/lib/paymentCalculations';

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
  const { toast } = useToast();
  // Initialize with the payment option selected in step 4
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(
    booking?.selections?.payment_option_id || null
  );
  const { data: paymentOptions = [] } = usePaymentOptions();
  const { createMandate } = useGoCardless();

  // Query mandate status
  const { data: mandate, refetch: refetchMandate } = useQuery({
    queryKey: ['gocardless-mandate', booking?.id],
    queryFn: async () => {
      if (!booking?.id) return null;
      const { data, error } = await supabase
        .from('gocardless_mandates')
        .select('*')
        .eq('booking_id', booking.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!booking?.id && open,
  });

  // Query payment status
  const { data: payments } = useQuery({
    queryKey: ['gocardless-payments', booking?.id],
    queryFn: async () => {
      if (!booking?.id) return [];
      const { data, error } = await supabase
        .from('gocardless_payments')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!booking?.id && open,
  });

  // Query subscription status
  const { data: subscriptions } = useQuery({
    queryKey: ['gocardless-subscriptions', booking?.id],
    queryFn: async () => {
      if (!booking?.id) return [];
      const { data, error } = await supabase
        .from('gocardless_subscriptions')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!booking?.id && open,
  });

  // Query area names for display
  const { data: pricingAreas } = useQuery({
    queryKey: ['pricing-areas-for-booking', booking?.id],
    queryFn: async () => {
      if (!booking) return [];
      
      // Get all area IDs that need to be fetched
      const allAreaIds = [
        ...(booking.selected_area_ids || []),
        ...(booking.bogof_paid_area_ids || []),
        ...(booking.bogof_free_area_ids || [])
      ].filter(Boolean);

      if (allAreaIds.length === 0) return [];

      const { data, error } = await supabase
        .from('pricing_areas')
        .select('id, name')
        .in('id', allAreaIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!booking && open,
  });

  // Query ad size details
  const { data: adSize } = useQuery({
    queryKey: ['ad-size', booking?.ad_size_id],
    queryFn: async () => {
      if (!booking?.ad_size_id) return null;
      const { data, error } = await supabase
        .from('ad_sizes')
        .select('*')
        .eq('id', booking.ad_size_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!booking?.ad_size_id && open,
  });

  // Query duration details
  const { data: duration } = useQuery({
    queryKey: ['duration', booking?.duration_id],
    queryFn: async () => {
      if (!booking?.duration_id) return null;
      const { data, error } = await supabase
        .from('pricing_durations')
        .select('*')
        .eq('id', booking.duration_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!booking?.duration_id && open,
  });

  const handleSetupPayment = async () => {
    if (!selectedPaymentOption || !booking) {
      toast({
        title: 'Please select a payment option',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createMandate.mutateAsync({
        bookingId: booking.id,
        customerEmail: booking.email,
        customerName: booking.contact_name,
        customerAddress: {
          addressLine1: booking.selections?.address || booking.contact_name || 'Address pending',
          addressLine2: booking.selections?.addressLine2 || '',
          city: booking.selections?.city || 'City pending',
          postcode: booking.selections?.postcode || 'POSTCODE',
        },
      });

      if (result.redirectUrl) {
        // Store selected payment option before redirect
        await supabase
          .from('bookings')
          .update({
            selections: {
              ...booking.selections,
              payment_option_id: selectedPaymentOption,
            },
          })
          .eq('id', booking.id);

        // Redirect to GoCardless
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      console.error('Error setting up payment:', error);
    }
  };

  const getPaymentStatus = () => {
    if (payments && payments.length > 0) {
      const latestPayment = payments[0];
      return {
        type: 'payment',
        status: latestPayment.status,
        amount: latestPayment.amount,
        chargeDate: latestPayment.charge_date,
      };
    }
    
    if (subscriptions && subscriptions.length > 0) {
      const latestSubscription = subscriptions[0];
      return {
        type: 'subscription',
        status: latestSubscription.status,
        amount: latestSubscription.amount,
      };
    }

    if (mandate) {
      return {
        type: 'mandate',
        status: mandate.status,
      };
    }

    return null;
  };

  const paymentStatus = getPaymentStatus();

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
        return '3+ Repeat Package Booking';
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
          {/* Verification Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Please Review Your Campaign Details
                </p>
                <p className="text-sm text-blue-800">
                  Take a moment to verify all the information below is correct before proceeding with payment. 
                  This ensures your advertising campaign reaches exactly where you want it to go.
                </p>
              </div>
            </div>
          </div>

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
            <CardContent className="space-y-6">
              {/* Main Campaign Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campaign Type & Package */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-base">Campaign Package</h4>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Type:</span>{' '}
                        <span className="text-muted-foreground">{getPricingModelDisplay(booking.pricing_model)}</span>
                      </p>
                      {adSize && (
                        <p className="text-sm">
                          <span className="font-medium">Ad Size:</span>{' '}
                          <span className="text-muted-foreground">{adSize.name} ({adSize.dimensions})</span>
                        </p>
                      )}
                      {duration && (
                        <p className="text-sm">
                          <span className="font-medium">Duration:</span>{' '}
                          <span className="text-muted-foreground">
                            {duration.name} 
                            {booking.duration_multiplier && booking.duration_multiplier > 1 && 
                              ` × ${booking.duration_multiplier}`
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reach & Investment */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-base">Your Reach & Investment</h4>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Total Circulation:</span>{' '}
                        <span className="text-muted-foreground font-semibold">
                          {booking.total_circulation?.toLocaleString() || 'N/A'} homes
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Campaign Cost:</span>{' '}
                        <span className="text-muted-foreground font-semibold">
                          {(() => {
                            const selectedPaymentOptionId = booking.selections?.payment_option_id;
                            const selectedOption = paymentOptions.find(opt => opt.option_type === selectedPaymentOptionId);
                            const baseTotal = booking.pricing_breakdown?.baseTotal || booking.final_total || booking.monthly_price;
                            const designFee = booking.pricing_breakdown?.designFee || 0;
                            
                            if (selectedOption && paymentOptions.length > 0) {
                              return formatPrice(calculatePaymentAmount(baseTotal, selectedOption, booking.pricing_model, paymentOptions, designFee));
                            }
                            return formatPrice(booking.final_total || booking.monthly_price);
                          })()}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Created:</span>{' '}
                        <span className="text-muted-foreground">{formatDate(booking.created_at)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Distribution Areas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-base">Distribution Areas</h4>
                </div>

                {/* Paid Locations */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-2">
                        {booking.pricing_model === 'bogof' ? 'Paid Areas' : 'Your Selected Areas'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const paidAreaIds = booking.pricing_model === 'bogof' 
                            ? booking.bogof_paid_area_ids || []
                            : booking.selected_area_ids || [];
                          
                          if (!pricingAreas || paidAreaIds.length === 0) {
                            return 'No areas selected';
                          }

                          const names = paidAreaIds
                            .map((id: string) => pricingAreas.find((a: any) => a.id === id)?.name)
                            .filter(Boolean);
                          
                          return names.join(', ') || 'Loading...';
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {booking.pricing_model === 'bogof' 
                          ? `${(booking.bogof_paid_area_ids || []).length} paid area${(booking.bogof_paid_area_ids || []).length !== 1 ? 's' : ''}`
                          : `${(booking.selected_area_ids || []).length} area${(booking.selected_area_ids || []).length !== 1 ? 's' : ''} selected`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Free Locations (only for BOGOF) */}
                {booking.pricing_model === 'bogof' && (booking.bogof_free_area_ids || []).length > 0 && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-2 text-green-900">
                          Bonus Free Areas 🎉
                        </p>
                        <p className="text-sm text-green-800">
                          {(() => {
                            const freeAreaIds = booking.bogof_free_area_ids || [];
                            
                            if (!pricingAreas || freeAreaIds.length === 0) {
                              return 'No areas selected';
                            }

                            const names = freeAreaIds
                              .map((id: string) => pricingAreas.find((a: any) => a.id === id)?.name)
                              .filter(Boolean);
                            
                            return names.join(', ') || 'Loading...';
                          })()}
                        </p>
                        <p className="text-xs text-green-700 mt-2">
                          {(booking.bogof_free_area_ids || []).length} additional area{(booking.bogof_free_area_ids || []).length !== 1 ? 's' : ''} at no extra cost
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {booking.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Additional Notes</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {booking.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentStatus ? (
                <div>
                  {/* Show Payment Status */}
                  {paymentStatus.type === 'payment' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          {paymentStatus.status === 'confirmed' || paymentStatus.status === 'paid_out' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled' ? (
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          ) : (
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                          )}
                          <div>
                            <p className="font-medium">
                              {paymentStatus.status === 'confirmed' || paymentStatus.status === 'paid_out' 
                                ? 'Payment Confirmed' 
                                : paymentStatus.status === 'failed' 
                                ? 'Payment Failed' 
                                : 'Payment Pending'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(paymentStatus.amount)}
                              {paymentStatus.chargeDate && ` • Due: ${formatDate(paymentStatus.chargeDate)}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          paymentStatus.status === 'confirmed' || paymentStatus.status === 'paid_out'
                            ? 'bg-green-100 text-green-800'
                            : paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }>
                          {paymentStatus.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      
                      {(paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">
                            <strong>Payment Issue:</strong> Your payment was not successful. 
                            Please contact our support team to resolve this issue.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentStatus.type === 'subscription' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          {paymentStatus.status === 'active' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                          )}
                          <div>
                            <p className="font-medium">
                              {paymentStatus.status === 'active' 
                                ? 'Monthly Subscription Active' 
                                : 'Subscription Pending'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(paymentStatus.amount)} per month
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          paymentStatus.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }>
                          {paymentStatus.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {paymentStatus.type === 'mandate' && !payments?.length && !subscriptions?.length && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                          <div>
                            <p className="font-medium text-blue-900">Direct Debit Setup Complete</p>
                            <p className="text-sm text-blue-700">
                              Your payment will be created shortly
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Show only the selected payment option from step 4 */}
                  <p className="text-sm text-muted-foreground">
                    Your selected payment method:
                  </p>

                  <RadioGroup value={selectedPaymentOption || ''} onValueChange={setSelectedPaymentOption}>
                    {paymentOptions
                      .filter(option => option.option_type === booking.selections?.payment_option_id)
                      .map((option) => {
                      // Use the same calculation logic as the booking summary
                      const baseTotal = booking.final_total || booking.monthly_price;
                      const pricingModel = booking.pricing_model || 'fixed';
                      const designFee = booking.pricing_breakdown?.designFee || 0;
                      const totalAmount = calculatePaymentAmount(baseTotal, option, pricingModel, paymentOptions, designFee);
                      
                      // Calculate savings for display
                      const discount = option.discount_percentage > 0 
                        ? (baseTotal * option.discount_percentage) / 100 
                        : 0;

                      return (
                        <div
                          key={option.id}
                          className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedPaymentOption === option.option_type
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedPaymentOption(option.option_type)}
                        >
                          <RadioGroupItem value={option.option_type} id={option.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={option.id} className="cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{option.display_name}</span>
                                <span className="font-bold text-lg">
                                  {formatPrice(totalAmount)}
                                  {option.option_type === 'direct_debit' && <span className="text-sm text-muted-foreground">/month</span>}
                                </span>
                              </div>
                              {option.description && (
                                <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                              )}
                              {option.discount_percentage > 0 && discount > 0 && (
                                <p className="text-sm text-green-600">
                                  Save {formatPrice(discount)} ({option.discount_percentage}% discount)
                                </p>
                              )}
                              {option.minimum_payments && option.option_type === 'monthly' && (
                                <p className="text-sm text-muted-foreground">
                                  • Minimum number of payments = {option.minimum_payments}
                                </p>
                              )}
                            </Label>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  <Button
                    onClick={handleSetupPayment}
                    disabled={!selectedPaymentOption || createMandate.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {createMandate.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Set Up Direct Debit Payment
                      </>
                    )}
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Secure Payment:</strong> Your payment will be processed securely via GoCardless Direct Debit. 
                      You'll be redirected to set up your Direct Debit mandate before payment is collected.
                    </p>
                  </div>
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