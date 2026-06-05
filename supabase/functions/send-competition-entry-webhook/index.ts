import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const WEBHOOK_URL =
  "https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/inbound-webhook/bd116a69-213e-4fe4-a0f8-65b7dd8db823";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      competition_id,
      name,
      email,
      postcode,
      phone,
      message,
      agreed_to_terms,
    } = body ?? {};

    if (!competition_id || !name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: competition, error: compErr } = await supabase
      .from("competitions")
      .select("id, title, prize, category, end_date")
      .eq("id", competition_id)
      .maybeSingle();

    if (compErr) console.error("Competition lookup error:", compErr);

    const payload = {
      competition_id,
      competition_title: competition?.title ?? null,
      competition_prize: competition?.prize ?? null,
      competition_category: competition?.category ?? null,
      competition_end_date: competition?.end_date ?? null,
      name,
      email,
      postcode,
      phone: phone ?? null,
      message: message ?? null,
      agreed_to_terms: !!agreed_to_terms,
      submitted_at: new Date().toISOString(),
    };

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("Webhook response", res.status, text);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Webhook failed", status: res.status, body: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-competition-entry-webhook error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
