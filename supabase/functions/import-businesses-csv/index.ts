import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  "Company name"?: string;
  "Street Address"?: string;
  "Street Address 2"?: string;
  "Street Address 3"?: string;
  "Postal Code"?: string;
  "City"?: string;
  "Company Domain Name"?: string;
  "Phone Number"?: string;
  "Company Email"?: string;
  "Sector"?: string;
  "Biz Type"?: string;
  "14 Editions - Local"?: string;
}

interface ImportRequest {
  rows: CSVRow[];
  batchIndex: number;
  totalBatches: number;
  replaceAll: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { rows, batchIndex, totalBatches, replaceAll }: ImportRequest = await req.json();

    // On first batch and replaceAll mode, clear existing data
    if (batchIndex === 0 && replaceAll) {
      console.log('Clearing existing businesses for replace-all import...');
      const { error: deleteError } = await supabase
        .from('businesses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (deleteError) {
        console.error('Error clearing businesses:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to clear existing businesses', details: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Existing businesses cleared');
    }

    // Process and map rows
    const mappedRows = [];
    const errors: string[] = [];
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row["Company name"]?.trim();

      // Skip rows without a company name
      if (!name) {
        skipped++;
        continue;
      }

      // Combine address lines 2 and 3
      const addressParts = [
        row["Street Address 2"]?.trim(),
        row["Street Address 3"]?.trim()
      ].filter(Boolean);

      // Normalize website URL
      let website = row["Company Domain Name"]?.trim() || null;
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`;
      }

      mappedRows.push({
        name,
        address_line1: row["Street Address"]?.trim() || null,
        address_line2: addressParts.length > 0 ? addressParts.join(", ") : null,
        postcode: row["Postal Code"]?.trim() || null,
        city: row["City"]?.trim() || null,
        website,
        phone: row["Phone Number"]?.trim() || null,
        email: row["Company Email"]?.trim() || null,
        sector: row["Sector"]?.trim() || null,
        biz_type: row["Biz Type"]?.trim() || null,
        edition_area: row["14 Editions - Local"]?.trim() || null,
        is_active: true,
        is_verified: false,
        featured: false
      });
    }

    // Insert in smaller sub-batches to avoid timeouts
    const subBatchSize = 100;
    let inserted = 0;

    for (let i = 0; i < mappedRows.length; i += subBatchSize) {
      const subBatch = mappedRows.slice(i, i + subBatchSize);
      
      const { error: insertError, data } = await supabase
        .from('businesses')
        .insert(subBatch)
        .select('id');

      if (insertError) {
        console.error(`Error inserting sub-batch ${i / subBatchSize}:`, insertError);
        errors.push(`Batch error at row ${i}: ${insertError.message}`);
      } else {
        inserted += data?.length || 0;
      }
    }

    console.log(`Batch ${batchIndex + 1}/${totalBatches}: Inserted ${inserted}, Skipped ${skipped}`);

    return new Response(
      JSON.stringify({
        success: true,
        batchIndex,
        totalBatches,
        processed: rows.length,
        inserted,
        skipped,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});