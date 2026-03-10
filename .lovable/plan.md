

## Make Booking Summary Info Points Editable Across All 3 Packages

The "Design Service", "What You're Booking", "Investment Shown", "Immediate Confirmation", and "Guaranteed Reach" info blurbs appear in 3 components with slightly different text per package type. We will make all of them editable via the Edit Page button.

### Changes

**`src/hooks/useAdvertisingContent.ts`** — Add a `bookingSummary` section to `defaultAdvertisingContent` with keys for each info point per package type:
- `bogof.designServiceText`, `bogof.whatYoureBookingText`, `bogof.investmentShownText`, `bogof.immediateConfirmationText`, `bogof.guaranteedReachText`
- `fixed.designServiceText`, `fixed.whatYoureBookingText`, `fixed.investmentShownText`, `fixed.immediateConfirmationText`
- `leafleting.whatYoureBookingText`, `leafleting.investmentShownText`, `leafleting.immediateConfirmationText`

Each key gets the current hardcoded text as default.

**`src/components/BookingSummaryStep.tsx`** (BOGOF package):
- Add optional `advertisingContent` and `onContentSave` props
- Import `EditableText` and wrap each info point description in `EditableText` reading from `advertisingContent?.bookingSummary?.bogof.*`

**`src/components/FixedTermBasketSummary.tsx`** (Fixed Term package):
- Add optional `advertisingContent` and `onContentSave` props
- Wrap each info point description in `EditableText` reading from `advertisingContent?.bookingSummary?.fixed.*`

**`src/components/LeafletBasketSummary.tsx`** (Leafleting package):
- Add optional `advertisingContent` and `onContentSave` props
- Wrap each info point description in `EditableText` reading from `advertisingContent?.bookingSummary?.leafleting.*`

**`src/components/AdvertisingStepForm.tsx`**:
- Pass `advertisingContent` and `onContentSave` props to all instances of `BookingSummaryStep`, `FixedTermBasketSummary`, and `LeafletBasketSummary` (6 call sites total).

