import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    // Using live API - make sure you have a live API key configured
    const GOCARDLESS_API_URL = 'https://api.gocardless.com';
    
    console.log('Creating GoCardless mandate for booking:', bookingId);

    // Check if customer already exists
    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from('gocardless_customers')
      .select('gocardless_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.gocardless_customer_id;
      console.log('Using existing customer:', customerId);
    } else {
      // Create new GoCardless customer
      const customerResponse = await fetch(`${GOCARDLESS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOCARDLESS_API_KEY}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customers: {
            email: customerEmail,
            given_name: customerName.split(' ')[0],
            family_name: customerName.split(' ').slice(1).join(' ') || customerName.split(' ')[0],
            address_line1: customerAddress.addressLine1,
            address_line2: customerAddress.addressLine2,
            city: customerAddress.city,
            postal_code: customerAddress.postcode,
            country_code: 'GB',
          }
        })
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.text();
        console.error('GoCardless customer creation error:', error);
        throw new Error(`Failed to create customer: ${error}`);
      }

      const customerData = await customerResponse.json();
      customerId = customerData.customers.id;
      console.log('Created new customer:', customerId);

      // Save customer to database
      await supabase.from('gocardless_customers').insert({
        user_id: user.id,
        gocardless_customer_id: customerId,
      });
    }

    // Create redirect flow for mandate setup
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
          session_token: `${user.id}-${bookingId}-${Date.now()}`,
          success_redirect_url: `${req.headers.get('origin')}/payment-setup?booking_id=${bookingId}`,
          prefilled_customer: {
            email: customerEmail,
            given_name: customerName.split(' ')[0],
            family_name: customerName.split(' ').slice(1).join(' ') || customerName.split(' ')[0],
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
        customerId,
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
