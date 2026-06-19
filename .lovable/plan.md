# Add "Discount code applied" line to booking/quote emails

## Goal
Render `Discount code applied: {{discount_code}} (−{{discount_amount}})` near the total in 9 email templates. Hide the entire line when no code was used. Pull values from the discount data already stored on the booking/quote — no recalculation.

## Constraints
- `available_variables` already lists `discount_code` and `discount_amount`. Do not touch it.
- The template engine in `send-booking-confirmation-email/index.ts` is plain `{{var}}` substitution — no `{{#if}}` support. We need a way to suppress the whole line when the code is empty.

## Approach

### 1. Templates (DB migration that updates `html_body` only)

For each of the 9 templates listed by the user, insert a styled line into `html_body` near the total/cost section, wrapped in marker comments so the send function can strip the block when no code was used:

```html
<!--DISCOUNT_LINE_START-->
<tr><td style="padding:8px 0;color:#0F766E;font-weight:600;">
  Discount code applied: {{discount_code}} (−{{discount_amount}})
</td></tr>
<!--DISCOUNT_LINE_END-->
```

(Tag/wrapper matched to each template's existing total markup — `<tr>`/`<td>` in tabular layouts, `<p>` for prose layouts.) Placement: immediately above or below the `total_cost` / committed-cost line in each template. No `available_variables` edits.

Templates updated: `booking_bogof_customer`, `booking_confirmation_customer`, `booking_fixed_customer`, `booking_leafleting_customer`, `quote_bogof_customer`, `quote_fixed_customer`, `quote_leafleting_customer`, `quote_saved_customer`, `booking_quote_admin`.

### 2. Send function (`supabase/functions/send-booking-confirmation-email/index.ts`)

The booking/quote discount is already on `payload.pricing_breakdown.discount` (the same shape the existing `discount_line` variable reads — `{ code, discount_amount, discount_type, free_item_text, ... }`). Populate two new vars from those stored values (no recalculation):

```ts
const d: any = payload.pricing_breakdown?.discount;
const hasCode = !!(d && d.code && (d.discount_amount > 0 || d.discount_type === 'free_item'));
vars.discount_code   = hasCode ? d.code : "";
vars.discount_amount = hasCode && d.discount_amount
  ? formatCurrency(d.discount_amount)
  : "";
```

Then, before `applyTemplate(...)` is called for both the customer template (line ~541) and the admin template (line ~371), strip the marker block when no code was used:

```ts
function stripDiscountLine(html: string): string {
  return html.replace(/<!--DISCOUNT_LINE_START-->[\s\S]*?<!--DISCOUNT_LINE_END-->/g, "");
}
const customerHtmlIn = hasCode
  ? customerTemplate.html_body
  : stripDiscountLine(customerTemplate.html_body);
```

When a code IS present, the markers are left in place (they're HTML comments, invisible in the rendered email) and `{{discount_code}}`/`{{discount_amount}}` substitute normally.

This guarantees the line never renders blank.

### 3. No changes elsewhere
- `available_variables`: untouched (per user).
- No client/UI changes.
- No changes to other send functions (`send-booking-webhook`, `send-quote-booking-webhook`) — they pass through to GHL/webhook, not Resend templates. The 9 templates are all sent by `send-booking-confirmation-email`.
- Deploy the edge function after editing.

## Files touched
- `supabase/functions/send-booking-confirmation-email/index.ts` — add `discount_code`/`discount_amount` vars, add `stripDiscountLine` helper, apply before both `applyTemplate` calls.
- New SQL migration — `UPDATE email_templates SET html_body = ...` for each of the 9 template names, inserting the marker-wrapped line.
