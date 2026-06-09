import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const webhookUrl = Deno.env.get('QUOTE_BOOKING_WEBHOOK_URL');

    if (!webhookUrl) {
      console.error('QUOTE_BOOKING_WEBHOOK_URL is not configured');
      return new Response(JSON.stringify({ success: false, error: 'Webhook URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!payload?.email || typeof payload.email !== 'string') {
      console.error('Rejected webhook: missing root-level email', {
        record_type: payload?.record_type,
        journey_tag: payload?.journey_tag,
      });
      return new Response(JSON.stringify({
        success: false,
        error: 'Root-level "email" is required by the inbound webhook spec',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract destination workflow id from URL path for diagnostics
    let workflowId: string | undefined;
    try {
      const parts = new URL(webhookUrl).pathname.split('/').filter(Boolean);
      workflowId = parts[parts.length - 1];
    } catch {
      // ignore
    }

    console.log('Forwarding CRM webhook payload:', {
      record_type: payload.record_type,
      journey_tag: payload.journey_tag,
      source: payload.source,
      email: payload.email,
      workflow_id: workflowId,
    });

    // Mirola inbound-webhook spec: POST JSON, no API key required.
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
      workflow_id: workflowId,
      body: webhookResponseData,
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', { status: webhookResponse.status, response: webhookResponseData });
    }

    return new Response(JSON.stringify({
      success: webhookResponse.ok,
      webhookStatus: webhookResponse.status,
      webhookResponse: webhookResponseData,
      workflowId,
      message: webhookResponse.ok
        ? `${payload.record_type} webhook sent successfully`
        : `Webhook failed with status ${webhookResponse.status}`,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-quote-booking-webhook:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
