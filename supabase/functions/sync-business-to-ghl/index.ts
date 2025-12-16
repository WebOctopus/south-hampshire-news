import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');

    if (!ghlWebhookUrl) {
      console.error('GHL_WEBHOOK_URL not configured');
      return new Response(JSON.stringify({ error: 'GHL_WEBHOOK_URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { business_id, ghl_contact_id, ghl_location_id } = await req.json();

    console.log('Sync to GHL triggered for business:', business_id);

    // Fetch the full business data
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select(`
        *,
        business_categories (name)
      `)
      .eq('id', business_id)
      .single();

    if (fetchError || !business) {
      console.error('Error fetching business:', fetchError);
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build payload using GHL contact field names
    const webhookPayload: Record<string, any> = {
      companyName: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website,
      address1: business.address_line1,
      city: business.city,
      postalCode: business.postcode,
      // Include metadata for tracking
      customField: {
        discover_business_id: business.id,
        sector: business.business_categories?.name || null,
        description: business.description,
        is_verified: business.is_verified,
        featured: business.featured,
      }
    };

    // If there's an existing GHL contact, include it for updates
    if (ghl_contact_id) {
      webhookPayload.ghl_contact_id = ghl_contact_id;
    }

    console.log('Sending to GHL webhook:', JSON.stringify(webhookPayload, null, 2));

    // Send to GHL webhook
    const ghlResponse = await fetch(ghlWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await ghlResponse.text();
    console.log('GHL webhook response:', ghlResponse.status, responseText);

    if (!ghlResponse.ok) {
      console.error('GHL webhook error:', ghlResponse.status, responseText);
      return new Response(JSON.stringify({ 
        error: 'GHL webhook error', 
        status: ghlResponse.status,
        details: responseText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update last_synced_at to prevent loop
    await supabase
      .from('businesses')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', business_id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Business synced to GHL webhook',
      business_id,
      ghl_contact_id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error syncing to GHL:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
