import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-signature',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WEBHOOK_SECRET = Deno.env.get('GOCARDLESS_WEBHOOK_SECRET');
    const signature = req.headers.get('Webhook-Signature');
    
    const body = await req.text();
    
    // Verify webhook signature
    if (signature && WEBHOOK_SECRET) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(body)
      );
      
      const computedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (signature !== computedSignature) {
        console.error('Invalid webhook signature');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = JSON.parse(body);
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2));

    const events = webhookData.events || [];

    for (const event of events) {
      console.log(`Processing event: ${event.resource_type} - ${event.action}`);

      switch (event.resource_type) {
        case 'mandates':
          await handleMandateEvent(supabase, event);
          break;
        case 'payments':
          await handlePaymentEvent(supabase, event);
          break;
        case 'subscriptions':
          await handleSubscriptionEvent(supabase, event);
          break;
        default:
          console.log(`Unhandled resource type: ${event.resource_type}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in gocardless-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleMandateEvent(supabase: any, event: any) {
  const mandateId = event.links?.mandate;
  const status = event.action;

  console.log(`Mandate ${mandateId} status: ${status}`);

  // Map GoCardless actions to our status field
  let dbStatus = status;
  if (status === 'created') dbStatus = 'pending_submission';
  if (status === 'submitted') dbStatus = 'submitted';
  if (status === 'active') dbStatus = 'active';
  if (status === 'failed' || status === 'cancelled') dbStatus = status;

  await supabase
    .from('gocardless_mandates')
    .update({ status: dbStatus })
    .eq('gocardless_mandate_id', mandateId);

  // Update booking payment status when mandate is active
  if (status === 'active') {
    const { data: mandate } = await supabase
      .from('gocardless_mandates')
      .select('booking_id')
      .eq('gocardless_mandate_id', mandateId)
      .single();

    if (mandate?.booking_id) {
      await supabase
        .from('bookings')
        .update({ payment_status: 'mandate_active' })
        .eq('id', mandate.booking_id);
      
      console.log('Mandate active for booking:', mandate.booking_id);
    }
  }
}

async function handlePaymentEvent(supabase: any, event: any) {
  const paymentId = event.links?.payment;
  const status = event.action;

  console.log(`Payment ${paymentId} status: ${status}`);

  // Map GoCardless actions to our status field
  let dbStatus = status;
  if (status === 'created') dbStatus = 'pending_submission';
  if (status === 'confirmed') dbStatus = 'confirmed';
  if (status === 'paid_out') dbStatus = 'paid_out';
  if (status === 'failed' || status === 'cancelled') dbStatus = status;

  await supabase
    .from('gocardless_payments')
    .update({ status: dbStatus })
    .eq('gocardless_payment_id', paymentId);

  // Update booking status when payment is confirmed
  if (status === 'confirmed' || status === 'paid_out') {
    const { data: payment } = await supabase
      .from('gocardless_payments')
      .select('booking_id, gocardless_mandate_id')
      .eq('gocardless_payment_id', paymentId)
      .single();

    if (payment?.booking_id) {
      await supabase
        .from('bookings')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed' 
        })
        .eq('id', payment.booking_id);
      
      // Generate invoice for one-off payment
      console.log('Payment confirmed, generating invoice for booking:', payment.booking_id);
      try {
        await supabase.functions.invoke('generate-invoice', {
          body: {
            bookingId: payment.booking_id,
            paymentId: paymentId,
            mandateId: payment.gocardless_mandate_id,
            type: 'payment'
          }
        });
      } catch (error) {
        console.error('Failed to generate invoice:', error);
      }
    }
  }
}

async function handleSubscriptionEvent(supabase: any, event: any) {
  const subscriptionId = event.links?.subscription;
  const status = event.action;

  console.log(`Subscription ${subscriptionId} status: ${status}`);

  // Map GoCardless actions to our status field
  let dbStatus = status;
  if (status === 'created') dbStatus = 'pending_customer_approval';
  if (status === 'customer_approval_granted') dbStatus = 'customer_approval_granted';
  if (status === 'active') dbStatus = 'active';
  if (status === 'cancelled' || status === 'finished') dbStatus = status;

  await supabase
    .from('gocardless_subscriptions')
    .update({ status: dbStatus })
    .eq('gocardless_subscription_id', subscriptionId);

  // Update booking status when subscription is active
  if (status === 'active') {
    const { data: subscription } = await supabase
      .from('gocardless_subscriptions')
      .select('booking_id, gocardless_mandate_id')
      .eq('gocardless_subscription_id', subscriptionId)
      .single();

    if (subscription?.booking_id) {
      await supabase
        .from('bookings')
        .update({ 
          payment_status: 'subscription_active',
          status: 'confirmed'
        })
        .eq('id', subscription.booking_id);
      
      // Generate invoice for subscription
      console.log('Subscription active, generating invoice for booking:', subscription.booking_id);
      try {
        await supabase.functions.invoke('generate-invoice', {
          body: {
            bookingId: subscription.booking_id,
            subscriptionId: subscriptionId,
            mandateId: subscription.gocardless_mandate_id,
            type: 'subscription'
          }
        });
      } catch (error) {
        console.error('Failed to generate invoice:', error);
      }
    }
  }
}
