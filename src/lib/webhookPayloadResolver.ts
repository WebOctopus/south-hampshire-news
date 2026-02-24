/**
 * Resolves UUID references in webhook payloads to human-readable names.
 * Called client-side before sending to the edge function, since all lookup
 * data is already loaded from React Query caches.
 */

interface AreaLookup {
  id: string;
  name: string;
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

interface ResolverLookups {
  areas?: AreaLookup[];
  adSizes?: AdSizeLookup[];
  durations?: DurationLookup[];
  subscriptionDurations?: DurationLookup[];
  paymentOptions?: PaymentOptionLookup[];
  leafletAreas?: AreaLookup[];
}

/** Resolve a single UUID to an area name, checking both pricing and leaflet areas */
function resolveAreaId(id: string, lookups: ResolverLookups): string {
  const found =
    lookups.areas?.find(a => a.id === id) ??
    lookups.leafletAreas?.find(a => a.id === id);
  return found?.name ?? id;
}

/** Resolve an array of UUIDs to area names */
function resolveAreaIds(ids: unknown, lookups: ResolverLookups): unknown {
  if (!Array.isArray(ids)) return ids;
  return ids.map(id => (typeof id === 'string' ? resolveAreaId(id, lookups) : id));
}

/** Resolve an ad size UUID to its name */
function resolveAdSize(id: unknown, lookups: ResolverLookups): unknown {
  if (typeof id !== 'string') return id;
  const found = lookups.adSizes?.find(a => a.id === id);
  return found?.name ?? id;
}

/** Resolve a duration UUID to its name */
function resolveDuration(id: unknown, lookups: ResolverLookups): unknown {
  if (typeof id !== 'string') return id;
  const found =
    lookups.durations?.find(d => d.id === id) ??
    lookups.subscriptionDurations?.find(d => d.id === id);
  return found?.name ?? id;
}

/** Resolve a payment option UUID to its display_name */
function resolvePaymentOption(id: unknown, lookups: ResolverLookups): unknown {
  if (typeof id !== 'string') return id;
  const found = lookups.paymentOptions?.find(p => p.id === id);
  return found?.display_name ?? id;
}

/** Re-key an object whose keys are area UUIDs → area names */
function resolveObjectKeys(obj: unknown, lookups: ResolverLookups): unknown {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const resolvedKey = resolveAreaId(key, lookups);
    result[resolvedKey] = value;
  }
  return result;
}

/** Resolve area breakdown entries — add area_name, simplify area objects */
function resolveAreaBreakdown(breakdown: unknown, lookups: ResolverLookups): unknown {
  if (!Array.isArray(breakdown)) return breakdown;
  return breakdown.map((entry: any) => {
    if (!entry || typeof entry !== 'object') return entry;
    const resolved = { ...entry };

    // If entry has an area object with an id, extract the name
    if (resolved.area && typeof resolved.area === 'object' && resolved.area.id) {
      resolved.area_name = resolved.area.name || resolveAreaId(resolved.area.id, lookups);
    }
    // If entry has an areaId field
    if (typeof resolved.areaId === 'string') {
      resolved.area_name = resolveAreaId(resolved.areaId, lookups);
    }

    return resolved;
  });
}

/** Resolve selections sub-object */
function resolveSelections(selections: any, lookups: ResolverLookups): any {
  if (!selections || typeof selections !== 'object') return selections;

  const resolved = { ...selections };

  // Resolve ad size
  if (resolved.selectedAdSize) {
    resolved.selectedAdSize = resolveAdSize(resolved.selectedAdSize, lookups);
  }
  if (resolved.adSize) {
    resolved.adSize = resolveAdSize(resolved.adSize, lookups);
  }

  // Resolve duration
  if (resolved.selectedDuration) {
    resolved.selectedDuration = resolveDuration(resolved.selectedDuration, lookups);
  }
  if (resolved.duration) {
    resolved.duration = resolveDuration(resolved.duration, lookups);
  }

  // Resolve leaflet duration
  if (resolved.leafletDuration) {
    resolved.leafletDuration = resolveDuration(resolved.leafletDuration, lookups);
  }

  // Resolve area arrays
  if (resolved.selectedAreas) {
    resolved.selectedAreas = resolveAreaIds(resolved.selectedAreas, lookups);
  }
  if (resolved.bogofPaidAreas) {
    resolved.bogofPaidAreas = resolveAreaIds(resolved.bogofPaidAreas, lookups);
  }
  if (resolved.bogofFreeAreas) {
    resolved.bogofFreeAreas = resolveAreaIds(resolved.bogofFreeAreas, lookups);
  }

  // Resolve areas object (bogof variant: { paid: [...], free: [...] })
  if (resolved.areas && typeof resolved.areas === 'object' && !Array.isArray(resolved.areas)) {
    resolved.areas = {
      ...resolved.areas,
      ...(resolved.areas.paid ? { paid: resolveAreaIds(resolved.areas.paid, lookups) } : {}),
      ...(resolved.areas.free ? { free: resolveAreaIds(resolved.areas.free, lookups) } : {}),
    };
  } else if (Array.isArray(resolved.areas)) {
    resolved.areas = resolveAreaIds(resolved.areas, lookups);
  }

  // Resolve payment option
  if (resolved.payment_option_id) {
    resolved.payment_option_id = resolvePaymentOption(resolved.payment_option_id, lookups);
  }

  // Resolve month maps (keys are area UUIDs)
  if (resolved.selectedMonths && typeof resolved.selectedMonths === 'object') {
    resolved.selectedMonths = resolveObjectKeys(resolved.selectedMonths, lookups);
  }
  if (resolved.months && typeof resolved.months === 'object' && !Array.isArray(resolved.months)) {
    resolved.months = resolveObjectKeys(resolved.months, lookups);
  }

  // Resolve starting issue (if it's an area UUID used as key)
  // selectedStartingIssue is typically a label, leave as-is

  return resolved;
}

/**
 * Main resolver — takes a raw webhook body and lookup arrays,
 * returns a new payload with all UUIDs replaced by display names.
 */
export function resolveWebhookPayload(payload: any, lookups: ResolverLookups): any {
  if (!payload || typeof payload !== 'object') return payload;

  const resolved = { ...payload };

  // Top-level area arrays
  if (resolved.selected_areas) {
    resolved.selected_areas = resolveAreaIds(resolved.selected_areas, lookups);
  }
  if (resolved.bogof_paid_areas) {
    resolved.bogof_paid_areas = resolveAreaIds(resolved.bogof_paid_areas, lookups);
  }
  if (resolved.bogof_free_areas) {
    resolved.bogof_free_areas = resolveAreaIds(resolved.bogof_free_areas, lookups);
  }

  // Pricing breakdown
  if (resolved.pricing_breakdown && typeof resolved.pricing_breakdown === 'object') {
    resolved.pricing_breakdown = { ...resolved.pricing_breakdown };

    if (resolved.pricing_breakdown.areaBreakdown) {
      resolved.pricing_breakdown.areaBreakdown = resolveAreaBreakdown(
        resolved.pricing_breakdown.areaBreakdown,
        lookups
      );
    }
  }

  // Selections sub-object
  if (resolved.selections) {
    resolved.selections = resolveSelections(resolved.selections, lookups);
  }

  return resolved;
}
