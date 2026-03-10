

## Make Payment Options Count Dynamic

### Problem
The heading "3 Payment Options" is hardcoded in four locations, but the actual number of active payment options comes from the database and could change.

### Changes

Replace the hardcoded "3" with `paymentOptions.length` in these four files:

1. **`src/components/BookingSummaryStep.tsx`** (line 572):
   `3 Payment Options` → `{paymentOptions.length} Payment Option{paymentOptions.length !== 1 ? 's' : ''}`

2. **`src/components/EditQuoteForm.tsx`** (line 556):
   Same replacement — `paymentOptions` is already in scope.

3. **`src/components/dashboard/CreateBookingForm.tsx`** (lines 756, 762):
   Same replacement in both the comment and the displayed title.

4. **`src/components/SalesAssistantPopup.tsx`** (line 62):
   This is a static tip string without access to `paymentOptions`. Options:
   - Change to generic text: `"💰 Multiple Payment Options: Choose full payment or monthly plan"`
   - This avoids needing to thread the hook into the popup component.

All other files already have `usePaymentOptions()` imported and `paymentOptions` in scope — no new imports needed except removing the hardcoded number.

