import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
    
    if (!ghlWebhookUrl) {
      throw new Error('GHL_WEBHOOK_URL secret not configured');
    }

    // Get custom payload or use default test data
    let testPayload;
    try {
      const body = await req.json();
      testPayload = body.payload || body;
    } catch {
      // Use default test payload
      testPayload = {
        type: 'business_sync',
        source: 'discover_website_test',
        timestamp: new Date().toISOString(),
        business: {
          name: 'Test Business from Discover Website',
          email: 'test@example.com',
          phone: '02380123456',
          website: 'https://example.com',
          address: '123 Test Street',
          city: 'Southampton',
          postcode: 'SO14 1AA',
          category: 'Restaurant',
        }
      };
    }

    console.log('Sending test payload to GHL webhook:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(ghlWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    console.log('GHL webhook response:', response.status, responseText);

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      sentPayload: testPayload,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing GHL webhook:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
