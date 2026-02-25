

## Fix: Leafleting Webhook Sending UUIDs Instead of Names

### Root Cause

When a leafleting booking is submitted, the code resolves `ad_size` and `duration` names using the fixed-term/bogof lookup tables (`adSizes` from `ad_sizes` table, `durations`/`subscriptionDurations` from `pricing_durations`). But leafleting uses different tables: `leaflet_sizes` (with `label` field, not `name`) and `leaflet_campaign_durations`. Since the UUID doesn't exist in the wrong table, the resolver falls through and returns the raw UUID.

### Changes

#### 1. `src/components/AdvertisingStepForm.tsx`

**Add leaflet-specific lookups to the data fetching** (around line 61): Import `useLeafletSizes` and fetch `leafletSizes` data.

**Fix the ad_size/duration resolution** (lines 791-807): When `selectedPricingModel === 'leafleting'`, look up the ad size from `leafletSizes` (using `.label`) and duration from `leafletDurations` (using `.name`) instead of the fixed/bogof tables.

**Pass leaflet lookups to the webhook resolver** (line 795): Add `leafletSizes` and `leafletDurations` to the lookups object.

#### 2. `src/lib/webhookPayloadResolver.ts`

**Extend `CrmLookups` interface**: Add `leafletSizes` (with `label` field) and `leafletDurations` arrays.

**Update `resolveAdSizeName`**: Also search `leafletSizes` by `label` as a fallback.

**Update `resolveDurationName`**: Also search `leafletDurations` by `name` as a fallback.

### Technical Detail

The `leaflet_sizes` table uses `label` (e.g. "A5 Flyer") not `name`. The resolver needs a small interface addition:

```typescript
interface LeafletSizeLookup {
  id: string;
  label: string;
}

interface CrmLookups {
  // ...existing fields
  leafletSizes?: LeafletSizeLookup[];
  leafletDurations?: DurationLookup[];
}
```

And `resolveAdSizeName` becomes:
```typescript
function resolveAdSizeName(id, lookups) {
  if (!id) return undefined;
  return lookups.adSizes?.find(a => a.id === id)?.name
    ?? lookups.leafletSizes?.find(a => a.id === id)?.label
    ?? id;
}
```

### Files Changed

| File | Change |
|---|---|
| `src/lib/webhookPayloadResolver.ts` | Add `leafletSizes` and `leafletDurations` to `CrmLookups`; update `resolveAdSizeName` and `resolveDurationName` to check them |
| `src/components/AdvertisingStepForm.tsx` | Import `useLeafletSizes`; resolve leaflet ad_size/duration from correct tables; pass `leafletSizes` and `leafletDurations` in webhook lookups |

