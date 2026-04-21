const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const {
      email,
      password,
      is_existing_user,
      event_id,
      slug,
      event_title,
      organiser_name,
    } = await req.json();

    if (!email || !event_title) {
      return new Response(
        JSON.stringify({ error: "email and event_title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dashboardUrl = "https://www.peacockpixelmedia.co.uk/dashboard";
    const eventPath = slug || event_id;
    const eventUrl = eventPath
      ? `https://www.peacockpixelmedia.co.uk/events/${eventPath}`
      : null;

    const greeting = organiser_name ? `Hello ${organiser_name}` : "Hello";

    let credentialsBlock = "";
    if (is_existing_user) {
      credentialsBlock = `
        <p style="color: #555; font-size: 16px;">You already have an account. Simply log in to your dashboard to manage your event:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${dashboardUrl}" style="background: #E25A3E; color: #ffffff; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Log In to Your Dashboard</a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">Forgot your password? Use the "Forgot Password" link on the login page.</p>
      `;
    } else {
      credentialsBlock = `
        <p style="color: #555; font-size: 16px;">We've created an account for you so you can manage your event. Here are your login details:</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #777; font-size: 14px;">Email</p>
          <p style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: bold;">${email}</p>
          <p style="margin: 0 0 8px 0; color: #777; font-size: 14px;">Password</p>
          <p style="margin: 0; color: #333; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${password}</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${dashboardUrl}" style="background: #E25A3E; color: #ffffff; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Log In to Your Dashboard</a>
        </div>
        <p style="color: #777; font-size: 14px;">We recommend changing your password after your first login.</p>
      `;
    }

    const eventLinkBlock = eventUrl
      ? `<p style="color: #555; font-size: 16px;">You can also view your event listing here: <a href="${eventUrl}" style="color: #E25A3E;">${event_title}</a></p>`
      : "";

    const htmlBody = `
      <table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0; background: #f9f9f9;">
      <table role="presentation" width="600" style="width:600px;max-width:100%;border-collapse:collapse;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="padding:40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://peacockpixelmedia.co.uk/lovable-uploads/discover-logo.png" alt="Discover Magazine" style="max-width: 200px;" />
        </div>
        <h2 style="color: #333; text-align: center; margin-bottom: 10px;">Your Event Has Been Submitted!</h2>
        <p style="color: #777; text-align: center; font-size: 14px; margin-bottom: 30px;">Event: <strong>${event_title}</strong></p>
        <p style="color: #555; font-size: 16px;">${greeting},</p>
        <p style="color: #555; font-size: 16px;">Your event "<strong>${event_title}</strong>" has been submitted to Discover Magazine and is currently pending review by our team.</p>
        
        ${credentialsBlock}

        <div style="background: #FFF8E1; border-left: 4px solid #FFA000; padding: 15px; border-radius: 4px; margin: 25px 0;">
          <p style="color: #333; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">📋 What to do next:</p>
          <ul style="color: #555; font-size: 14px; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 6px;">Log in to your dashboard to review your event details</li>
            <li style="margin-bottom: 6px;">Upload an event image to make your listing stand out</li>
            <li>Check back for updates on your event's approval status</li>
          </ul>
        </div>

        ${eventLinkBlock}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>📞 023 8026 6388 &nbsp; ✉ discover@discovermagazines.co.uk</p>
          <p>📍 30 Leigh Road, Eastleigh, SO50 9DT Hampshire</p>
          <p style="margin-top: 10px;">Connecting South Hampshire communities since 2014</p>
        </div>
        </td></tr>
      </table></td></tr></table>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>",
        to: [email],
        cc: ["discover@discovermagazines.co.uk"],
        subject: `Your Event "${event_title}" – Dashboard Access`,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(`Resend error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-event-organiser-login error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
