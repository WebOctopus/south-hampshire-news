import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId, amount, customerEmail, successUrl, cancelUrl, pricingModel } = await req.json();

    if (!bookingId || !amount || !customerEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields: bookingId, amount, customerEmail' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, contact_name, final_total, pricing_model')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Amount in pence (Stripe uses smallest currency unit)
    const amountInPence = Math.round(amount * 100);

    // Add 20% VAT
    const amountWithVat = Math.round(amountInPence * 1.2);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Advertising Campaign - ${pricingModel === 'leafleting' ? 'Leafleting' : 'Fixed Term'}`,
              description: `Booking for ${booking.contact_name}`,
            },
            unit_amount: amountWithVat,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId,
        amount_ex_vat: amount.toString(),
      },
      success_url: successUrl || `${req.headers.get('origin')}/payment-setup?booking_id=${bookingId}&stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard`,
    });

    // Update booking to reflect payment initiated
    await supabase.from('bookings').update({
      payment_status: 'checkout_initiated',
    }).eq('id', bookingId);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating Stripe checkout:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
