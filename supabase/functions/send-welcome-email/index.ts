import { Resend } from "npm:resend@4.0.0";

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!email) {
      throw new Error("Email is required");
    }

    const name = displayName || email.split("@")[0];
    const siteUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "https://south-hampshire-news.lovable.app";

    console.log(`Sending welcome email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Discover Magazine <noreply@peacockandpixel.co.uk>",
      to: [email],
      subject: "Welcome to Discover Magazine! 🎉",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Discover Magazine</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Discover Magazine!</h1>
              <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Your local community awaits</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 18px; margin: 0 0 20px 0;">Hi ${name},</p>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining the Discover Magazine community! We're thrilled to have you on board.
              </p>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                As a member, you can now access your personalised dashboard to manage your business listings, explore advertising opportunities, and connect with local customers across South Hampshire.
              </p>
              
              <!-- Quick Start Section -->
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h2 style="color: #166534; font-size: 18px; margin: 0 0 15px 0;">🚀 Quick Start Guide</h2>
                <ul style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Dashboard:</strong> View and manage your bookings and quotes</li>
                  <li><strong>Business Directory:</strong> Add or claim your business listing</li>
                  <li><strong>Advertising:</strong> Explore our magazine and leaflet distribution options</li>
                  <li><strong>What's On:</strong> Submit local events to our community calendar</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://south-hampshire-news.lovable.app/dashboard" style="display: inline-block; background-color: #166534; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                <strong>Peacock & Pixel Ltd</strong> | Discover Magazine
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                Connecting South Hampshire communities since 2014
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0; text-align: center;">
                <a href="https://south-hampshire-news.lovable.app" style="color: #166534; text-decoration: none;">Website</a> •
                <a href="https://south-hampshire-news.lovable.app/contact" style="color: #166534; text-decoration: none;">Contact Us</a> •
                <a href="https://south-hampshire-news.lovable.app/advertising" style="color: #166534; text-decoration: none;">Advertise</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
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
