import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import { VAT_RATE, withVat } from "../_shared/vat.ts";
import { isSubscriptionModel } from "../_shared/finalTotal.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Service-role client for writes that must bypass RLS (no INSERT policies
    // exist for these tables — using anon/auth client silently fails).
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    // Always fetch the booking server-side so we can validate ownership and,
    // for subscriptions, derive the charge amount from monthly_price (do NOT
    // trust the client-sent amount).
    const { data: bookingRow, error: bookingFetchError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, monthly_price, final_total, pricing_model')
      .eq('id', bookingId)
      .single();

    if (bookingFetchError || !bookingRow) {
      console.error('Failed to load booking for payment:', bookingFetchError);
      throw new Error('Booking not found');
    }
    if (bookingRow.user_id !== user.id) {
      throw new Error('Unauthorized: booking does not belong to user');
    }

    if (paymentType === 'subscription') {
      // Guard: Monthly Direct Debit is only valid for true subscription
      // pricing models. Per-issue models (e.g. 'fixed' Pay-As-You-Go) would
      // be charged monthly_price × 6 regardless of issue count — wrong.
      if (!isSubscriptionModel(bookingRow.pricing_model)) {
        console.error(
          `Subscription rejected: pricing_model='${bookingRow.pricing_model}' is not a subscription model`,
        );
        return new Response(
          JSON.stringify({
            error: 'Monthly subscription is not available for this booking type',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        );
      }
      // Server-derived NET amount. monthly_price already covers all areas
      // for the monthly DD; ignore the client-supplied amount.
      const netAmount = Number(bookingRow.monthly_price) || 0;
      if (netAmount <= 0) {
        throw new Error('Booking has no valid monthly_price for subscription');
      }
      // Apply VAT at the payment layer — bookings.monthly_price is ex-VAT.
      const subscriptionAmount = withVat(netAmount);
      console.log(`Subscription charge: net £${netAmount.toFixed(2)} + VAT @ ${VAT_RATE * 100}% = gross £${subscriptionAmount.toFixed(2)}`);

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
            amount: Math.round(subscriptionAmount * 100), // Convert to pence
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

      // Save subscription to database (service role — no INSERT RLS policy exists)
      const { error: subInsertError } = await supabaseAdmin
        .from('gocardless_subscriptions')
        .insert({
          booking_id: bookingId,
          gocardless_subscription_id: subscription.id,
          gocardless_mandate_id: mandateId,
          amount: subscriptionAmount, // gross (inc VAT) — what GoCardless debits
          currency: 'GBP',
          interval_unit: 'monthly',
          status: subscription.status,
          start_date: subscription.start_date,
        });
      if (subInsertError) {
        console.error('Failed to insert gocardless_subscriptions:', subInsertError);
        throw new Error(`Failed to save subscription: ${subInsertError.message}`);
      }

      // Update booking
      const { error: bookingUpdateError } = await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'subscription_pending' })
        .eq('id', bookingId);
      if (bookingUpdateError) {
        console.error('Failed to update booking payment_status:', bookingUpdateError);
        throw new Error(`Failed to update booking: ${bookingUpdateError.message}`);
      }

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

      // Server-derived NET amount (ignore client-supplied amount).
      const netOneOff = Number(bookingRow.final_total) || 0;
      if (netOneOff <= 0) {
        throw new Error('Booking has no valid final_total for one-off payment');
      }
      const grossOneOff = withVat(netOneOff);
      console.log(`One-off charge: net £${netOneOff.toFixed(2)} + VAT @ ${VAT_RATE * 100}% = gross £${grossOneOff.toFixed(2)}`);

      const paymentResponse = await fetch(`${GOCARDLESS_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payments: {
            amount: Math.round(grossOneOff * 100), // gross (inc VAT), in pence
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

      // Save payment to database (service role — no INSERT RLS policy exists)
      const { error: payInsertError } = await supabaseAdmin
        .from('gocardless_payments')
        .insert({
          booking_id: bookingId,
          gocardless_payment_id: payment.id,
          gocardless_mandate_id: mandateId,
          amount: grossOneOff, // gross (inc VAT) — what GoCardless debits
          currency: 'GBP',
          status: payment.status,
          charge_date: payment.charge_date,
        });
      if (payInsertError) {
        console.error('Failed to insert gocardless_payments:', payInsertError);
        throw new Error(`Failed to save payment: ${payInsertError.message}`);
      }

      // Update booking
      const { error: bookingUpdateError } = await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'payment_pending' })
        .eq('id', bookingId);
      if (bookingUpdateError) {
        console.error('Failed to update booking payment_status:', bookingUpdateError);
        throw new Error(`Failed to update booking: ${bookingUpdateError.message}`);
      }

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
