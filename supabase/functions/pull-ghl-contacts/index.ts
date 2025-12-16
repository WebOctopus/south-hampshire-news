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

    // Fetch business categories for mapping
    const { data: categories } = await supabase
      .from('business_categories')
      .select('id, name, slug');

    const categoryMap = new Map(
      categories?.map(c => [c.name.toLowerCase(), c.id]) || []
    );

    // Track results
    const results = {
      total_contacts_fetched: 0,
      businesses_processed: 0,
      skipped_no_company: 0,
      errors: [] as string[],
    };

    // Pagination loop - fetch all contacts from GHL
    const batchSize = 100;
    let startAfterId: string | null = null;
    let hasMore = true;

    console.log('Starting to fetch all contacts from GHL...');

    while (hasMore) {
      const url = `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=${batchSize}${startAfterId ? `&startAfterId=${startAfterId}` : ''}`;
      
      console.log(`Fetching batch from GHL... (startAfterId: ${startAfterId || 'none'})`);

      const ghlResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
      });

      if (!ghlResponse.ok) {
        const errorText = await ghlResponse.text();
        console.error('GHL API error:', ghlResponse.status, errorText);
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch contacts from GHL', 
          status: ghlResponse.status,
          details: errorText,
          results_so_far: results
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const ghlData = await ghlResponse.json();
      const contacts = ghlData.contacts || [];
      
      results.total_contacts_fetched += contacts.length;
      console.log(`Fetched ${contacts.length} contacts (total: ${results.total_contacts_fetched})`);

      // Process each contact in this batch
      for (const contact of contacts) {
        // Skip contacts without a company name
        if (!contact.companyName || contact.companyName.trim() === '') {
          results.skipped_no_company++;
          continue;
        }

        // Get sector and biz_type from custom fields
        const SECTOR_FIELD_ID = '6fem8mlq80ryy3lhxofe';
        
        let categoryId = null;
        let bizType = null;
        let sectorValue = null;
        
        if (contact.customFields && Array.isArray(contact.customFields)) {
          for (const field of contact.customFields) {
            const fieldId = (field.id || '').toLowerCase();
            const fieldKey = (field.key || field.fieldKey || field.name || '').toLowerCase();
            const fieldValue = field.value;
            
            // Match sector field by ID or by value pattern
            if (fieldId === SECTOR_FIELD_ID || (fieldValue && typeof fieldValue === 'string' && fieldValue.includes(':'))) {
              sectorValue = fieldValue;
            }
            
            // Match biz type field by key containing relevant terms
            if ((fieldKey.includes('biz') || fieldKey.includes('business_type')) && fieldValue) {
              bizType = fieldValue.trim();
            }
          }
          
          // Try to match sector value to category
          if (sectorValue) {
            const normalizedSector = sectorValue.toLowerCase().trim();
            categoryId = categoryMap.get(normalizedSector) || null;
            
            // If exact match fails, try partial match
            if (!categoryId) {
              for (const [name, id] of categoryMap) {
                if (name === normalizedSector || name.includes(normalizedSector) || normalizedSector.includes(name)) {
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
          biz_type: bizType,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        };

        // Upsert business using ghl_contact_id as the unique identifier
        const { error } = await supabase
          .from('businesses')
          .upsert(businessData, { 
            onConflict: 'ghl_contact_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Error upserting business ${businessData.name}:`, error);
          results.errors.push(`${businessData.name}: ${error.message}`);
        } else {
          results.businesses_processed++;
        }
      }

      // Check if we should continue fetching
      if (contacts.length < batchSize) {
        hasMore = false;
        console.log('Reached end of contacts list');
      } else {
        // Set startAfterId to the last contact's ID for next page
        startAfterId = contacts[contacts.length - 1].id;
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
