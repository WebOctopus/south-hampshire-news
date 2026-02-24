/**
 * Builds a clean, flat CRM-friendly webhook payload.
 * Resolves all UUIDs to human-readable names client-side
 * using lookup data already loaded from React Query caches.
 */

import { format } from 'date-fns';

interface AreaLookup {
  id: string;
  name: string;
  circulation?: number;
  bimonthly_circulation?: number;
  schedule?: any;
}

interface AdSizeLookup {
  id: string;
  name: string;
}

interface DurationLookup {
  id: string;
  name: string;
}

interface PaymentOptionLookup {
  id: string;
  display_name: string;
}

interface CrmLookups {
  areas?: AreaLookup[];
  adSizes?: AdSizeLookup[];
  durations?: DurationLookup[];
  subscriptionDurations?: DurationLookup[];
  paymentOptions?: PaymentOptionLookup[];
  leafletAreas?: AreaLookup[];
}

function resolveAreaName(id: string, lookups: CrmLookups): string {
  return lookups.areas?.find(a => a.id === id)?.name
    ?? lookups.leafletAreas?.find(a => a.id === id)?.name
    ?? id;
}

function resolveAdSizeName(id: string | undefined | null, lookups: CrmLookups): string | undefined {
  if (!id) return undefined;
  return lookups.adSizes?.find(a => a.id === id)?.name ?? id;
}

function resolveDurationName(id: string | undefined | null, lookups: CrmLookups): string | undefined {
  if (!id) return undefined;
  return lookups.durations?.find(d => d.id === id)?.name
    ?? lookups.subscriptionDurations?.find(d => d.id === id)?.name
    ?? id;
}

function resolvePaymentOptionName(id: string | undefined | null, lookups: CrmLookups): string | undefined {
  if (!id) return undefined;
  return lookups.paymentOptions?.find(p => p.id === id)?.display_name ?? id;
}

function getJourneyTag(pricingModel: string): string {
  switch (pricingModel) {
    case 'fixed': return 'Fixed Term';
    case 'bogof': return '3+ Repeat Package';
    case 'leafleting': return 'Leafleting Service';
    default: return 'General Inquiry';
  }
}

