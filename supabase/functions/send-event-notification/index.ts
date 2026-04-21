import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EventNotificationPayload {
  event_id: string;
  slug?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  area: string;
  category: string;
  type: string;
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
  excerpt?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EventNotificationPayload = await req.json();
    const { event_id, slug, title, date, time, location, area, category, type, organizer, contact_email, contact_phone, excerpt } = payload;

    if (!event_id || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventPath = slug || event_id;
    const eventUrl = `https://www.peacockpixelmedia.co.uk/events/${eventPath}`;
    const adminUrl = `https://www.peacockpixelmedia.co.uk/admin`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <tr>
      <td style="padding:30px 25px;background-color:#1a1a2e;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">🎉 New Event Submission</h1>
        <p style="color:#cccccc;margin:8px 0 0;font-size:14px;">A new event is pending your review</p>
      </td>
    </tr>
    <tr>
      <td style="padding:25px;">
        <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:20px;">${title}</h2>
        
        ${excerpt ? `<p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 20px;">${excerpt}</p>` : ''}
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">📅 Date:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${date}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">🕐 Time:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${time}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">📍 Location:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${location}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">🗺️ Area:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${area}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">📂 Category:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${category}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">🎭 Type:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${type}</span>
            </td>
          </tr>
          ${organizer ? `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">👤 Organiser:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${organizer}</span>
            </td>
          </tr>` : ''}
          ${contact_email ? `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">✉️ Contact Email:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${contact_email}</span>
            </td>
          </tr>` : ''}
          ${contact_phone ? `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong style="color:#333;font-size:13px;">📞 Contact Phone:</strong>
              <span style="color:#555;font-size:13px;margin-left:8px;">${contact_phone}</span>
            </td>
          </tr>` : ''}
        </table>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;" align="center">
              <a href="${eventUrl}" style="display:inline-block;padding:12px 24px;background-color:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">View Event</a>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;" align="center">
              <a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background-color:#f59e0b;color:#1a1a2e;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">Go to Admin Dashboard</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 25px;background-color:#f4f4f5;text-align:center;">
        <p style="color:#999;font-size:12px;margin:0;">This is an automated notification from Discover Magazine</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: "Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>",
      to: ["discover@discovermagazines.co.uk"],
      cc: ["discover@discovermagazines.co.uk"],
      subject: `New Event Submission: ${title}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Event notification sent:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending event notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
