import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  record_type: 'quote' | 'booking';
  record_id: string;
  pricing_model: string;
  contact_name?: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  ad_size?: string;
  duration?: string;
  selected_areas?: string[];
  bogof_paid_areas?: string[];
  bogof_free_areas?: string[];
  total_circulation?: number;
  subtotal?: number;
  final_total?: number;
  monthly_price?: number;
  volume_discount_percent?: number;
  duration_discount_percent?: number;
  status?: string;
  pricing_breakdown?: any;
  selections?: any;
}

// Map pricing_model to journey_tag for CRM routing
function getJourneyTag(pricingModel: string): string {
  switch (pricingModel) {
    case 'fixed':
      return 'Fixed Term';
    case 'bogof':
      return '3+ Repeat Package';
    case 'leafleting':
      return 'Leafleting Service';
    default:
      return 'General Inquiry';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    
    console.log('Received quote/booking webhook payload:', {
      record_type: payload.record_type,
      record_id: payload.record_id,
      pricing_model: payload.pricing_model,
      email: payload.email
    });

    // Get webhook URL and API key from environment
    const webhookUrl = Deno.env.get('QUOTE_BOOKING_WEBHOOK_URL');
    const apiKey = Deno.env.get('INBOUND_WEBHOOK_API_KEY');

    if (!webhookUrl) {
      console.error('QUOTE_BOOKING_WEBHOOK_URL is not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Webhook URL not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine journey tag based on pricing model
    const journeyTag = getJourneyTag(payload.pricing_model);
    
    // Parse contact name into first_name and last_name
    const nameParts = (payload.contact_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build the webhook payload with flattened contact fields for CRM compatibility
    const webhookPayload = {
      // Record identification
      record_type: payload.record_type,
      journey_tag: journeyTag,
      
      // Flattened contact fields at root level for CRM
      email: payload.email,
      first_name: firstName,
      last_name: lastName,
      phone: payload.phone || '',
      company: payload.company || '',
      
      // Form category for routing
      form_category: payload.record_type === 'quote' ? 'advertising_quote' : 'advertising_booking',
      
      // All data nested for reference
      data: {
        record_id: payload.record_id,
        pricing_model: payload.pricing_model,
        title: payload.title,
        ad_size: payload.ad_size,
        duration: payload.duration,
        selected_areas: payload.selected_areas || [],
        bogof_paid_areas: payload.bogof_paid_areas || [],
        bogof_free_areas: payload.bogof_free_areas || [],
        total_circulation: payload.total_circulation || 0,
        subtotal: payload.subtotal || 0,
        final_total: payload.final_total || 0,
        monthly_price: payload.monthly_price || 0,
        volume_discount_percent: payload.volume_discount_percent || 0,
        duration_discount_percent: payload.duration_discount_percent || 0,
        status: payload.status || 'draft',
        pricing_breakdown: payload.pricing_breakdown,
        selections: payload.selections
      },
      
      // Meta information
      meta: {
        source: 'advertising_calculator',
        page_url: req.headers.get('referer') || '',
        submitted_at: new Date().toISOString()
      }
    };

    console.log('Sending to webhook:', {
      url: webhookUrl,
      journey_tag: journeyTag,
      record_type: payload.record_type,
      email: payload.email
    });

    // Send to external webhook
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if configured
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
    });

    const webhookResponseText = await webhookResponse.text();
    let webhookResponseData;
    
    try {
      webhookResponseData = JSON.parse(webhookResponseText);
    } catch {
      webhookResponseData = { rawResponse: webhookResponseText };
    }

    console.log('Webhook response:', {
      status: webhookResponse.status,
      ok: webhookResponse.ok,
      data: webhookResponseData
    });

    if (!webhookResponse.ok) {
      console.error('Webhook request failed:', {
        status: webhookResponse.status,
        response: webhookResponseData
      });
    }

    return new Response(JSON.stringify({
      success: webhookResponse.ok,
      webhookStatus: webhookResponse.status,
      webhookResponse: webhookResponseData,
      journeyTag,
      message: webhookResponse.ok 
        ? `${payload.record_type} webhook sent successfully` 
        : `Webhook failed with status ${webhookResponse.status}`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-quote-booking-webhook function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
