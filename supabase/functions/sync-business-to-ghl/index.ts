import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ghlApiKey = Deno.env.get('GHL_API_KEY')!;
    const ghlLocationId = Deno.env.get('GHL_LOCATION_ID')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { business_id, ghl_contact_id, ghl_location_id } = await req.json();

    console.log('Sync to GHL triggered for business:', business_id);

    if (!ghl_contact_id) {
      console.log('No GHL contact ID - skipping sync');
      return new Response(JSON.stringify({ message: 'No GHL contact ID' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Map website fields to GHL contact format
    const ghlContactData: Record<string, any> = {
      companyName: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website,
      address1: business.address_line1,
      city: business.city,
      postalCode: business.postcode,
    };

    // Add sector custom field if category exists
    if (business.business_categories?.name) {
      ghlContactData.customFields = [
        {
          key: 'sector',
          value: business.business_categories.name
        }
      ];
    }

    console.log('Updating GHL contact:', ghl_contact_id, JSON.stringify(ghlContactData, null, 2));

    // Call GHL API to update contact
    const locationToUse = ghl_location_id || ghlLocationId;
    const ghlResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/${ghl_contact_id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(ghlContactData),
      }
    );

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text();
      console.error('GHL API error:', ghlResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'GHL API error', 
        status: ghlResponse.status,
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ghlResult = await ghlResponse.json();
    console.log('GHL contact updated successfully:', ghlResult);

    // Update last_synced_at to prevent loop
    await supabase
      .from('businesses')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', business_id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Business synced to GHL',
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
