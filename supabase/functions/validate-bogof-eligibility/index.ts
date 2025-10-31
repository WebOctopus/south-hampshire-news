import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  email?: string;
  phone?: string;
  ipAddressHash?: string;
  deviceFingerprint?: string;
}

interface ValidationResult {
  isEligible: boolean;
  reason?: string;
  warnings?: string[];
  existingBooking?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    const { email, phone, ipAddressHash, deviceFingerprint }: ValidationRequest = await req.json();

    console.log('Validating BOGOF eligibility:', { userId, email, phone, hasIpHash: !!ipAddressHash, hasFingerprint: !!deviceFingerprint });

    const result: ValidationResult = {
      isEligible: true,
      warnings: []
    };

    // Layer 1: Check if authenticated user has already used BOGOF
    if (userId) {
      const { data: userBooking, error: userError } = await supabase
        .from('bookings')
        .select('id, created_at, email, company, contact_name')
        .eq('user_id', userId)
        .eq('pricing_model', 'bogof')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (userError) {
        console.error('Error checking user bookings:', userError);
      }

      if (userBooking) {
        console.log('User has already used BOGOF offer:', userBooking);
        return new Response(
          JSON.stringify({
            isEligible: false,
            reason: 'account_already_used',
            message: "You have already booked the one time 3+ Repeat Package for New Advertisers. We'll direct you to your account where you can place further bookings",
            existingBooking: userBooking
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Layer 2: Check if email has been used for BOGOF
    if (email) {
      const { data: emailBooking, error: emailError } = await supabase
        .from('bookings')
        .select('id, created_at, user_id')
        .eq('email', email)
        .eq('pricing_model', 'bogof')
        .eq('payment_status', 'paid')
        .limit(1)
        .maybeSingle();

      if (emailError) {
        console.error('Error checking email bookings:', emailError);
      }

      if (emailBooking) {
        console.log('Email has been used for BOGOF:', emailBooking);
        return new Response(
          JSON.stringify({
            isEligible: false,
            reason: 'email_already_used',
            message: "You have already booked the one time 3+ Repeat Package for New Advertisers. We'll direct you to your account where you can place further bookings",
            existingBooking: emailBooking
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Layer 3: Check if phone has been used for BOGOF
    if (phone) {
      const { data: phoneBooking, error: phoneError } = await supabase
        .from('bookings')
        .select('id, created_at, user_id')
        .eq('phone', phone)
        .eq('pricing_model', 'bogof')
        .eq('payment_status', 'paid')
        .limit(1)
        .maybeSingle();

      if (phoneError) {
        console.error('Error checking phone bookings:', phoneError);
      }

      if (phoneBooking) {
        console.log('Phone has been used for BOGOF:', phoneBooking);
        return new Response(
          JSON.stringify({
            isEligible: false,
            reason: 'phone_already_used',
            message: "You have already booked the one time 3+ Repeat Package for New Advertisers. We'll direct you to your account where you can place further bookings",
            existingBooking: phoneBooking
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Layer 4 & 5: Soft checks for IP and device fingerprint (warnings, not blockers)
    if (ipAddressHash) {
      const { data: ipBookings, error: ipError } = await supabase
        .from('bookings')
        .select('id, created_at, user_id, email')
        .eq('ip_address_hash', ipAddressHash)
        .eq('pricing_model', 'bogof')
        .eq('payment_status', 'paid')
        .limit(3);

      if (!ipError && ipBookings && ipBookings.length > 0) {
        console.log('IP hash matches found:', ipBookings.length);
        result.warnings?.push(`This IP address has been associated with ${ipBookings.length} previous BOGOF booking(s).`);
      }
    }

    if (deviceFingerprint) {
      const { data: deviceBookings, error: deviceError } = await supabase
        .from('bookings')
        .select('id, created_at, user_id, email')
        .eq('device_fingerprint', deviceFingerprint)
        .eq('pricing_model', 'bogof')
        .eq('payment_status', 'paid')
        .limit(3);

      if (!deviceError && deviceBookings && deviceBookings.length > 0) {
        console.log('Device fingerprint matches found:', deviceBookings.length);
        result.warnings?.push(`This device has been associated with ${deviceBookings.length} previous BOGOF booking(s).`);
      }
    }

    // If we have warnings, flag for potential review but don't block
    if (result.warnings && result.warnings.length > 0) {
      result.isEligible = true; // Still eligible but flagged
      console.log('Warnings found but allowing booking:', result.warnings);
    }

    console.log('BOGOF eligibility check result:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in validate-bogof-eligibility:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isEligible: true, // Fail open - don't block legitimate users due to errors
        warnings: ['Unable to complete validation check. Proceeding with caution.']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even on error to not break the flow
      }
    );
  }
});
