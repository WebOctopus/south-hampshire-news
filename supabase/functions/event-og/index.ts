import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.peacockpixelmedia.co.uk";
const FALLBACK_IMAGE = "https://peacockpixelmedia.co.uk/lovable-uploads/discover-logo.png";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimText(input: string, max = 200): string {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.substring(0, max - 1).trimEnd() + "…";
}

function renderHtml(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
}): string {
  const { title, description, image, url } = opts;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);
  const u = escapeHtml(url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t} | Discover Magazine</title>
  <meta name="description" content="${d}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Discover Magazine" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:secure_url" content="${img}" />
  <meta property="og:url" content="${u}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />

  <link rel="canonical" href="${u}" />
  <meta http-equiv="refresh" content="0; url=${u}" />
  <script>window.location.replace(${JSON.stringify(url)});</script>
</head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:40px;">
  <p>Redirecting to <a href="${u}">${t}</a>…</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim();

    if (!slug) {
      const html = renderHtml({
        title: "Discover Magazine",
        description: "What's on across South Hampshire — events, stories and competitions.",
        image: FALLBACK_IMAGE,
        url: `${SITE_URL}/whats-on`,
      });
      return new Response(html, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: event, error } = await supabase
      .from("events")
      .select("title, slug, excerpt, description, image, date, location, area")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("event-og lookup error:", error);
    }

    if (!event) {
      const html = renderHtml({
        title: "Discover Magazine",
        description: "What's on across South Hampshire — events, stories and competitions.",
        image: FALLBACK_IMAGE,
        url: `${SITE_URL}/whats-on`,
      });
      return new Response(html, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const description = trimText(
      event.excerpt || event.description || `${event.location || ""}${event.area ? ", " + event.area : ""}`.trim() || "Event listing on Discover Magazine.",
    );

    const html = renderHtml({
      title: event.title,
      description,
      image: event.image || FALLBACK_IMAGE,
      url: `${SITE_URL}/events/${event.slug}`,
    });

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (err) {
    console.error("event-og error:", err);
    const html = renderHtml({
      title: "Discover Magazine",
      description: "What's on across South Hampshire.",
      image: FALLBACK_IMAGE,
      url: `${SITE_URL}/whats-on`,
    });
    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});