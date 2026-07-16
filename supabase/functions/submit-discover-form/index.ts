import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mirola CRM inbound webhook — workflow-specific URLs (no API key required).
// Each journey routes directly to its workflow in the Discover Magazines account.
const MIROLA_BASE = "https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/inbound-webhook";

const JOURNEY_WORKFLOW_MAP: Record<string, string> = {
  advertising: "80a8af5e-a753-432b-9fb8-474c89c42ca6", // New Advertisers
  editorial: "9b94aa32-2575-4194-aa6f-389461232da4", // Submit a Story
  discover_extra: "df76136b-f33e-4261-bb19-2fcb29c64e3a", // EXTRA Readers
  think_advertising: "5bb8c0c2-8832-4446-a33c-717e8746ee45", // THINK Readers
};

// Unknown journeys fall back to New Advertisers; its payload filter
// (form_category equals "Request an Advertising Quote") means non-matching
// payloads are logged in Mirola but not enrolled.
const DEFAULT_WORKFLOW_ID = JOURNEY_WORKFLOW_MAP.advertising;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Route to the correct Mirola workflow based on journey type
    const journeyType = (payload.journey_type ?? "") as string;
    const workflowId = JOURNEY_WORKFLOW_MAP[journeyType] ?? DEFAULT_WORKFLOW_ID;
    const webhookUrl = `${MIROLA_BASE}/${workflowId}`;
    console.log(`Routing ${journeyType || "(unknown journey)"} submission to workflow ${workflowId}`);

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
