import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId } = await req.json();
    
    if (!bookingId) {
      throw new Error('bookingId is required');
    }

    console.log('Testing webhook simulation for booking:', bookingId);

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    console.log('Found booking:', booking.contact_name, 'Total:', booking.final_total);

    // Create test mandate
    const mandateId = 'MD_TEST_' + crypto.randomUUID().slice(0, 8);
    console.log('Creating test mandate:', mandateId);
    
    const { error: mandateError } = await supabase
      .from('gocardless_mandates')
      .insert({
        gocardless_mandate_id: mandateId,
        gocardless_customer_id: 'CU_TEST_12345',
        user_id: booking.user_id,
        booking_id: booking.id,
        status: 'pending_submission',
        scheme: 'bacs'
      });

    if (mandateError) {
      console.error('Mandate creation error:', mandateError);
      throw mandateError;
    }

    // Update booking with mandate ID
    await supabase
      .from('bookings')
      .update({ gocardless_mandate_id: mandateId })
      .eq('id', booking.id);

    // Create test payment
    const paymentId = 'PM_TEST_' + crypto.randomUUID().slice(0, 8);
    console.log('Creating test payment:', paymentId);
    
    const { error: paymentError } = await supabase
      .from('gocardless_payments')
      .insert({
        gocardless_payment_id: paymentId,
        gocardless_mandate_id: mandateId,
        booking_id: booking.id,
        amount: booking.final_total,
        currency: 'GBP',
        status: 'pending_submission',
        charge_date: new Date().toISOString().split('T')[0]
      });

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw paymentError;
    }

    // First webhook: Activate the mandate
    console.log('Simulating mandate activation webhook...');
    const mandateWebhook = {
      events: [{
        id: 'EV_MANDATE_' + crypto.randomUUID().slice(0, 8),
        created_at: new Date().toISOString(),
        resource_type: 'mandates',
        action: 'active',
        links: {
          mandate: mandateId
        }
      }]
    };

    const { data: mandateResult, error: mandateWebhookError } = await supabase.functions.invoke(
      'gocardless-webhook',
      { body: mandateWebhook }
    );

    if (mandateWebhookError) {
      console.error('Mandate webhook error:', mandateWebhookError);
    } else {
      console.log('Mandate webhook result:', mandateResult);
    }

    // Second webhook: Confirm the payment
    console.log('Simulating payment confirmation webhook...');
    const paymentWebhook = {
      events: [{
        id: 'EV_PAYMENT_' + crypto.randomUUID().slice(0, 8),
        created_at: new Date().toISOString(),
        resource_type: 'payments',
        action: 'confirmed',
        links: {
          payment: paymentId
        }
      }]
    };

    const { data: paymentResult, error: paymentWebhookError } = await supabase.functions.invoke(
      'gocardless-webhook',
      { body: paymentWebhook }
    );

    if (paymentWebhookError) {
      console.error('Payment webhook error:', paymentWebhookError);
      throw paymentWebhookError;
    }

    console.log('Payment webhook result:', paymentResult);

    // Check the final state
    const { data: updatedBooking } = await supabase
      .from('bookings')
      .select('payment_status, status, invoice_generated')
      .eq('id', booking.id)
      .single();

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test webhook simulation completed',
        testData: {
          bookingId: booking.id,
          mandateId,
          paymentId,
          updatedBooking,
          invoice: invoice ? {
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            status: invoice.status,
            amount: invoice.amount,
            created_at: invoice.created_at
          } : null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test webhook simulation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
