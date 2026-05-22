// Helpers for the directory: favicon fallback for the business icon tile
// and an "is the business open now?" computation for the opening hours card.

export function getFaviconUrl(website?: string | null, size = 128): string | null {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (!host) return null;
    const sz = Math.min(256, Math.max(size, 256));
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${sz}`;
  } catch {
    return null;
  }
}

export function getBusinessIconUrl(
  business: { logo_url?: string | null; website?: string | null } | null | undefined,
  size = 128
): string | null {
  if (!business) return null;
  if (business.logo_url) return business.logo_url;
  return getFaviconUrl(business.website, size);
}

// Opening hours: accepts either { monday: "9am - 5pm" } strings or
// { monday: { open: "09:00", close: "17:00", closed?: boolean } }
const DAY_KEYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

function parseTime(value: string): number | null {
  // Returns minutes since midnight, or null if unparseable.
  if (!value) return null;
  const trimmed = value.trim().toLowerCase().replace(/\s+/g, '');
  const m = trimmed.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3];
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return h * 60 + min;
}

export function isOpenNow(
  openingHours: any,
  now: Date = new Date()
): boolean {
  if (!openingHours || typeof openingHours !== 'object') return false;
  const key = DAY_KEYS[now.getDay()];
  const entry = openingHours[key] ?? openingHours[key?.toUpperCase?.()];
  if (!entry) return false;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  if (typeof entry === 'string') {
    const s = entry.trim().toLowerCase();
    if (!s || s.includes('closed')) return false;
    // "8am - 5pm" or "08:00 - 17:00"
    const parts = s.split(/[-–—to]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length !== 2) return false;
    const open = parseTime(parts[0]);
    const close = parseTime(parts[1]);
    if (open == null || close == null) return false;
    return nowMin >= open && nowMin < close;
  }
  if (typeof entry === 'object') {
    if (entry.closed) return false;
    const open = parseTime(entry.open || entry.from || '');
    const close = parseTime(entry.close || entry.to || '');
    if (open == null || close == null) return false;
    return nowMin >= open && nowMin < close;
  }
  return false;
}

export function formatAddress(b: {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postcode?: string | null;
}): string {
  return [b.address_line1, b.address_line2, b.city, b.postcode]
    .filter((p) => p && String(p).trim().length > 0)
    .join(', ');
}