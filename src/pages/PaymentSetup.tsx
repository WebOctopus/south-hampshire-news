import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const PaymentSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Setting up your payment...');

  useEffect(() => {
    const setupPayment = async () => {
      const bookingId = searchParams.get('booking_id');
      const redirectFlowId = searchParams.get('redirect_flow_id');

      if (!bookingId) {
        setStatus('error');
        setMessage('No booking ID found');
        return;
      }

      try {
        // Get booking details
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bookingError || !booking) {
          throw new Error('Booking not found');
        }

        // Get payment option separately
        const paymentOptionData = booking.selections as any;
        const paymentOptionId = paymentOptionData?.payment_option_id;

        if (!paymentOptionId) {
          throw new Error('Payment option not found');
        }

        const { data: paymentOption, error: paymentOptionError } = await supabase
          .from('payment_options')
          .select('*')
          .eq('id', paymentOptionId)
          .single();

        if (paymentOptionError || !paymentOption) {
          throw new Error('Payment option not found');
        }

        // If we have a redirect flow ID, we need to complete it first
        if (redirectFlowId) {
          // Call edge function to complete redirect flow
          const { data: redirectData, error: redirectError } = await supabase.functions.invoke('complete-gocardless-redirect', {
            body: {
              redirectFlowId,
              bookingId,
            },
          });

          if (redirectError || !redirectData) {
            throw new Error('Failed to complete redirect flow');
          }

          const mandateId = redirectData.mandateId;
          const customerId = redirectData.customerId;

          // Save mandate to database
          await supabase.from('gocardless_mandates').insert({
            user_id: booking.user_id,
            booking_id: bookingId,
            gocardless_mandate_id: mandateId,
            gocardless_customer_id: customerId,
            status: 'pending_submission',
            scheme: 'bacs',
          });

          // Update booking
          await supabase.from('bookings').update({
            gocardless_mandate_id: mandateId,
            payment_status: 'mandate_created',
          }).eq('id', bookingId);

          // Now create the payment/subscription
          const isSubscription = paymentOption.option_type === 'direct_debit';
          
          const { error: paymentError } = await supabase.functions.invoke('create-gocardless-payment', {
            body: {
              bookingId,
              mandateId,
              paymentType: isSubscription ? 'subscription' : 'one-off',
              amount: booking.final_total,
              paymentOptionId: paymentOption.id,
            },
          });

          if (paymentError) throw paymentError;
        }

        setStatus('success');
        setMessage('Payment setup complete! Redirecting to your dashboard...');
        
        toast({
          title: 'Payment Setup Complete',
          description: 'Your Direct Debit has been set up successfully.',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error: any) {
        console.error('Error setting up payment:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to set up payment');
        
        toast({
          title: 'Payment Setup Failed',
          description: 'There was an error setting up your payment. Please contact support.',
          variant: 'destructive',
        });
      }
    };

    setupPayment();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Payment Setup</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we set up your payment...'}
            {status === 'success' && 'Your payment has been set up successfully!'}
            {status === 'error' && 'There was an error setting up your payment'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
          {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
          
          <p className="text-center text-muted-foreground">{message}</p>
          
          {status === 'error' && (
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSetup;
