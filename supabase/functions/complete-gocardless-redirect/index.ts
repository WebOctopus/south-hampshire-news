import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CompleteRedirectRequest {
  redirectFlowId: string;
  bookingId: string;
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

    const { redirectFlowId, bookingId }: CompleteRedirectRequest = await req.json();

    const GOCARDLESS_API_KEY = Deno.env.get('GOCARDLESS_API_KEY');
    if (!GOCARDLESS_API_KEY) throw new Error('Missing GoCardless API key');
    const isSandbox = GOCARDLESS_API_KEY.startsWith('sandbox_');
    const GOCARDLESS_API_URL = isSandbox
      ? 'https://api-sandbox.gocardless.com'
      : 'https://api.gocardless.com';

    console.log('Completing GoCardless redirect flow:', redirectFlowId, 'sandbox:', isSandbox);

    // Complete the redirect flow to get the mandate
    const response = await fetch(`${GOCARDLESS_API_URL}/redirect_flows/${redirectFlowId}/actions/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
        'GoCardless-Version': '2015-07-06',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          session_token: `${user.id}-${bookingId}`,
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GoCardless redirect flow completion error:', error);
      throw new Error(`Failed to complete redirect flow: ${error}`);
    }

    const data = await response.json();
    const mandateId = data.redirect_flows.links.mandate;
    const customerId = data.redirect_flows.links.customer;

    console.log('Redirect flow completed. Mandate:', mandateId);

    return new Response(
      JSON.stringify({
        mandateId,
        customerId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in complete-gocardless-redirect:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
