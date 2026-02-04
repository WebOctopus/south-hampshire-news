import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const defaultWebhookUrl = Deno.env.get("DISCOVER_FORMS_WEBHOOK_URL");
    const editorialWebhookUrl = Deno.env.get("EDITORIAL_WEBHOOK_URL");
    const apiKey = Deno.env.get("INBOUND_WEBHOOK_API_KEY");
    
    if (!defaultWebhookUrl) {
      console.error("DISCOVER_FORMS_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "Webhook URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!apiKey) {
      console.error("INBOUND_WEBHOOK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Webhook API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    
    // Route to different webhooks based on journey type
    const journeyType = payload.journey_type;
    let webhookUrl: string;
    
    if (journeyType === 'editorial' || journeyType === 'discover_extra') {
      webhookUrl = editorialWebhookUrl || defaultWebhookUrl;
      console.log(`Routing ${journeyType} submission to EDITORIAL_WEBHOOK_URL`);
    } else {
      webhookUrl = defaultWebhookUrl;
      console.log(`Routing ${journeyType} submission to DISCOVER_FORMS_WEBHOOK_URL`);
    }
    
    // Flatten contact fields to root level for destination webhook compatibility
    const flattenedPayload = {
      // Root level contact fields (required by destination webhook)
      email: payload.contact?.email || "",
      first_name: payload.contact?.first_name || "",
      last_name: payload.contact?.last_name || "",
      phone: payload.contact?.phone || "",
      postcode: payload.contact?.postcode || "",
      company: payload.contact?.company || "",
      // Keep the rest of the payload structure
      form_category: payload.form_category,
      journey_type: payload.journey_type,
      contact: payload.contact,
      data: payload.data,
      consents: payload.consents,
      meta: payload.meta,
    };
    
    console.log("Submitting discover form:", JSON.stringify(flattenedPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(flattenedPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook failed:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Webhook submission failed", status: response.status, details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Form submitted successfully");
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in submit-discover-form:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
