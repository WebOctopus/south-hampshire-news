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

    console.log('Sending booking webhook:', { bookingData, step1Data, step2Data, step3Data });

    // Create comprehensive webhook payload
    const webhookPayload = {
      // User/Contact Information (Step 3)
      contact: {
        firstName: step3Data.firstName,
        lastName: step3Data.lastName,
        fullName: `${step3Data.firstName} ${step3Data.lastName}`,
        email: step3Data.email,
        phone: step3Data.phone,
        businessType: step3Data.businessType,
        companyName: step3Data.companyName,
        companySector: step3Data.companySector,
        invoiceAddress: {
          postcode: step3Data.postcode || '',
          addressLine1: step3Data.addressLine1 || '',
          addressLine2: step3Data.addressLine2 || '',
          city: step3Data.city || '',
        }
      },
      
      // Pricing Model Selection (Step 1)
      campaign: {
        pricingModel: step1Data.pricingModel,
        pricingModelDisplay: step1Data.pricingModel === 'fixed' ? 'Pay As You Go' : 
                            step1Data.pricingModel === 'bogof' ? '3+ Subscription Package' : 
                            'Leafleting Service'
      },
      
      // Campaign Configuration (Step 2)
      configuration: {
        selectedAreas: step2Data.selectedAreas || [],
        bogofPaidAreas: step2Data.bogofPaidAreas || [],
        bogofFreeAreas: step2Data.bogofFreeAreas || [],
        selectedAdSize: step2Data.selectedAdSize,
        selectedDuration: step2Data.selectedDuration,
        selectedMonths: step2Data.selectedMonths || {},
        totalCirculation: step2Data.pricingBreakdown?.totalCirculation || 0
      },
      
      // Pricing Information
      pricing: {
        subtotal: step2Data.pricingBreakdown?.subtotal || 0,
        finalTotal: step2Data.pricingBreakdown?.finalTotal || 0,
        monthlyPrice: bookingData.monthly_price || 0,
        durationMultiplier: step2Data.pricingBreakdown?.durationMultiplier || 1,
        volumeDiscountPercent: step2Data.pricingBreakdown?.volumeDiscountPercent || 0,
        durationDiscountPercent: step2Data.pricingBreakdown?.durationDiscountPercent || 0,
        breakdown: step2Data.pricingBreakdown
      },
      
      // Booking Information
      booking: {
        id: bookingData.id,
        status: bookingData.status,
        title: bookingData.title,
        userId: userId,
        createdAt: new Date().toISOString()
      },
      
      // Source Information
      source: {
        platform: 'Local Life Magazine Calculator',
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent') || '',
        referrer: req.headers.get('referer') || ''
      }
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Send webhook to inbound webhook endpoint (configured via secret)
    const webhookUrl = Deno.env.get('QUOTE_BOOKING_WEBHOOK_URL');
    const apiKey = Deno.env.get('INBOUND_WEBHOOK_API_KEY');

    if (!webhookUrl) {
      console.error('QUOTE_BOOKING_WEBHOOK_URL is not configured');
      return new Response(JSON.stringify({ success: false, error: 'Webhook URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending booking to inbound webhook:', webhookUrl);

    const outboundHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) outboundHeaders['x-api-key'] = apiKey;

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: outboundHeaders,
      body: JSON.stringify(webhookPayload),
    });

    const webhookResponseText = await webhookResponse.text();
    let webhookResponseData;
    
    try {
      webhookResponseData = JSON.parse(webhookResponseText);
    } catch {
      webhookResponseData = { rawResponse: webhookResponseText };
    }

    console.log('Inbound webhook response:', {
      status: webhookResponse.status,
      data: webhookResponseData
    });

    // Update booking record with webhook response
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        webhook_sent_at: new Date().toISOString(),
        webhook_response: {
          status: webhookResponse.status,
          response: webhookResponseData,
          sent_at: new Date().toISOString()
        },
        webhook_payload: webhookPayload,
        status: webhookResponse.ok ? 'submitted' : 'webhook_failed'
      })
      .eq('id', bookingData.id);

    if (updateError) {
      console.error('Error updating booking:', updateError);
    }

    return new Response(JSON.stringify({
      success: webhookResponse.ok,
      webhookStatus: webhookResponse.status,
      webhookResponse: webhookResponseData,
      bookingId: bookingData.id,
      message: webhookResponse.ok ? 'Booking submitted successfully' : 'Webhook failed but booking saved'
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