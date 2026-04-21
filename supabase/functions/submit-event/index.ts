import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TURNSTILE_SITE_KEY = Deno.env.get("TURNSTILE_SITE_KEY") ?? "";
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";

const SPAM_KEYWORDS = [
  "viagra", "cialis", "casino", "poker", "crypto airdrop", "bitcoin doubler",
  "seo services", "buy backlinks", "escort", "replica watches", "loan offer",
  "forex signals", "binary options", "weight loss pill", "cbd gummies",
  "porn", "xxx", "hookup", "onlyfans leak",
];
const SPAM_TLDS = [".xyz", ".top", ".click", ".work", ".loan", ".gq", ".tk", ".ml", ".cf"];
const URL_REGEX = /https?:\/\/[^\s]+/gi;
const NON_LATIN_REGEX = /[\u0400-\u04FF\u0500-\u052F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;

const BodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  organizer: z.string().trim().min(1).max(200),
  date: z.string().min(1),
  date_end: z.string().nullable().optional(),
  time: z.string().min(1),
  end_time: z.string().nullable().optional(),
  location: z.string().trim().min(1).max(300),
  area: z.string().trim().min(1).max(100),
  postcode: z.string().nullable().optional(),
  category: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(100),
  excerpt: z.string().nullable().optional(),
  full_description: z.string().nullable().optional(),
  ticket_url: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal("")),
  contact_phone: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  turnstileToken: z.string().min(1, "Captcha required"),
  honeypot: z.string().optional().default(""),
  formLoadedAt: z.number().int().positive(),
});

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function logSubmission(
  admin: ReturnType<typeof createClient>,
  ipHash: string,
  userAgent: string | null,
  blockedReason: string | null,
) {
  try {
    await admin.from("event_submission_log").insert({
      ip_hash: ipHash,
      user_agent: userAgent,
      blocked_reason: blockedReason,
    });
  } catch (e) {
    console.error("Failed to log submission:", e);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Public config endpoint — returns the Turnstile site key for the frontend to render the widget
  if (req.method === "GET") {
    return jsonResponse({ siteKey: TURNSTILE_SITE_KEY });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = req.headers.get("user-agent");
  const dailySalt = new Date().toISOString().slice(0, 10);
  const ipHash = await sha256(`${ip}|${dailySalt}`);

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Invalid submission", details: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    body = parsed.data;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  // 2. Honeypot — silent fake-success
  if (body.honeypot && body.honeypot.trim().length > 0) {
    await logSubmission(admin, ipHash, userAgent, "honeypot");
    return jsonResponse({ success: true, eventId: crypto.randomUUID() });
  }

  // 3. Timing — silent fake-success
  const elapsed = Date.now() - body.formLoadedAt;
  if (elapsed < 3000) {
    await logSubmission(admin, ipHash, userAgent, "too_fast");
    return jsonResponse({ success: true, eventId: crypto.randomUUID() });
  }

  // 4. Turnstile siteverify
  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: body.turnstileToken,
          remoteip: ip,
        }),
      },
    );
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      console.warn("Turnstile failed:", verifyData["error-codes"]);
      await logSubmission(admin, ipHash, userAgent, "turnstile_failed");
      return jsonResponse(
        { error: "Captcha verification failed. Please try again." },
        403,
      );
    }
  } catch (e) {
    console.error("Turnstile siteverify error:", e);
    await logSubmission(admin, ipHash, userAgent, "turnstile_error");
    return jsonResponse({ error: "Captcha verification error" }, 503);
  }

  // 5. Content heuristics
  const haystack = [body.title, body.excerpt ?? "", body.full_description ?? ""].join(" ");
  const lower = haystack.toLowerCase();
  const urls = haystack.match(URL_REGEX) ?? [];

  const reasons: string[] = [];
  if (urls.length > 3) reasons.push("too_many_urls");
  if (SPAM_TLDS.some((tld) => lower.includes(tld))) reasons.push("spam_tld");
  if (NON_LATIN_REGEX.test(body.title)) reasons.push("non_latin_title");
  if (SPAM_KEYWORDS.some((kw) => lower.includes(kw))) reasons.push("spam_keyword");

  if (reasons.length > 0) {
    await logSubmission(admin, ipHash, userAgent, `content:${reasons.join(",")}`);
    return jsonResponse(
      { error: "We couldn't accept this submission. Please review and try again." },
      400,
    );
  }

  // 6. Duplicate guard — same title + date + location in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: dupes } = await admin
    .from("events")
    .select("id")
    .eq("title", body.title)
    .eq("date", body.date)
    .eq("location", body.location)
    .gte("created_at", sevenDaysAgo)
    .limit(1);
  if (dupes && dupes.length > 0) {
    await logSubmission(admin, ipHash, userAgent, "duplicate");
    return jsonResponse(
      { error: "This event already appears to have been submitted recently." },
      409,
    );
  }

  // 7. Rate limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: hourCount } = await admin
    .from("event_submission_log")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);
  const { count: dayCount } = await admin
    .from("event_submission_log")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneDayAgo);

  if ((hourCount ?? 0) >= 5 || (dayCount ?? 0) >= 15) {
    await logSubmission(admin, ipHash, userAgent, "rate_limit");
    return jsonResponse(
      { error: "Too many submissions from your network. Please try again later." },
      429,
    );
  }

  // 8. Insert event (forced safe defaults)
  const eventInsert = {
    title: body.title,
    description: body.excerpt ?? null,
    excerpt: body.excerpt ?? null,
    full_description: body.full_description ?? null,
    date: body.date,
    date_end: body.date_end ?? null,
    time: body.time,
    end_time: body.end_time ?? null,
    location: body.location,
    area: body.area,
    postcode: body.postcode ?? null,
    category: body.category,
    type: body.type,
    organizer: body.organizer,
    contact_email: body.contact_email || null,
    contact_phone: body.contact_phone ?? null,
    ticket_url: body.ticket_url ?? null,
    website_url: body.website_url ?? null,
    image: body.image ?? null,
    is_published: false,
    featured: false,
    links: [],
    user_id: null,
  };

  const { data: inserted, error: insertError } = await admin
    .from("events")
    .insert([eventInsert])
    .select("id, slug")
    .single();

  if (insertError) {
    console.error("Insert event error:", insertError);
    await logSubmission(admin, ipHash, userAgent, "insert_error");
    return jsonResponse({ error: "Could not save your event. Please try again." }, 500);
  }

  // 9. Log accepted
  await logSubmission(admin, ipHash, userAgent, null);

  // 10. Fire-and-forget admin notification
  admin.functions
    .invoke("send-event-notification", {
      body: {
        event_id: inserted.id,
        slug: inserted.slug,
        title: body.title,
        date: body.date,
        time: body.time,
        location: body.location,
        area: body.area,
        category: body.category,
        type: body.type,
        organizer: body.organizer,
        contact_email: body.contact_email || undefined,
        contact_phone: body.contact_phone || undefined,
        excerpt: body.excerpt || undefined,
      },
    })
    .catch((err) => console.error("Notification error:", err));

  return jsonResponse({ success: true, eventId: inserted.id, slug: inserted.slug });
});