import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CSVRow = Record<string, string | undefined>;

const normaliseKey = (s: string) =>
  s.replace(/^\ufeff/, '').toLowerCase().trim().replace(/[\s_\-]+/g, ' ').replace(/\s+/g, ' ');

const FIELD_ALIASES = {
  name: ['name', 'company name', 'company', 'business name', 'business', 'trading name'],
  address1: ['street address', 'address', 'address 1', 'address line 1'],
  address2: ['street address 2', 'address 2', 'address line 2'],
  address3: ['street address 3', 'address 3', 'address line 3'],
  postcode: ['postal code', 'postcode', 'post code', 'zip', 'zip code'],
  city: ['city', 'town'],
  website: ['company domain name', 'website', 'domain', 'url'],
  phone: ['phone number', 'phone', 'telephone', 'tel', 'mobile'],
  email: ['company email', 'email', 'email address'],
  sector: ['sector', 'industry', 'category'],
  biz_type: ['biz type', 'business type', 'type'],
  edition_area: ['14 editions - local', '14 editions local', 'edition', 'edition area', 'local edition', 'area'],
  tag: ['tag', 'tags', 'label'],
};

function buildNormMap(row: CSVRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    out[normaliseKey(k)] = (row[k] ?? '') as string;
  }
  return out;
}

function pick(normRow: Record<string, string>, aliases: string[]): string {
  for (const a of aliases) {
    const v = normRow[normaliseKey(a)];
    if (v !== undefined && String(v).trim() !== '') return String(v);
  }
  return '';
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
      // Clear dependent rows first
      await supabase.from('business_claim_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('business_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('featured_advertisers').delete().not('business_id', 'is', null);
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

    // Slug helpers
    const slugify = (s: string) =>
      s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Pre-load existing slugs to avoid collisions across batches
    const existingSlugs = new Set<string>();
    {
      const { data: existing } = await supabase
        .from('businesses')
        .select('slug')
        .not('slug', 'is', null);
      (existing || []).forEach((r: any) => r.slug && existingSlugs.add(r.slug));
    }

    // Process and map rows
    const mappedRows = [];
    const errors: string[] = [];
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const norm = buildNormMap(row);
      const name = pick(norm, FIELD_ALIASES.name).trim();

      // Skip rows without a company name
      if (!name) {
        skipped++;
        continue;
      }

      // Combine address lines 2 and 3
      const addressParts = [
        pick(norm, FIELD_ALIASES.address2).trim(),
        pick(norm, FIELD_ALIASES.address3).trim()
      ].filter(Boolean);

      // Normalize website URL
      let website = pick(norm, FIELD_ALIASES.website).trim() || null;
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`;
      }

      // Slug: name → name-city → name-city-2, name-city-3, ...
      const city = pick(norm, FIELD_ALIASES.city).trim();
      const baseSlug = slugify(name) || 'business';
      let candidate = baseSlug;
      if (existingSlugs.has(candidate)) {
        const citySlug = slugify(city);
        candidate = citySlug ? `${baseSlug}-${citySlug}` : baseSlug;
        let n = 2;
        while (existingSlugs.has(candidate)) {
          candidate = citySlug ? `${baseSlug}-${citySlug}-${n}` : `${baseSlug}-${n}`;
          n++;
        }
      }
      existingSlugs.add(candidate);

      mappedRows.push({
        name,
        address_line1: pick(norm, FIELD_ALIASES.address1).trim() || null,
        address_line2: addressParts.length > 0 ? addressParts.join(", ") : null,
        postcode: pick(norm, FIELD_ALIASES.postcode).trim() || null,
        city: city || null,
        website,
        phone: pick(norm, FIELD_ALIASES.phone).trim() || null,
        email: pick(norm, FIELD_ALIASES.email).trim() || null,
        sector: pick(norm, FIELD_ALIASES.sector).trim() || null,
        biz_type: pick(norm, FIELD_ALIASES.biz_type).trim() || null,
        edition_area: pick(norm, FIELD_ALIASES.edition_area).trim() || null,
        tag: pick(norm, FIELD_ALIASES.tag).trim() || null,
        slug: candidate,
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