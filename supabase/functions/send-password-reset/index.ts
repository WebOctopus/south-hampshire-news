import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !resetUrl) {
      throw new Error("Email and resetUrl are required");
    }

    console.log(`Sending password reset email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Discover Magazine <noreply@peacockandpixel.co.uk>",
      to: [email],
      subject: "Reset Your Password - Discover Magazine",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
              <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Discover Magazine</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 18px; margin: 0 0 20px 0;">Hello,</p>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset the password for your Discover Magazine account associated with <strong>${email}</strong>.
              </p>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Click the button below to set a new password. This link will expire in 1 hour for security reasons.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #166534; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin-bottom: 20px;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>Security Tip:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #166534; word-break: break-all;">${resetUrl}</a>
              </p>
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
                <a href="https://south-hampshire-news.lovable.app/contact" style="color: #166534; text-decoration: none;">Contact Us</a>
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

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
