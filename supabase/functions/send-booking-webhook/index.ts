import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      bookingData, 
      step1Data, 
      step2Data, 
      step3Data,
      userId 
    } = await req.json();

    console.log('Recording booking webhook (storage only):', { bookingId: bookingData?.id });

    // Flat, CRM-spec-compliant payload (email at root). Stored for audit only;
    // the actual POST to the inbound webhook is handled by send-quote-booking-webhook.
    const pricingModelDisplay = step1Data?.pricingModel === 'fixed' ? 'Pay As You Go'
      : step1Data?.pricingModel === 'bogof' ? '3+ Subscription Package'
      : 'Leafleting Service';

    const webhookPayload = {
      record_type: 'booking',
      source: 'advertising_calculator',
      status: bookingData?.status || 'submitted',
      title: bookingData?.title || '',
      email: step3Data?.email,
      first_name: step3Data?.firstName || '',
      last_name: step3Data?.lastName || '',
      phone: step3Data?.phone || '',
      company: step3Data?.companyName || '',
      business_type: step3Data?.businessType || '',
      company_sector: step3Data?.companySector || '',
      pricing_model: step1Data?.pricingModel,
      journey_tag: pricingModelDisplay,
      subtotal: step2Data?.pricingBreakdown?.subtotal || 0,
      final_total: step2Data?.pricingBreakdown?.finalTotal || 0,
      monthly_price: bookingData?.monthly_price || 0,
      total_circulation: step2Data?.pricingBreakdown?.totalCirculation || 0,
      invoice_address_line_1: step3Data?.addressLine1 || '',
      invoice_address_line_2: step3Data?.addressLine2 || '',
      invoice_city: step3Data?.city || '',
      invoice_postcode: step3Data?.postcode || '',
      booking_id: bookingData?.id,
      user_id: userId,
      submitted_at: new Date().toISOString(),
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update booking record. The actual CRM POST is handled by send-quote-booking-webhook;
    // here we only persist the flat audit payload and mark the booking as submitted.
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        webhook_sent_at: new Date().toISOString(),
        webhook_response: {
          note: 'CRM POST handled by send-quote-booking-webhook',
          sent_at: new Date().toISOString(),
        },
        webhook_payload: webhookPayload,
        status: 'submitted',
      })
      .eq('id', bookingData.id);

    if (updateError) {
      console.error('Error updating booking:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      bookingId: bookingData.id,
      message: 'Booking saved',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-booking-webhook function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});