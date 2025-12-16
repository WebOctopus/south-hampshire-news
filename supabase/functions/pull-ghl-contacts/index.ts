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
    const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GHL_API_KEY) {
      console.error('GHL_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'GHL_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!GHL_LOCATION_ID) {
      console.error('GHL_LOCATION_ID is not configured');
      return new Response(JSON.stringify({ error: 'GHL_LOCATION_ID is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse optional limit parameter
    let limit = 100;
    try {
      const body = await req.json();
      if (body.limit) {
        limit = Math.min(body.limit, 500); // Cap at 500
      }
    } catch {
      // No body or invalid JSON, use default limit
    }

    console.log(`Fetching contacts from GHL with limit: ${limit}`);

    // Fetch contacts from GHL API
    const ghlResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text();
      console.error('GHL API error:', ghlResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch contacts from GHL', 
        status: ghlResponse.status,
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ghlData = await ghlResponse.json();
    const contacts = ghlData.contacts || [];
    
    console.log(`Fetched ${contacts.length} contacts from GHL`);

    // Fetch business categories for mapping
    const { data: categories } = await supabase
      .from('business_categories')
      .select('id, name, slug');

    const categoryMap = new Map(
      categories?.map(c => [c.name.toLowerCase(), c.id]) || []
    );

    // Track results
    const results = {
      total_contacts: contacts.length,
      businesses_created: 0,
      businesses_updated: 0,
      skipped_no_company: 0,
      errors: [] as string[],
    };

    // Process each contact
    for (const contact of contacts) {
      // Skip contacts without a company name
      if (!contact.companyName || contact.companyName.trim() === '') {
        results.skipped_no_company++;
        continue;
      }

      // Get sector from custom fields
      let categoryId = null;
      if (contact.customFields) {
        const sectorField = contact.customFields.find(
          (f: any) => f.key === 'sector' || f.id === 'sector'
        );
        if (sectorField?.value) {
          const sectorValue = sectorField.value.toLowerCase();
          categoryId = categoryMap.get(sectorValue) || null;
          
          // If exact match fails, try partial match
          if (!categoryId) {
            for (const [name, id] of categoryMap) {
              if (name.includes(sectorValue) || sectorValue.includes(name)) {
                categoryId = id;
                break;
              }
            }
          }
        }
      }

      // Prepare business data
      const businessData = {
        ghl_contact_id: contact.id,
        ghl_location_id: GHL_LOCATION_ID,
        name: contact.companyName.trim(),
        email: contact.email || null,
        phone: contact.phone || null,
        address_line1: contact.address1 || null,
        city: contact.city || null,
        postcode: contact.postalCode || null,
        website: contact.website || null,
        category_id: categoryId,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      console.log(`Processing business: ${businessData.name} (GHL ID: ${contact.id})`);

      // Upsert business using ghl_contact_id as the unique identifier
      const { data, error } = await supabase
        .from('businesses')
        .upsert(businessData, { 
          onConflict: 'ghl_contact_id',
          ignoreDuplicates: false 
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Error upserting business ${businessData.name}:`, error);
        results.errors.push(`${businessData.name}: ${error.message}`);
      } else {
        // Check if this was an insert or update by seeing if we got a new record
        // For simplicity, we'll count all successful operations
        results.businesses_created++;
        console.log(`Successfully upserted business: ${businessData.name}`);
      }
    }

    console.log('Pull completed:', results);

    return new Response(JSON.stringify({
      success: true,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pull-ghl-contacts:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
