import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        return new Response('Missing stripe-signature header', { status: 400 });
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // No webhook secret configured — parse directly (development only)
      event = JSON.parse(body);
      console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
    }

    console.log(`Stripe webhook received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.error('No booking_id in session metadata');
        return new Response('OK', { status: 200 });
      }

      console.log(`Payment completed for booking ${bookingId}`);

      // Update booking status
      const { error } = await supabase.from('bookings').update({
        payment_status: 'paid',
        status: 'confirmed',
      }).eq('id', bookingId);

      if (error) {
        console.error('Error updating booking:', error);
      } else {
        console.log(`Booking ${bookingId} marked as paid`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
