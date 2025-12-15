import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ghl-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ghlWebhookSecret = Deno.env.get('GHL_WEBHOOK_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook payload
    const payload = await req.json();
    console.log('GHL Webhook received:', JSON.stringify(payload, null, 2));

    // Extract contact data - GHL webhook structure
    const contact = payload.contact || payload;
    const businessName = contact.companyName || contact.business?.name;

    // Only process if this is a business (has business name filled)
    if (!businessName) {
      console.log('Skipping - no business name found');
      return new Response(JSON.stringify({ message: 'Skipped - not a business contact' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contactId = contact.id || contact.contactId;
    const locationId = contact.locationId || payload.locationId;

    if (!contactId) {
      console.error('No contact ID found in payload');
      return new Response(JSON.stringify({ error: 'No contact ID found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the category from contact.sector custom field
    const sector = contact.customFields?.find((f: any) => 
      f.key === 'sector' || f.id === 'sector' || f.fieldKey === 'sector'
    )?.value || contact.sector;

    let categoryId = null;
    if (sector) {
      // Look up category by name (case-insensitive)
      const { data: category } = await supabase
        .from('business_categories')
        .select('id')
        .ilike('name', sector)
        .maybeSingle();
      
      if (category) {
        categoryId = category.id;
        console.log(`Matched category "${sector}" to ID: ${categoryId}`);
      } else {
        console.log(`No category match found for sector: ${sector}`);
      }
    }

    // Map GHL fields to businesses table
    const businessData = {
      ghl_contact_id: contactId,
      ghl_location_id: locationId,
      name: businessName,
      email: contact.email || null,
      phone: contact.phone || null,
      website: contact.website || contact.business?.website || null,
      address_line1: contact.address1 || null,
      address_line2: contact.address2 || null,
      city: contact.city || null,
      postcode: contact.postalCode || null,
      category_id: categoryId,
      is_active: true,
      is_verified: false,
      last_synced_at: new Date().toISOString(),
    };

    console.log('Upserting business data:', JSON.stringify(businessData, null, 2));

    // Upsert based on ghl_contact_id
    const { data, error } = await supabase
      .from('businesses')
      .upsert(businessData, { 
        onConflict: 'ghl_contact_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting business:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Business upserted successfully:', data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      business_id: data?.id,
      message: 'Business synced from GHL'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing GHL webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
