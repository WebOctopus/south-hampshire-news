// Row parsing / mapping shared by the validate and commit passes.

export type CSVRow = Record<string, string | undefined>;

export const normaliseKey = (s: string) =>
  s.replace(/^\ufeff/, "").toLowerCase().trim().replace(/[\s_\-]+/g, " ").replace(/\s+/g, " ");

export const FIELD_ALIASES: Record<string, string[]> = {
  crm_company_id: ["crm company id", "company id", "crm id", "record id", "mirola company id"],
  name: ["name", "company name", "business name", "trading name"],
  email: ["email", "company email", "email address"],
  phone: ["phone number", "phone", "telephone", "tel", "mobile"],
  website: ["website", "company domain name", "domain", "url"],
  address_line1: ["address line 1", "street address", "address", "address 1"],
  address_line2: ["address line 2", "street address 2", "address 2"],
  city: ["city", "town"],
  postcode: ["postal code", "postcode", "post code", "zip", "zip code"],
  logo_url: ["logo url", "logo", "company logo"],
  description: ["description from linkedin", "description (from linkedin)", "about", "description"],
  facebook_url: ["facebook company page", "facebook", "facebook url"],
  instagram_url: ["instagram", "instagram url"],
  twitter_url: ["twitter", "twitter url", "x"],
  linkedin_url: ["linkedin company page", "linkedin", "linkedin url"],
  keywords: ["directory keywords", "keywords"],
  local_edition: ["local edition", "14 editions local", "14 editions - local"],
  tags: ["tags", "tag"],
};

// Fields an owner may maintain themselves. When owner_id is set these are not
// overwritten — the incoming CRM value is recorded as a conflict instead.
export const OWNER_HELD_FIELDS = [
  "description",
  "phone",
  "email",
  "website",
  "logo_url",
  "facebook_url",
  "instagram_url",
  "twitter_url",
  "linkedin_url",
] as const;

export const PLAIN_FIELDS = [
  "name",
  "address_line1",
  "address_line2",
  "city",
  "postcode",
] as const;

export function buildNormMap(row: CSVRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(row)) out[normaliseKey(k)] = (row[k] ?? "") as string;
  return out;
}

export function pick(norm: Record<string, string>, aliases: string[]): string {
  for (const a of aliases) {
    const v = norm[normaliseKey(a)];
    if (v !== undefined && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

export const splitList = (v: string) =>
  (v || "").split(";").map((s) => s.trim()).filter((s) => s.length > 0);

/** Directory keywords are comma-delimited; semicolons appear in one legacy value. */
export const splitKeywordList = (v: string) =>
  (v || "").split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 0);

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function normaliseWebsite(v: string): string | null {
  const t = (v || "").trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export interface AreaRef {
  area_code: number;
  internal_name: string;
  is_active: boolean;
}

/** Resolve a single area token to an in-scope (1-14) area code, or null. */
export function resolveAreaToken(token: string, areas: AreaRef[]): number | null {
  const t = token.toLowerCase().trim();
  if (!t) return null;
  const m = t.match(/(?:^|\barea\s*)(\d{1,2})\b/);
  if (m) {
    const code = parseInt(m[1], 10);
    const hit = areas.find((a) => a.area_code === code);
    return hit && hit.is_active ? code : null;
  }
  // Fall back to matching against the internal name
  const stripped = t.replace(/^area\s*/, "");
  const hit = areas.find(
    (a) => a.is_active && a.internal_name.toLowerCase().includes(stripped) && stripped.length >= 4,
  );
  return hit ? hit.area_code : null;
}

export interface ParsedRow {
  rowNumber: number;
  crmId: string;
  name: string;
  fields: Record<string, string | null>;
  areaCodes: number[];
  discardedAreaTokens: string[];
  keywords: string[];
  rejectReason: string | null;
}

export function parseRow(row: CSVRow, rowNumber: number, areas: AreaRef[]): ParsedRow {
  const norm = buildNormMap(row);
  const crmId = pick(norm, FIELD_ALIASES.crm_company_id);
  const name = pick(norm, FIELD_ALIASES.name);

  const fields: Record<string, string | null> = {};
  for (const f of PLAIN_FIELDS) fields[f] = pick(norm, FIELD_ALIASES[f]) || null;
  for (const f of OWNER_HELD_FIELDS) {
    const raw = pick(norm, FIELD_ALIASES[f]);
    fields[f] = f === "website" ? normaliseWebsite(raw) : raw || null;
  }

  // ---- Areas: Local Edition is primary, Tags is fallback. Resolution is per token.
  const tagsRaw = pick(norm, FIELD_ALIASES.tags);
  const tagTokens = splitList(tagsRaw);
  const localEdition = pick(norm, FIELD_ALIASES.local_edition);
  const areaTokens = localEdition
    ? splitList(localEdition)
    : tagTokens.filter((t) => /^area\b/i.test(t));

  const areaCodes: number[] = [];
  const discardedAreaTokens: string[] = [];
  for (const token of areaTokens) {
    const code = resolveAreaToken(token, areas);
    if (code === null) discardedAreaTokens.push(token);
    else if (!areaCodes.includes(code)) areaCodes.push(code);
  }

  // ---- Keywords: Directory keywords primary, BIZ/BZ tags fallback.
  const directoryKeywords = splitList(pick(norm, FIELD_ALIASES.keywords));
  const fallbackKeywords = tagTokens
    .filter((t) => /^(biz|bz)\s+/i.test(t))
    .map((t) => t.replace(/^(biz|bz)\s+/i, "").trim())
    .filter(Boolean);
  const keywordSource = directoryKeywords.length > 0 ? directoryKeywords : fallbackKeywords;
  const seenKw = new Set<string>();
  const keywords: string[] = [];
  for (const k of keywordSource) {
    const key = k.toLowerCase();
    if (!seenKw.has(key)) {
      seenKw.add(key);
      keywords.push(k);
    }
  }

  let rejectReason: string | null = null;
  if (!crmId) rejectReason = "Blank CRM company ID";
  else if (!name) rejectReason = "Blank company name";
  else if (areaCodes.length === 0) {
    rejectReason = areaTokens.length === 0
      ? "No area supplied (Local Edition and Tags both empty)"
      : `No in-scope area — all tokens out of scope: ${areaTokens.join("; ")}`;
  }

  return {
    rowNumber,
    crmId,
    name,
    fields,
    areaCodes,
    discardedAreaTokens,
    keywords,
    rejectReason,
  };
}

export const normaliseTerm = (t: string) =>
  t.toLowerCase().trim().replace(/\s+/g, " ");