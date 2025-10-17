import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  bookingId: string;
  mandateId: string;
  paymentType: 'one-off' | 'subscription';
  amount: number;
  paymentOptionId: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { bookingId, mandateId, paymentType, amount, paymentOptionId }: CreatePaymentRequest = await req.json();

    const GOCARDLESS_API_KEY = Deno.env.get('GOCARDLESS_API_KEY');
    if (!GOCARDLESS_API_KEY) throw new Error('Missing GoCardless API key');
    const isSandbox = GOCARDLESS_API_KEY.startsWith('sandbox_');
    const GOCARDLESS_API_URL = isSandbox
      ? 'https://api-sandbox.gocardless.com'
      : 'https://api.gocardless.com';

    console.log(`Creating ${paymentType} payment for booking:`, bookingId, 'sandbox:', isSandbox);
    // Get payment option details
    const { data: paymentOption } = await supabase
      .from('payment_options')
      .select('*')
      .eq('id', paymentOptionId)
      .single();

    if (!paymentOption) {
      throw new Error('Payment option not found');
    }

    if (paymentType === 'subscription') {
      // Create subscription for monthly payments
      const subscriptionResponse = await fetch(`${GOCARDLESS_API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptions: {
            amount: Math.round(amount * 100), // Convert to pence
            currency: 'GBP',
            name: `Advertising Campaign - Booking ${bookingId.substring(0, 8)}`,
            interval_unit: 'monthly',
            count: paymentOption.minimum_payments || 6,
            links: {
              mandate: mandateId,
            },
            metadata: {
              booking_id: bookingId,
              user_id: user.id,
            }
          }
        })
      });

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.text();
        console.error('GoCardless subscription creation error:', error);
        throw new Error(`Failed to create subscription: ${error}`);
      }

      const subscriptionData = await subscriptionResponse.json();
      const subscription = subscriptionData.subscriptions;

      console.log('Created subscription:', subscription.id);

      // Save subscription to database
      await supabase.from('gocardless_subscriptions').insert({
        booking_id: bookingId,
        gocardless_subscription_id: subscription.id,
        gocardless_mandate_id: mandateId,
        amount: amount,
        currency: 'GBP',
        interval_unit: 'monthly',
        status: subscription.status,
        start_date: subscription.start_date,
      });

      // Update booking
      await supabase.from('bookings').update({
        payment_status: 'subscription_pending',
      }).eq('id', bookingId);

      return new Response(
        JSON.stringify({
          success: true,
          subscriptionId: subscription.id,
          status: subscription.status,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else {
      // Create one-off payment
      const today = new Date();
      const chargeDate = new Date(today.setDate(today.getDate() + 3)); // 3 business days from now
      const chargeDateStr = chargeDate.toISOString().split('T')[0];

      const paymentResponse = await fetch(`${GOCARDLESS_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payments: {
            amount: Math.round(amount * 100), // Convert to pence
            currency: 'GBP',
            charge_date: chargeDateStr,
            description: `Advertising Campaign - Booking ${bookingId.substring(0, 8)}`,
            links: {
              mandate: mandateId,
            },
            metadata: {
              booking_id: bookingId,
              user_id: user.id,
            }
          }
        })
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.text();
        console.error('GoCardless payment creation error:', error);
        throw new Error(`Failed to create payment: ${error}`);
      }

      const paymentData = await paymentResponse.json();
      const payment = paymentData.payments;

      console.log('Created payment:', payment.id);

      // Save payment to database
      await supabase.from('gocardless_payments').insert({
        booking_id: bookingId,
        gocardless_payment_id: payment.id,
        gocardless_mandate_id: mandateId,
        amount: amount,
        currency: 'GBP',
        status: payment.status,
        charge_date: payment.charge_date,
      });

      // Update booking
      await supabase.from('bookings').update({
        payment_status: 'payment_pending',
      }).eq('id', bookingId);

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: payment.id,
          status: payment.status,
          chargeDate: payment.charge_date,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('Error in create-gocardless-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
