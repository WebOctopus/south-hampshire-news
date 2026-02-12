import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  record_type: "quote" | "booking";
  record_id?: string;
  pricing_model: string;
  contact_name?: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  ad_size?: string;
  duration?: string;
  selected_areas?: string[];
  bogof_paid_areas?: string[];
  bogof_free_areas?: string[];
  total_circulation?: number;
  subtotal?: number;
  final_total?: number;
  monthly_price?: number;
  volume_discount_percent?: number;
  duration_discount_percent?: number;
  status?: string;
  pricing_breakdown?: any;
  selections?: any;
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

function getPricingModelLabel(model: string): string {
  switch (model) {
    case "fixed": return "Fixed Term";
    case "bogof": return "3+ Repeat Package";
    case "leafleting": return "Leafleting Service";
    default: return "Advertising";
  }
}

function formatCurrency(amount: number | undefined): string {
  if (!amount && amount !== 0) return "N/A";
  return `£${Number(amount).toFixed(2)}`;
}

function buildAdminEmailHtml(payload: EmailPayload): string {
  const typeLabel = payload.record_type === "booking" ? "Booking" : "Quote";
  const modelLabel = getPricingModelLabel(payload.pricing_model);
  const name = payload.contact_name || "Unknown";
  const email = payload.email;
  const phone = payload.phone || "Not provided";
  const company = payload.company || "Not provided";

  const detailRows = [
    { label: "Package Type", value: modelLabel },
    { label: "Ad Size", value: payload.ad_size || "N/A" },
    { label: "Duration", value: payload.duration || "N/A" },
    { label: "Total Circulation", value: payload.total_circulation ? payload.total_circulation.toLocaleString() : "N/A" },
    { label: "Subtotal", value: formatCurrency(payload.subtotal) },
    { label: "Final Total", value: formatCurrency(payload.final_total) },
    { label: "Monthly Price", value: formatCurrency(payload.monthly_price) },
  ];

  if (payload.volume_discount_percent && payload.volume_discount_percent > 0) {
    detailRows.push({ label: "Volume Discount", value: `${payload.volume_discount_percent}%` });
  }
  if (payload.duration_discount_percent && payload.duration_discount_percent > 0) {
    detailRows.push({ label: "Duration Discount", value: `${payload.duration_discount_percent}%` });
  }

  const areasList = payload.selected_areas?.length
    ? payload.selected_areas.join(", ")
    : "None selected";

  let bogofInfo = "";
  if (payload.pricing_model === "bogof") {
    const paid = payload.bogof_paid_areas?.length ? payload.bogof_paid_areas.join(", ") : "None";
    const free = payload.bogof_free_areas?.length ? payload.bogof_free_areas.join(", ") : "None";
    bogofInfo = `
      <tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Paid Areas</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${paid}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Free Areas</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${free}</td></tr>`;
  }

  const detailRowsHtml = detailRows
    .map(
      (r) =>
        `<tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">${r.label}</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${r.value}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:30px 40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:24px;">New ${typeLabel} Received</h1>
<p style="color:#bbf7d0;margin:8px 0 0;font-size:16px;">${modelLabel}</p>
</td></tr>
<tr><td style="padding:30px 40px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 15px;">Customer Details</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
<tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Name</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${name}</td></tr>
<tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Email</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#166534;">${email}</a></td></tr>
<tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Phone</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${phone}</td></tr>
<tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Company</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${company}</td></tr>
</table>
<h2 style="color:#166534;font-size:18px;margin:0 0 15px;">Campaign Details</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
${detailRowsHtml}
<tr><td style="padding:8px 12px;font-weight:bold;color:#333;border-bottom:1px solid #e5e7eb;">Areas</td><td style="padding:8px 12px;color:#555;border-bottom:1px solid #e5e7eb;">${areasList}</td></tr>
${bogofInfo}
</table>
<div style="background-color:#f0fdf4;border-radius:8px;padding:15px;text-align:center;">
<a href="https://south-hampshire-news.lovable.app/admin" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;">View in Admin Dashboard</a>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">This is an automated notification from Discover Magazine</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildCustomerEmailHtml(payload: EmailPayload): string {
  const isBooking = payload.record_type === "booking";
  const modelLabel = getPricingModelLabel(payload.pricing_model);
  const name = (payload.contact_name || payload.email.split("@")[0]).split(" ")[0];

  const nextStepsHtml = isBooking
    ? `<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li><strong>Log in to your dashboard</strong> to view your booking details</li>
        <li><strong>Set up your Direct Debit payment</strong> via GoCardless</li>
        <li><strong>We'll confirm your campaign schedule</strong> and send you the details</li>
        <li><strong>Your advert will appear</strong> in the next available issue</li>
      </ol>`
    : `<ol style="color:#555;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li><strong>Log in to your dashboard</strong> to review your quote</li>
        <li><strong>When you're ready</strong>, convert your quote to a booking</li>
        <li><strong>Set up payment</strong> to confirm your campaign</li>
      </ol>`;

  const summaryRows = [
    { label: "Package", value: modelLabel },
    payload.ad_size ? { label: "Ad Size", value: payload.ad_size } : null,
    payload.duration ? { label: "Duration", value: payload.duration } : null,
    payload.total_circulation ? { label: "Circulation", value: payload.total_circulation.toLocaleString() + " copies" } : null,
    { label: "Total Cost", value: formatCurrency(payload.final_total) },
  ].filter(Boolean);

  const summaryHtml = summaryRows
    .map(
      (r: any) =>
        `<tr><td style="padding:8px 0;font-weight:bold;color:#333;">${r.label}</td><td style="padding:8px 0;color:#555;text-align:right;">${r.value}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f4;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">${isBooking ? "Booking Confirmation" : "Quote Saved"}</h1>
<p style="color:#bbf7d0;margin:10px 0 0;font-size:16px;">Discover Magazine</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#333;font-size:18px;margin:0 0 20px;">Hi ${name},</p>
<p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 20px;">
${isBooking
    ? "Thank you for booking with Discover Magazine! We've received your booking and here's a summary of what you've selected."
    : "Thank you for your interest in advertising with Discover Magazine! Your quote has been saved and you can access it anytime from your dashboard."}
</p>
<div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#166534;font-size:18px;margin:0 0 12px;">Your ${isBooking ? "Booking" : "Quote"} Summary</h2>
<table style="width:100%;border-collapse:collapse;">
${summaryHtml}
</table>
</div>
<div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:25px;">
<h2 style="color:#92400e;font-size:18px;margin:0 0 12px;">📋 What to do next</h2>
${nextStepsHtml}
</div>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<tr><td align="center">
<a href="https://south-hampshire-news.lovable.app/dashboard" style="display:inline-block;background-color:#166534;color:#fff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;font-size:16px;">Go to Your Dashboard</a>
</td></tr></table>
<div style="background-color:#f9fafb;border-radius:8px;padding:20px;">
<p style="color:#555;font-size:14px;margin:0 0 8px;"><strong>Need help?</strong></p>
<p style="color:#555;font-size:14px;margin:0;">📧 Email: <a href="mailto:info@peacockpixelmedia.co.uk" style="color:#166534;">info@peacockpixelmedia.co.uk</a></p>
<p style="color:#555;font-size:14px;margin:5px 0 0;">📞 Phone: 023 9298 9314</p>
</div>
</td></tr>
<tr><td style="background-color:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0 0 10px;text-align:center;"><strong>Peacock & Pixel Ltd</strong> | Discover Magazine</p>
<p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Connecting South Hampshire communities since 2014</p>
<p style="color:#9ca3af;font-size:12px;margin:15px 0 0;text-align:center;">
<a href="https://south-hampshire-news.lovable.app" style="color:#166534;text-decoration:none;">Website</a> •
<a href="https://south-hampshire-news.lovable.app/contact" style="color:#166534;text-decoration:none;">Contact Us</a> •
<a href="https://south-hampshire-news.lovable.app/advertising" style="color:#166534;text-decoration:none;">Advertise</a>
</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();

    if (!payload.email) {
      throw new Error("Customer email is required");
    }

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const typeLabel = payload.record_type === "booking" ? "Booking" : "Quote";
    const modelLabel = getPricingModelLabel(payload.pricing_model);

    console.log(`Sending ${typeLabel} confirmation emails for ${payload.email}`);

    const results: any = {};

    // Email A: Admin notification
    if (adminEmail) {
      try {
        // Try DB template for admin email
        const adminTemplate = await fetchTemplate("booking_quote_admin");
        let adminSubject: string;
        let adminHtml: string;

        if (adminTemplate) {
          const vars: Record<string, string> = {
            type_label: typeLabel,
            model_label: modelLabel,
            customer_name: payload.contact_name || "Unknown",
            email: payload.email,
            phone: payload.phone || "Not provided",
            company: payload.company || "Not provided",
            details_table: "",
            admin_url: "https://south-hampshire-news.lovable.app/admin",
          };
          adminSubject = applyTemplate(adminTemplate.subject, vars);
          adminHtml = applyTemplate(adminTemplate.html_body, vars);
        } else {
          adminSubject = `New ${typeLabel} Received – ${modelLabel}`;
          adminHtml = buildAdminEmailHtml(payload);
        }

        const adminResult = await resend.emails.send({
          from: "Discover Magazine <noreply@peacockpixelmedia.co.uk>",
          to: adminEmail.split(",").map((e: string) => e.trim()),
          subject: adminSubject,
          html: adminHtml,
        });
        results.admin = { success: true, data: adminResult };
        console.log("Admin notification sent:", adminResult);
      } catch (adminError: any) {
        console.error("Admin email error:", adminError);
        results.admin = { success: false, error: adminError.message };
      }
    } else {
      console.warn("ADMIN_NOTIFICATION_EMAIL not configured, skipping admin email");
      results.admin = { success: false, error: "Not configured" };
    }

    // Email B: Customer confirmation
    try {
      const templateName = payload.record_type === "booking"
        ? "booking_confirmation_customer"
        : "quote_saved_customer";
      const customerTemplate = await fetchTemplate(templateName);

      let customerSubject: string;
      let customerHtml: string;

      if (customerTemplate) {
        const vars: Record<string, string> = {
          customer_name: (payload.contact_name || payload.email.split("@")[0]).split(" ")[0],
          package_type: modelLabel,
          ad_size: payload.ad_size || "N/A",
          duration: payload.duration || "N/A",
          circulation: payload.total_circulation ? payload.total_circulation.toLocaleString() : "N/A",
          total_cost: formatCurrency(payload.final_total),
          dashboard_url: "https://south-hampshire-news.lovable.app/dashboard",
        };
        customerSubject = applyTemplate(customerTemplate.subject, vars);
        customerHtml = applyTemplate(customerTemplate.html_body, vars);
      } else {
        customerSubject = payload.record_type === "booking"
          ? "Your Discover Magazine Booking Confirmation"
          : "Your Discover Magazine Quote Has Been Saved";
        customerHtml = buildCustomerEmailHtml(payload);
      }

      const customerResult = await resend.emails.send({
        from: "Discover Magazine <noreply@peacockpixelmedia.co.uk>",
        to: [payload.email],
        subject: customerSubject,
        html: customerHtml,
      });
      results.customer = { success: true, data: customerResult };
      console.log("Customer confirmation sent:", customerResult);
    } catch (customerError: any) {
      console.error("Customer email error:", customerError);
      results.customer = { success: false, error: customerError.message };
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation-email:", error);
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
