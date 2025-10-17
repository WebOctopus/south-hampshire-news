import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateMandateRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  customerAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { bookingId, customerEmail, customerName, customerAddress }: CreateMandateRequest = await req.json();

    const GOCARDLESS_API_KEY = Deno.env.get('GOCARDLESS_API_KEY');
    if (!GOCARDLESS_API_KEY) throw new Error('Missing GoCardless API key');
    const isSandbox = GOCARDLESS_API_KEY.startsWith('sandbox_');
    const GOCARDLESS_API_URL = isSandbox
      ? 'https://api-sandbox.gocardless.com'
      : 'https://api.gocardless.com';

    console.log('Creating GoCardless mandate for booking:', bookingId, 'sandbox:', isSandbox);

    // Create redirect flow for mandate setup
    const sessionToken = `${user.id}-${bookingId}`; // must be consistent when completing
    const redirectFlowResponse = await fetch(`${GOCARDLESS_API_URL}/redirect_flows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
        'GoCardless-Version': '2015-07-06',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirect_flows: {
          description: 'Advertising Campaign Payment',
          session_token: sessionToken,
          success_redirect_url: `${req.headers.get('origin')}/payment-setup?booking_id=${bookingId}`,
          prefilled_customer: {
            email: customerEmail,
            given_name: customerName.split(' ')[0] || customerName,
            family_name: customerName.split(' ').slice(1).join(' ') || customerName,
            address_line1: customerAddress.addressLine1,
            address_line2: customerAddress.addressLine2,
            city: customerAddress.city,
            postal_code: customerAddress.postcode,
            country_code: 'GB',
          }
        }
      })
    });

    if (!redirectFlowResponse.ok) {
      const error = await redirectFlowResponse.text();
      console.error('GoCardless redirect flow error:', error);
      throw new Error(`Failed to create redirect flow: ${error}`);
    }

    const redirectFlowData = await redirectFlowResponse.json();
    const redirectUrl = redirectFlowData.redirect_flows.redirect_url;
    const redirectFlowId = redirectFlowData.redirect_flows.id;

    console.log('Created redirect flow:', redirectFlowId);

    // Store redirect flow ID temporarily (we'll complete it after user returns)
    await supabase.from('bookings').update({
      notes: `GoCardless redirect flow: ${redirectFlowId}`,
    }).eq('id', bookingId);

    return new Response(
      JSON.stringify({
        redirectUrl,
        redirectFlowId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-gocardless-mandate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
