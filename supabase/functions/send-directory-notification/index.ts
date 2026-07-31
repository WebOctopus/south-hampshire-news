import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM = "Discover Magazine <discover@discovermagazines.co.uk>";
const ADMIN_EMAIL = "discover@discovermagazines.co.uk";
const CC = ["discover@discovermagazines.co.uk"];

type NotificationType =
  | "claim_submitted_admin"
  | "claim_approved_customer"
  | "claim_rejected_customer"
  | "removal_submitted_admin"
  | "removal_approved_customer";

interface Payload {
  type: NotificationType;
  claim_id?: string;
  removal_request_id?: string;
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function applyTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value ?? "");
  }
  return result;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrap(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" style="border-collapse:collapse;"><tr><td align="center" style="padding:32px 0;">
<table role="presentation" width="600" style="width:600px;max-width:100%;border-collapse:collapse;background:#ffffff;border-radius:8px;overflow:hidden;">
<tr><td style="background:#166534;padding:28px 32px;"><h1 style="color:#ffffff;margin:0;font-size:22px;">${title}</h1></td></tr>
<tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.65;">${bodyHtml}</td></tr>
<tr><td style="background:#f9fafb;padding:22px 32px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-align:center;">
Discover Magazine &middot; accounts@discovermagazines.co.uk &middot; 023 8001 0123
</td></tr></table></td></tr></table></body></html>`;
}

async function fetchTemplate(name: string) {
  const { data } = await admin
    .from("email_templates")
    .select("subject, html_body")
    .eq("name", name)
    .maybeSingle();
  return data ?? null;
}

async function logSend(entry: {
  template_name: string;
  recipient_email: string;
  recipient_type: string;
  status: string;
  provider_message_id?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await admin.from("email_send_log").insert({
    template_name: entry.template_name,
    recipient_email: entry.recipient_email,
    recipient_type: entry.recipient_type,
    status: entry.status,
    provider_message_id: entry.provider_message_id ?? null,
    error_message: entry.error_message ?? null,
    metadata: entry.metadata ?? {},
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as Payload;
    const type = payload?.type;
    const allowed: NotificationType[] = [
      "claim_submitted_admin",
      "claim_approved_customer",
      "claim_rejected_customer",
      "removal_submitted_admin",
      "removal_approved_customer",
    ];
    if (!type || !allowed.includes(type)) {
      return new Response(JSON.stringify({ error: "Unknown notification type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipient = "";
    let recipientType = "customer";
    let subject = "";
    let bodyHtml = "";
    let vars: Record<string, string> = {};

    if (type.startsWith("claim_")) {
      if (!payload.claim_id) throw new Error("claim_id is required");
      const { data: claim } = await admin
        .from("business_claim_requests")
        .select("id, status, admin_notes, verification_method, verification_notes, user_id, business_id")
        .eq("id", payload.claim_id)
        .maybeSingle();
      if (!claim) throw new Error("Claim request not found");

      const { data: business } = await admin
        .from("businesses")
        .select("name, slug")
        .eq("id", claim.business_id)
        .maybeSingle();
      const { data: userRes } = await admin.auth.admin.getUserById(claim.user_id);
      const claimantEmail = userRes?.user?.email ?? "";

      vars = {
        business_name: escapeHtml(business?.name ?? "a listing"),
        business_slug: business?.slug ?? "",
        claimant_email: escapeHtml(claimantEmail),
        verification_method: escapeHtml(claim.verification_method ?? "-"),
        verification_notes: escapeHtml(claim.verification_notes ?? "-"),
        admin_notes: escapeHtml(claim.admin_notes ?? ""),
      };

      if (type === "claim_submitted_admin") {
        recipient = ADMIN_EMAIL;
        recipientType = "admin";
        subject = `New listing claim: ${business?.name ?? "Unknown listing"}`;
        bodyHtml = wrap(
          "New listing claim",
          `<p><strong>${vars.business_name}</strong> has been claimed by ${vars.claimant_email}.</p>
           <p><strong>Verification method:</strong> ${vars.verification_method}</p>
           <p><strong>Notes:</strong> ${vars.verification_notes}</p>
           <p>Review it in the admin dashboard under Claim Requests.</p>`,
        );
      } else if (type === "claim_approved_customer") {
        recipient = claimantEmail;
        subject = `Your listing claim has been approved — ${business?.name ?? ""}`;
        bodyHtml = wrap(
          "Your claim has been approved",
          `<p>Good news — you are now the verified owner of <strong>${vars.business_name}</strong> in the Discover directory.</p>
           <p>Sign in to your dashboard to edit your listing, add photos and add up to two keywords so local customers can find you.</p>
           <p><a href="https://discovermagazines.co.uk/dashboard" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;">Go to your dashboard</a></p>`,
        );
      } else {
        recipient = claimantEmail;
        subject = `An update on your listing claim — ${business?.name ?? ""}`;
        bodyHtml = wrap(
          "An update on your claim",
          `<p>Thank you for your claim on <strong>${vars.business_name}</strong>. We were not able to approve it at this time.</p>
           ${vars.admin_notes ? `<p><strong>Reason:</strong> ${vars.admin_notes}</p>` : ""}
           <p>If you believe this is a mistake, reply to this email or call us on 023 8001 0123.</p>`,
        );
      }
    } else {
      if (!payload.removal_request_id) throw new Error("removal_request_id is required");
      const { data: request } = await admin
        .from("business_removal_requests")
        .select("id, status, admin_notes, requester_name, requester_email, relationship, reason, business_id")
        .eq("id", payload.removal_request_id)
        .maybeSingle();
      if (!request) throw new Error("Removal request not found");

      const { data: business } = await admin
        .from("businesses")
        .select("name, slug")
        .eq("id", request.business_id)
        .maybeSingle();

      vars = {
        business_name: escapeHtml(business?.name ?? "a listing"),
        requester_name: escapeHtml(request.requester_name),
        requester_email: escapeHtml(request.requester_email),
        relationship: escapeHtml(request.relationship ?? "-"),
        reason: escapeHtml(request.reason),
      };

      if (type === "removal_submitted_admin") {
        recipient = ADMIN_EMAIL;
        recipientType = "admin";
        subject = `Listing removal request: ${business?.name ?? "Unknown listing"}`;
        bodyHtml = wrap(
          "Listing removal request",
          `<p><strong>${vars.business_name}</strong> has a removal request.</p>
           <p><strong>From:</strong> ${vars.requester_name} (${vars.requester_email})</p>
           <p><strong>Relationship:</strong> ${vars.relationship}</p>
           <p><strong>Reason:</strong> ${vars.reason}</p>
           <p>Review it in the admin dashboard under Claim Requests &rsaquo; Removals.</p>`,
        );
      } else {
        recipient = request.requester_email;
        subject = `Listing removed — ${business?.name ?? ""}`;
        bodyHtml = wrap(
          "The listing has been removed",
          `<p>Thank you for getting in touch. <strong>${vars.business_name}</strong> has been removed from the Discover directory and will not be reinstated by future data imports.</p>
           <p>If anything still appears online after a short delay, reply to this email and we will look into it.</p>`,
        );
      }
    }

    if (!recipient) throw new Error("No recipient email available for this notification");

    const templateName = `directory_${type}`;
    const template = await fetchTemplate(templateName);
    if (template) {
      subject = applyTemplate(template.subject, vars);
      bodyHtml = applyTemplate(template.html_body, vars);
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [recipient],
      cc: recipientType === "admin" ? undefined : CC,
      subject,
      html: bodyHtml,
    });

    if (error) {
      await logSend({
        template_name: templateName,
        recipient_email: recipient,
        recipient_type: recipientType,
        status: "failed",
        error_message: String((error as { message?: string }).message ?? error),
        metadata: { type, claim_id: payload.claim_id, removal_request_id: payload.removal_request_id },
      });
      throw new Error(String((error as { message?: string }).message ?? "Email send failed"));
    }

    await logSend({
      template_name: templateName,
      recipient_email: recipient,
      recipient_type: recipientType,
      status: "sent",
      provider_message_id: data?.id ?? null,
      metadata: { type, claim_id: payload.claim_id, removal_request_id: payload.removal_request_id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-directory-notification error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});