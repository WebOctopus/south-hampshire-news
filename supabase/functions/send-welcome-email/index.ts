import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  displayName?: string;
}

function applyTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

async function fetchTemplate(name: string): Promise<{ subject: string; html_body: string } | null> {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("subject, html_body")
      .eq("name", name)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

function buildFallbackHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Discover Magazine!</h1>
              <p style="color: #bbf7d0; margin: 10px 0 0; font-size: 16px;">Your local community awaits</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333; font-size: 18px; margin: 0 0 20px;">Hi ${name},</p>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Thank you for joining the Discover Magazine community! We're thrilled to have you on board.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                As a member, you can now access your personalised dashboard to manage your business listings, explore advertising opportunities, and connect with local customers across South Hampshire.
              </p>
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h2 style="color: #166534; font-size: 18px; margin: 0 0 15px;">🚀 Quick Start Guide</h2>
                <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Dashboard:</strong> View and manage your bookings and quotes</li>
                  <li><strong>Business Directory:</strong> Add or claim your business listing</li>
                  <li><strong>Advertising:</strong> Explore our magazine and leaflet distribution options</li>
                  <li><strong>What's On:</strong> Submit local events to our community calendar</li>
                </ul>
              </div>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://peacockpixelmedia.co.uk/dashboard" style="display: inline-block; background-color: #166534; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px; text-align: center;">
                <strong>Peacock & Pixel Ltd</strong> | Discover Magazine
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                Connecting South Hampshire communities since 2014
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const name = displayName || email.split("@")[0];

    console.log(`Sending welcome email to: ${email}`);

    // Try DB template first, fall back to hardcoded
    const template = await fetchTemplate("welcome_email");
    let subject: string;
    let html: string;

    if (template) {
      const vars: Record<string, string> = {
        customer_name: name,
        dashboard_url: "https://peacockpixelmedia.co.uk/dashboard",
      };
      subject = applyTemplate(template.subject, vars);
      html = applyTemplate(template.html_body, vars);
    } else {
      subject = "Welcome to Discover Magazine! 🎉";
      html = buildFallbackHtml(name);
    }

    const emailResponse = await resend.emails.send({
      from: "Discover Magazine <discovermagazines@peacockpixelmedia.co.uk>",
      to: [email],
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
