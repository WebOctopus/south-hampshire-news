import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOCARDLESS_API_KEY = Deno.env.get('GOCARDLESS_API_KEY');
    
    if (!GOCARDLESS_API_KEY) {
      throw new Error('Missing GoCardless API key');
    }

    console.log('API Key prefix:', GOCARDLESS_API_KEY.substring(0, 8) + '...');
    
    const isSandbox = GOCARDLESS_API_KEY.startsWith('sandbox_');
    const GOCARDLESS_API_URL = isSandbox
      ? 'https://api-sandbox.gocardless.com'
      : 'https://api.gocardless.com';

    console.log('Using API:', GOCARDLESS_API_URL, 'sandbox mode:', isSandbox);

    // Test API connection with a simple request to get creditors
    const response = await fetch(`${GOCARDLESS_API_URL}/creditors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
        'GoCardless-Version': '2015-07-06',
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('GoCardless API Response Status:', response.status);
    console.log('GoCardless API Response:', responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: 'GoCardless API Error',
          status: response.status,
          response: responseText,
          apiUrl: GOCARDLESS_API_URL,
          sandbox: isSandbox
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 so we can see the error details
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'GoCardless API connection successful',
        apiUrl: GOCARDLESS_API_URL,
        sandbox: isSandbox,
        response: JSON.parse(responseText)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in test-gocardless:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});