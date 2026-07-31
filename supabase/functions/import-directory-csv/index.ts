import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  type AreaRef,
  type CSVRow,
  normaliseTerm,
  OWNER_HELD_FIELDS,
  parseRow,
  type ParsedRow,
  PLAIN_FIELDS,
  slugify,
} from "./parse.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEACTIVATION_THRESHOLD = 0.2; // 20% of currently active listings

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface RequestBody {
  mode: "validate" | "commit" | "deactivate";
  rows?: CSVRow[];
  batchIndex?: number;
  totalBatches?: number;
  totalRows?: number;
  rowOffset?: number;
  importRunId?: string;
  isFinal?: boolean;
  forceDeactivate?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // ---- Admin check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Invalid token" }, 401);

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Admin access required" }, 403);

    const body: RequestBody = await req.json();
    const { mode } = body;

    // ---- Reference data
    const { data: areaRows } = await supabase
      .from("directory_areas")
      .select("area_code, internal_name, is_active");
    const areas = (areaRows || []) as AreaRef[];

    if (mode === "validate") return await handleValidate(supabase, body, areas, user.id);
    if (mode === "commit") return await handleCommit(supabase, body, areas);
    if (mode === "deactivate") return await handleDeactivate(supabase, body);

    return json({ error: "Unknown mode" }, 400);
  } catch (error) {
    console.error("import-directory-csv error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});

// ---------------------------------------------------------------- helpers

const PAGE = 1000;

/**
 * PostgREST caps a plain .select() at 1,000 rows, and a .limit() above the
 * server's max-rows setting is silently clamped. Any unbounded read must page.
 */
async function selectAllPaged<T = any>(
  build: () => any,
  orderColumn = "id",
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build()
      .order(orderColumn, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data || []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

async function loadExistingByCrmId(supabase: any, crmIds: string[]) {
  const map = new Map<string, any>();
  // Bounded by batch size: 200 ids per request, so a response can never
  // reach the 1,000-row cap.
  for (let i = 0; i < crmIds.length; i += 200) {
    const chunk = crmIds.slice(i, i + 200);
    const { data, error } = await supabase
      .from("businesses")
      .select(
        "id, crm_company_id, owner_id, suppressed, slug, is_active, " +
          OWNER_HELD_FIELDS.join(", "),
      )
      .in("crm_company_id", chunk);
    if (error) throw error;
    for (const r of data || []) map.set(r.crm_company_id, r);
  }
  return map;
}

function parseBatch(body: RequestBody, areas: AreaRef[]): ParsedRow[] {
  const rows = body.rows || [];
  const offset = body.rowOffset ?? (body.batchIndex ?? 0) * rows.length;
  return rows.map((r, i) => parseRow(r, offset + i + 2, areas)); // +2 = header + 1-based
}

// ---------------------------------------------------------------- slugs

/** Existing slugs that could collide with this batch's candidate bases. */
async function loadSlugPool(supabase: any, bases: string[]): Promise<Set<string>> {
  const pool = new Set<string>();
  if (bases.length === 0) return pool;

  for (let i = 0; i < bases.length; i += 100) {
    const slice = bases.slice(i, i + 100);
    const { data, error } = await supabase.from("businesses").select("slug").in("slug", slice);
    if (error) throw error;
    (data || []).forEach((r: any) => r.slug && pool.add(r.slug));
  }

  // Suffixed variants (base-city, base-2, ...) in small groups so the
  // generated filter string stays short.
  for (let i = 0; i < bases.length; i += 25) {
    const slice = bases.slice(i, i + 25);
    const filter = slice.map((s) => `slug.like.${s}-*`).join(",");
    const { data, error } = await supabase.from("businesses").select("slug").or(filter);
    if (error) throw error;
    (data || []).forEach((r: any) => r.slug && pool.add(r.slug));
  }

  return pool;
}

/** Insert-only slug generation: base, then base-city, then base-city-2, ... */
function nextFreeSlug(p: ParsedRow, taken: Set<string>): string {
  const base = slugify(p.name) || "business";
  if (!taken.has(base)) return base;
  const citySlug = slugify(p.fields.city || "");
  const withCity = citySlug ? `${base}-${citySlug}` : base;
  if (!taken.has(withCity)) return withCity;
  let n = 2;
  while (taken.has(`${withCity}-${n}`)) n++;
  return `${withCity}-${n}`;
}

function isSlugConflict(error: any): boolean {
  return error?.code === "23505" &&
    `${error?.message ?? ""} ${error?.details ?? ""}`.includes("slug");
}

/**
 * Upsert a chunk; if a slug unique violation slips through (a concurrent or
 * otherwise unseen slug), fall back to per-row upserts and regenerate the
 * slug for the offending row rather than failing the whole batch.
 */
async function upsertWithSlugRetry(
  supabase: any,
  payload: Record<string, unknown>[],
  chunk: ParsedRow[],
  taken: Set<string>,
): Promise<{ id: string; crm_company_id: string }[]> {
  const { data, error } = await supabase
    .from("businesses")
    .upsert(payload, { onConflict: "crm_company_id" })
    .select("id, crm_company_id");
  if (!error) return data || [];
  if (!isSlugConflict(error)) throw error;

  const out: { id: string; crm_company_id: string }[] = [];
  for (let i = 0; i < payload.length; i++) {
    const record = { ...payload[i] };
    let attempt = 0;
    for (;;) {
      const { data: rows, error: rowError } = await supabase
        .from("businesses")
        .upsert(record, { onConflict: "crm_company_id" })
        .select("id, crm_company_id");
      if (!rowError) {
        if (rows?.[0]) out.push(rows[0]);
        break;
      }
      if (!isSlugConflict(rowError) || !record.slug || attempt >= 20) throw rowError;
      taken.add(record.slug as string);
      record.slug = nextFreeSlug(chunk[i], taken);
      taken.add(record.slug as string);
      attempt++;
    }
  }
  return out;
}

// ---------------------------------------------------------------- validate

async function handleValidate(
  supabase: any,
  body: RequestBody,
  areas: AreaRef[],
  userId: string,
) {
  let importRunId = body.importRunId;
  const batchIndex = body.batchIndex ?? 0;

  if (batchIndex === 0 || !importRunId) {
    const { data, error } = await supabase
      .from("business_import_runs")
      .insert({
        total_batches: body.totalBatches ?? 1,
        total_rows: body.totalRows ?? (body.rows?.length ?? 0),
        status: "pending",
        created_by: userId,
      })
      .select("import_run_id")
      .single();
    if (error) throw error;
    importRunId = data.import_run_id;
  }

  const parsed = parseBatch(body, areas);
  const removedRows = parsed.filter((p) => p.removedInCrm);
  const accepted = parsed.filter((p) => !p.removedInCrm && !p.rejectReason);
  const crmIds = accepted.map((p) => p.crmId);
  const existing = await loadExistingByCrmId(supabase, crmIds);

  const rejected = parsed
    .filter((p) => !p.removedInCrm && p.rejectReason)
    .map((p) => ({ row: p.rowNumber, name: p.name || "(no name)", reason: p.rejectReason }));
  const removedSkipped = removedRows.map((p) => ({
    row: p.rowNumber,
    name: p.name || "(no name)",
  }));
  const partiallyResolved: any[] = [];
  const suppressedSkipped: any[] = [];
  const noKeywords: any[] = [];
  const conflicts: any[] = [];
  let toInsert = 0;
  let toUpdate = 0;
  const keywordTerms = new Set<string>();

  for (const p of accepted) {
    const current = existing.get(p.crmId);
    if (current?.suppressed) {
      suppressedSkipped.push({ row: p.rowNumber, name: p.name });
      continue;
    }
    if (current) toUpdate++;
    else toInsert++;

    if (p.discardedAreaTokens.length > 0) {
      partiallyResolved.push({
        row: p.rowNumber,
        name: p.name,
        kept: p.areaCodes,
        discarded: p.discardedAreaTokens,
      });
    }
    if (p.keywords.length === 0) noKeywords.push({ row: p.rowNumber, name: p.name });
    p.keywords.forEach((k) => keywordTerms.add(normaliseTerm(k)));

    if (current?.owner_id) {
      for (const f of OWNER_HELD_FIELDS) {
        const incoming = p.fields[f];
        if (incoming && incoming !== current[f]) {
          conflicts.push({
            row: p.rowNumber,
            name: p.name,
            field: f,
            crm_value: incoming,
            current_value: current[f],
          });
        }
      }
    }
  }

  // Which of these keyword terms are new?
  let newKeywords: string[] = [];
  const terms = [...keywordTerms];
  if (terms.length > 0) {
    const found = new Set<string>();
    for (let i = 0; i < terms.length; i += 200) {
      const { data } = await supabase
        .from("keywords")
        .select("normalised_term")
        .in("normalised_term", terms.slice(i, i + 200));
      (data || []).forEach((k: any) => found.add(k.normalised_term));
    }
    newKeywords = terms.filter((t) => !found.has(t));
  }

  // Record the CRM ids seen in this batch so the deactivation sweep can work
  // out, server-side, which listings were absent from the file.
  await supabase.from("business_import_batches").upsert({
    import_run_id: importRunId,
    batch_index: batchIndex,
    row_count: body.rows?.length ?? 0,
    crm_ids: crmIds,
    status: "pending",
  }, { onConflict: "import_run_id,batch_index" });

  let deactivationPreview: any = null;
  if (body.isFinal) {
    deactivationPreview = await computeDeactivationSet(supabase, importRunId!);
  }

  return json({
    success: true,
    importRunId,
    batchIndex,
    processed: body.rows?.length ?? 0,
    toInsert,
    toUpdate,
    rejected,
    partiallyResolved,
    suppressedSkipped,
    removedSkipped,
    noKeywords,
    newKeywords,
    conflicts,
    deactivationPreview,
  });
}

// ---------------------------------------------------------------- commit

async function handleCommit(supabase: any, body: RequestBody, areas: AreaRef[]) {
  const importRunId = body.importRunId;
  const batchIndex = body.batchIndex ?? 0;
  if (!importRunId) return json({ error: "importRunId is required for commit" }, 400);

  await supabase
    .from("business_import_runs")
    .update({ status: "running" })
    .eq("import_run_id", importRunId);

  const parsed = parseBatch(body, areas);
  const removedCount = parsed.filter((p) => p.removedInCrm).length;
  const accepted = parsed.filter((p) => !p.removedInCrm && !p.rejectReason);
  const crmIds = accepted.map((p) => p.crmId);

  const result = {
    inserted: 0,
    updated: 0,
    rejected: parsed.length - accepted.length - removedCount,
    removedSkipped: removedCount,
    suppressedSkipped: 0,
    conflictsRecorded: 0,
    errors: [] as string[],
  };

  try {
    const existing = await loadExistingByCrmId(supabase, crmIds);

    const toProcess = accepted.filter((p) => !existing.get(p.crmId)?.suppressed);
    result.suppressedSkipped = accepted.length - toProcess.length;

    // Slug pool: bounded by this batch's own candidate bases rather than the
    // whole table, so it cannot be truncated by the 1,000-row cap.
    // Slugs are still generated on insert only.
    const inserts = toProcess.filter((p) => !existing.get(p.crmId));
    const candidateBases = [
      ...new Set(
        inserts.flatMap((p) => {
          const base = slugify(p.name) || "business";
          const citySlug = slugify(p.fields.city || "");
          return citySlug ? [base, `${base}-${citySlug}`] : [base];
        }),
      ),
    ];
    const existingSlugs = await loadSlugPool(supabase, candidateBases);

    const idByCrmId = new Map<string, string>();

    const SUB = 100;
    for (let i = 0; i < toProcess.length; i += SUB) {
      const chunk = toProcess.slice(i, i + SUB);
      const payload = chunk.map((p) => {
        const current = existing.get(p.crmId);
        const record: Record<string, unknown> = {
          crm_company_id: p.crmId,
          is_active: true,
        };
        for (const f of PLAIN_FIELDS) record[f] = p.fields[f];
        for (const f of OWNER_HELD_FIELDS) {
          // Owner-maintained fields are never overwritten on owned listings.
          if (current?.owner_id) continue;
          record[f] = p.fields[f];
        }
        if (current) {
          record.id = current.id;
        } else {
          const candidate = nextFreeSlug(p, existingSlugs);
          existingSlugs.add(candidate);
          record.slug = candidate;
          record.is_verified = false;
        }
        return record;
      });

      const rows = await upsertWithSlugRetry(supabase, payload, chunk, existingSlugs);
      for (const r of rows) idByCrmId.set(r.crm_company_id, r.id);
      for (const p of chunk) {
        if (existing.get(p.crmId)) result.updated++;
        else result.inserted++;
      }
    }

    const businessIds = [...idByCrmId.values()];

    // ---- Areas: replace this business's rows entirely
    if (businessIds.length > 0) {
      for (let i = 0; i < businessIds.length; i += 200) {
        const { error } = await supabase
          .from("business_areas")
          .delete()
          .in("business_id", businessIds.slice(i, i + 200));
        if (error) throw error;
      }
      const areaLinks: any[] = [];
      for (const p of toProcess) {
        const bid = idByCrmId.get(p.crmId);
        if (!bid) continue;
        for (const code of p.areaCodes) areaLinks.push({ business_id: bid, area_code: code });
      }
      for (let i = 0; i < areaLinks.length; i += 500) {
        const { error } = await supabase.from("business_areas").insert(areaLinks.slice(i, i + 500));
        if (error) throw error;
      }
    }

    // ---- Keywords: create missing terms, then replace only source = 'crm' links
    const termMap = new Map<string, string>(); // normalised -> display term
    for (const p of toProcess) {
      for (const k of p.keywords) if (!termMap.has(normaliseTerm(k))) termMap.set(normaliseTerm(k), k);
    }
    const idByTerm = new Map<string, string>();
    const allTerms = [...termMap.keys()];
    for (let i = 0; i < allTerms.length; i += 200) {
      const slice = allTerms.slice(i, i + 200);
      const { data: found } = await supabase
        .from("keywords")
        .select("id, normalised_term")
        .in("normalised_term", slice);
      (found || []).forEach((k: any) => idByTerm.set(k.normalised_term, k.id));
      const missing = slice.filter((t) => !idByTerm.has(t));
      if (missing.length > 0) {
        const { data: created, error } = await supabase
          .from("keywords")
          .upsert(
            missing.map((t) => ({ term: termMap.get(t), normalised_term: t })),
            { onConflict: "normalised_term" },
          )
          .select("id, normalised_term");
        if (error) throw error;
        (created || []).forEach((k: any) => idByTerm.set(k.normalised_term, k.id));
      }
    }

    if (businessIds.length > 0) {
      for (let i = 0; i < businessIds.length; i += 200) {
        const { error } = await supabase
          .from("business_keywords")
          .delete()
          .eq("source", "crm")
          .in("business_id", businessIds.slice(i, i + 200));
        if (error) throw error;
      }
      const kwLinks: any[] = [];
      for (const p of toProcess) {
        const bid = idByCrmId.get(p.crmId);
        if (!bid) continue;
        for (const k of p.keywords) {
          const kid = idByTerm.get(normaliseTerm(k));
          if (kid) kwLinks.push({ business_id: bid, keyword_id: kid, source: "crm" });
        }
      }
      for (let i = 0; i < kwLinks.length; i += 500) {
        const { error } = await supabase
          .from("business_keywords")
          .upsert(kwLinks.slice(i, i + 500), { onConflict: "business_id,keyword_id" });
        if (error) throw error;
      }
    }

    // ---- Conflicts on owner-held fields
    const conflictRows: any[] = [];
    for (const p of toProcess) {
      const current = existing.get(p.crmId);
      if (!current?.owner_id) continue;
      for (const f of OWNER_HELD_FIELDS) {
        const incoming = p.fields[f];
        if (incoming && incoming !== current[f]) {
          conflictRows.push({
            business_id: current.id,
            field_name: f,
            crm_value: incoming,
            current_value: current[f] ?? null,
            import_run_id: importRunId,
            status: "pending",
          });
        }
      }
    }
    if (conflictRows.length > 0) {
      const ids = [...new Set(conflictRows.map((c) => c.business_id))];
      const { data: dismissed } = await supabase
        .from("business_import_conflicts")
        .select("business_id, field_name, crm_value, status")
        .in("business_id", ids);
      const dismissedKey = new Set(
        (dismissed || [])
          .filter((c: any) => c.status === "dismissed")
          .map((c: any) => `${c.business_id}|${c.field_name}|${c.crm_value}`),
      );
      const fresh = conflictRows.filter(
        (c) => !dismissedKey.has(`${c.business_id}|${c.field_name}|${c.crm_value}`),
      );
      // Replace any existing pending row for the same business/field.
      for (const c of fresh) {
        await supabase
          .from("business_import_conflicts")
          .delete()
          .eq("business_id", c.business_id)
          .eq("field_name", c.field_name)
          .eq("status", "pending");
      }
      for (let i = 0; i < fresh.length; i += 200) {
        const { error } = await supabase
          .from("business_import_conflicts")
          .insert(fresh.slice(i, i + 200));
        if (error) throw error;
      }
      result.conflictsRecorded = fresh.length;
    }

    await supabase.from("business_import_batches").upsert({
      import_run_id: importRunId,
      batch_index: batchIndex,
      row_count: body.rows?.length ?? 0,
      crm_ids: crmIds,
      status: "complete",
      error_message: null,
      completed_at: new Date().toISOString(),
    }, { onConflict: "import_run_id,batch_index" });

    return json({ success: true, batchIndex, ...result });
  } catch (err) {
    const message = (err as Error).message;
    console.error(`Batch ${batchIndex} failed:`, message);
    await supabase.from("business_import_batches").upsert({
      import_run_id: importRunId,
      batch_index: batchIndex,
      row_count: body.rows?.length ?? 0,
      crm_ids: crmIds,
      status: "failed",
      error_message: message,
    }, { onConflict: "import_run_id,batch_index" });
    return json({ success: false, batchIndex, error: message, ...result }, 500);
  }
}

// ------------------------------------------------------- deactivation sweep

/** Active, non-suppressed listings whose crm_company_id was absent from the run. */
async function computeDeactivationSet(supabase: any, importRunId: string) {
  const { data: batches } = await supabase
    .from("business_import_batches")
    .select("crm_ids")
    .eq("import_run_id", importRunId);
  const seen = new Set<string>();
  for (const b of batches || []) for (const id of b.crm_ids || []) seen.add(id);

  const { data: active } = await supabase
    .from("businesses")
    .select("id, name, crm_company_id")
    .eq("is_active", true)
    .eq("suppressed", false)
    .limit(20000);

  const activeRows = active || [];
  const targets = activeRows.filter((b: any) => !b.crm_company_id || !seen.has(b.crm_company_id));

  return {
    activeCount: activeRows.length,
    wouldDeactivate: targets.length,
    percent: activeRows.length > 0
      ? Math.round((targets.length / activeRows.length) * 1000) / 10
      : 0,
    thresholdPercent: DEACTIVATION_THRESHOLD * 100,
    exceedsThreshold: activeRows.length > 0 &&
      targets.length > activeRows.length * DEACTIVATION_THRESHOLD,
    sample: targets.slice(0, 25).map((b: any) => b.name),
    ids: targets.map((b: any) => b.id),
  };
}

async function handleDeactivate(supabase: any, body: RequestBody) {
  const importRunId = body.importRunId;
  if (!importRunId) return json({ error: "importRunId is required" }, 400);

  const { data: run } = await supabase
    .from("business_import_runs")
    .select("import_run_id, total_batches")
    .eq("import_run_id", importRunId)
    .maybeSingle();
  if (!run) return json({ error: "Unknown import run" }, 404);

  const { data: batches } = await supabase
    .from("business_import_batches")
    .select("batch_index, status")
    .eq("import_run_id", importRunId);

  // ---- Guard 1: completeness. Never bypassable.
  const byIndex = new Map<number, string>();
  (batches || []).forEach((b: any) => byIndex.set(b.batch_index, b.status));
  const missing: number[] = [];
  const failed: number[] = [];
  for (let i = 0; i < run.total_batches; i++) {
    const status = byIndex.get(i);
    if (status === "failed") failed.push(i);
    else if (status !== "complete") missing.push(i);
  }

  if (missing.length > 0 || failed.length > 0) {
    await supabase
      .from("business_import_runs")
      .update({ status: "failed", deactivation_status: "skipped_incomplete" })
      .eq("import_run_id", importRunId);
    return json({
      success: true,
      deactivated: 0,
      outcome: "skipped_incomplete",
      message:
        "Import incomplete, deactivation skipped. Everything already imported has been saved — re-run the import to complete it.",
      missingBatches: missing,
      failedBatches: failed,
      totalBatches: run.total_batches,
    });
  }

  const preview = await computeDeactivationSet(supabase, importRunId);

  // ---- Guard 2: volume. Overridable with an explicit confirmation.
  if (preview.exceedsThreshold && !body.forceDeactivate) {
    await supabase
      .from("business_import_runs")
      .update({ status: "complete", deactivation_status: "skipped_volume", completed_at: new Date().toISOString() })
      .eq("import_run_id", importRunId);
    return json({
      success: true,
      deactivated: 0,
      outcome: "skipped_volume",
      message:
        `Deactivation would affect ${preview.wouldDeactivate} of ${preview.activeCount} active listings ` +
        `(${preview.percent}%) — above the ${preview.thresholdPercent}% threshold, skipped.`,
      preview: { ...preview, ids: undefined },
    });
  }

  let deactivated = 0;
  for (let i = 0; i < preview.ids.length; i += 200) {
    const chunk = preview.ids.slice(i, i + 200);
    const { error } = await supabase
      .from("businesses")
      .update({ is_active: false })
      .in("id", chunk);
    if (error) throw error;
    deactivated += chunk.length;
  }

  await supabase
    .from("business_import_runs")
    .update({
      status: "complete",
      deactivation_status: body.forceDeactivate ? "forced" : "applied",
      deactivated_count: deactivated,
      completed_at: new Date().toISOString(),
    })
    .eq("import_run_id", importRunId);

  return json({
    success: true,
    deactivated,
    outcome: body.forceDeactivate ? "forced" : "applied",
    message: `${deactivated} listing${deactivated === 1 ? "" : "s"} deactivated.`,
    preview: { ...preview, ids: undefined },
  });
}