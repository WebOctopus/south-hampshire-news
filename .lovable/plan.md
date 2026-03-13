

## Fix: Dashboard CreateBookingForm pricing parity with front-end calculator

### Problems Found

1. **BOGOF can't save/book** — No auto-selection of default duration when switching pricing model. The front-end (Advertising.tsx lines 235-259) auto-selects the first available duration; the dashboard just clears it and requires manual selection, but there's no visible feedback that duration is missing.

2. **Monthly price incorrect** — The dashboard doesn't integrate the design fee into `pricingBreakdown.finalTotal` like the front-end does (AdvertisingStepForm lines 148-198). When "include design" is checked, the front-end adds the design fee to finalTotal and stores `finalTotalBeforeDesign`. The dashboard passes `designFee: 0` to `calculatePaymentAmount` because `pricingBreakdown` from `calculateAdvertisingPrice` never contains a `designFee` field.

3. **BOGOF free area auto-trim missing** — Per project constraint, when a paid area is deselected, free areas should auto-trim so free count never exceeds paid count. The dashboard doesn't do this.

4. **Ad sizes not filtered by `available_for`** — The front-end filters ad sizes by pricing model (e.g., only showing sizes available for "fixed" or "subscription"). The dashboard shows all active ad sizes regardless.

5. **No auto-duration selection** — When the pricing model changes, the front-end auto-selects the first/default duration. The dashboard clears it but never auto-selects.

### Changes (1 file)

**`src/components/dashboard/CreateBookingForm.tsx`**:

1. **Add auto-duration selection** (new useEffect after line 134): When pricing model changes and durations are loaded, auto-select the first available duration (mirroring Advertising.tsx lines 235-259).

2. **Add design fee to pricingBreakdown** (new useEffect): When `includeDesign` is true, look up the design fee from the selected ad size and add it to `pricingBreakdown.finalTotal`, storing `finalTotalBeforeDesign`. Remove it when unchecked. This mirrors AdvertisingStepForm lines 148-198.

3. **Add BOGOF free area auto-trim** (update paid area onCheckedChange handler around line 583): When a paid area is deselected, trim `bogofFreeAreas` from the end so its length never exceeds `bogofPaidAreas.length`.

4. **Filter ad sizes by `available_for`**: In the ad size dropdown (line 705), filter `adSizes` to only show sizes whose `available_for` array includes the current pricing model type (`'fixed'` or `'subscription'` for BOGOF).

5. **Fix payment option designFee parameter** (line 789): Extract the actual design fee from pricingBreakdown (after step 2 adds it) rather than checking `'designFee' in pricingBreakdown` which was unreliable.

6. **Pass designFee to calculatePaymentAmount correctly**: Use `pricingBreakdown.designFee || 0` for the designFee parameter so payment option amounts match the front-end.