/** Format a date string as "DD Mon YYYY" */
function formatDateHuman(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

/** Format a month value as "February 2026" */
function formatMonthHuman(month: string | undefined | null, year?: string | number | null): string {
  if (!month) return '';
  // Handle "YYYY-MM" format (e.g. "2026-02")
  const yymm = month.match(/^(\d{4})-(\d{2})$/);
  if (yymm) {
    try {
      return format(new Date(Number(yymm[1]), Number(yymm[2]) - 1, 1), 'MMMM yyyy');
    } catch {
      return month;
    }
  }
  // If it's already a month name like "February", append year if available
  if (year) return `${month} ${year}`;
  return month;
}

/** Build the areas array from pricing breakdown */
function buildAreasArray(pricingBreakdown: any, adSizeName: string | undefined, lookups: CrmLookups): any[] {
  if (!pricingBreakdown?.areaBreakdown || !Array.isArray(pricingBreakdown.areaBreakdown)) return [];

  return pricingBreakdown.areaBreakdown.map((entry: any) => {
    const areaName = entry.area?.name
      ?? (entry.areaId ? resolveAreaName(entry.areaId, lookups) : undefined)
      ?? entry.area_name
      ?? 'Unknown Area';

    const circulation = entry.area?.circulation
      ?? entry.area?.bimonthly_circulation
      ?? entry.circulation
      ?? 0;

    return {
      name: areaName,
      ad_size: adSizeName ?? entry.ad_size ?? undefined,
      base_price: entry.basePrice ?? entry.base_price ?? entry.multipliedPrice ?? 0,
      circulation,
    };
  });
}

/** Build the schedule array from area breakdown schedule data */
function buildScheduleArray(pricingBreakdown: any, lookups: CrmLookups): any[] {
  if (!pricingBreakdown?.areaBreakdown || !Array.isArray(pricingBreakdown.areaBreakdown)) return [];

  // Collect unique schedule entries from the first area that has them
  for (const entry of pricingBreakdown.areaBreakdown) {
    const schedule = entry.area?.schedule || entry.schedule;
    if (schedule && typeof schedule === 'object') {
      // Schedule can be an object with month keys or an array
      const entries = Array.isArray(schedule) ? schedule : Object.values(schedule);
      if (entries.length > 0) {
        return entries
          .filter((s: any) => s && typeof s === 'object')
          .map((s: any) => ({
            month: formatMonthHuman(s.month, s.year) || s.label || '',
            copy_deadline: formatDateHuman(s.copy_deadline || s.copyDeadline),
            delivery_date: formatDateHuman(s.delivery_date || s.deliveryDate),
          }));
      }
    }
  }

  return [];
}

interface RawWebhookData {
  record_type: 'quote' | 'booking';
  pricing_model: string;
  contact_name?: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status?: string;
  // These may be UUIDs or already resolved
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
  agency_discount_percent?: number;
  pricing_breakdown?: any;
  selections?: any;
  [key: string]: any;
}

/**
 * Main builder — takes raw data + lookup arrays,
 * returns a clean, flat CRM-ready payload.
 */
export function buildCrmWebhookPayload(raw: RawWebhookData, lookups: CrmLookups): Record<string, any> {
  // Parse contact name
  const nameParts = (raw.contact_name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Resolve ad size and duration names
  const adSizeName = raw.ad_size || resolveAdSizeName(raw.selections?.selectedAdSize || raw.selections?.adSize, lookups);
  const durationName = raw.duration || resolveDurationName(raw.selections?.selectedDuration || raw.selections?.duration, lookups);

  // Build areas array from pricing breakdown
  const areasArray = buildAreasArray(raw.pricing_breakdown, adSizeName, lookups);

  // Build schedule
  const schedule = buildScheduleArray(raw.pricing_breakdown, lookups);

  // Resolve payment option
  const paymentOption = resolvePaymentOptionName(
    raw.selections?.payment_option_id || raw.selections?.selectedPaymentOption,
    lookups
  );

  // Build the flat payload
  const payload: Record<string, any> = {
    record_type: raw.record_type,
    journey_tag: getJourneyTag(raw.pricing_model),
    email: raw.email,
    first_name: firstName,
    last_name: lastName,
    phone: raw.phone || '',
    company: raw.company || '',
    title: raw.title || '',
    status: raw.status || 'draft',
    pricing_model: raw.pricing_model,
    ad_size: adSizeName,
    duration: durationName,
    subtotal: Number(raw.subtotal) || 0,
    final_total: Number(raw.final_total) || 0,
    monthly_price: Number(raw.monthly_price) || 0,
    total_circulation: Number(raw.total_circulation) || 0,
    areas: areasArray,
    schedule,
    discounts: {
      agency_discount_percent: Number(raw.agency_discount_percent || raw.pricing_breakdown?.agencyDiscountPercent) || 0,
      volume_discount_percent: Number(raw.volume_discount_percent || raw.pricing_breakdown?.volumeDiscountPercent) || 0,
      duration_discount_percent: Number(raw.duration_discount_percent || raw.pricing_breakdown?.durationDiscountPercent) || 0,
    },
    source: 'advertising_calculator',
    submitted_at: new Date().toISOString(),
  };

  // Add payment option only if present
  if (paymentOption) {
    payload.payment_option = paymentOption;
  }

  // Add BOGOF fields only when model is bogof and arrays have values
  if (raw.pricing_model === 'bogof') {
    const paidAreas = (raw.bogof_paid_areas || []).map(id => resolveAreaName(id, lookups));
    const freeAreas = (raw.bogof_free_areas || []).map(id => resolveAreaName(id, lookups));
    if (paidAreas.length > 0) payload.bogof_paid_areas = paidAreas;
    if (freeAreas.length > 0) payload.bogof_free_areas = freeAreas;
  }

  // Include design fee if present
  if (raw.pricing_breakdown?.designFee) {
    payload.design_fee = raw.pricing_breakdown.designFee;
  }

  return payload;
}

/**
 * @deprecated Use buildCrmWebhookPayload instead. Kept for backward compatibility.
 */
export function resolveWebhookPayload(payload: any, lookups: any): any {
  return buildCrmWebhookPayload(payload, lookups);
}
