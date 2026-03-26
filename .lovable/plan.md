

## Fix Post-Payment Redirect & Status Label

Two issues to fix:

### 1. Post-payment redirect lands on "Create New Booking" instead of "Your Bookings"

**Root cause**: The `?tab=bookings` URL parameter from PaymentSetup.tsx should work, but there's a race condition. The Dashboard's smart default tab logic can override it when bookings data hasn't loaded yet.

**Fix in `src/pages/Dashboard.tsx`** (line 249-251): Set `hasAppliedSmartDefault.current = true` when a `?tab` URL parameter is found, preventing the smart default logic from overriding it later.

```tsx
if (tabParam && ['quotes', 'bookings', ...].includes(tabParam)) {
  setActiveTab(tabParam);
  hasAppliedSmartDefault.current = true;  // Add this line
}
```

### 2. Badge shows "Payment Required" instead of "Setup Complete" after DD completion

**Fix in `src/components/dashboard/BookingCard.tsx`** (lines 149-150): The `payment_pending` and `mandate_created` statuses already map to "Payment Setup Complete". If the booking's `payment_status` is still `pending` after GoCardless setup, the label falls through to "Booking Terms Accepted" (line 145/152). 

Update the fallback default label (line 152) and also ensure `mandate_created` status returns "Setup Complete":

- Line 149-150: Change the label from `'Payment Setup Complete'` to `'Setup Complete'` for statuses `payment_pending`, `subscription_pending`, `mandate_created`.
- Keep line 145 and 152 as "Booking Terms Accepted" for truly pending bookings.

This ensures that once GoCardless DD is set up and the booking's payment_status updates to `mandate_created` or `payment_pending`, the badge clearly shows "Setup Complete".

