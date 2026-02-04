

## Plan: Route Discover EXTRA Submissions to Dedicated Webhook

### Overview

Extend the routing logic in the `submit-discover-form` edge function so that "Subscribe to Discover EXTRA" form submissions (`journey_type: 'discover_extra'`) are sent to the same webhook as editorial submissions.

---

### Updated Routing Configuration

| Journey Type | Webhook Destination |
|--------------|---------------------|
| `editorial` (Submit a story) | `EDITORIAL_WEBHOOK_URL` |
| `discover_extra` (Discover EXTRA newsletter) | `EDITORIAL_WEBHOOK_URL` |
| `advertising` | `DISCOVER_FORMS_WEBHOOK_URL` |
| `think_advertising` | `DISCOVER_FORMS_WEBHOOK_URL` |
| `distributor` | `DISCOVER_FORMS_WEBHOOK_URL` |

---

### Implementation

**File to modify**: `supabase/functions/submit-discover-form/index.ts`

Update the routing condition from:

```typescript
if (journeyType === 'editorial') {
  webhookUrl = editorialWebhookUrl || defaultWebhookUrl;
```

To:

```typescript
if (journeyType === 'editorial' || journeyType === 'discover_extra') {
  webhookUrl = editorialWebhookUrl || defaultWebhookUrl;
```

And update the logging to reflect which journey type is being routed.

---

### No New Secrets Required

Since the destination URL (`https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook`) is already configured in `EDITORIAL_WEBHOOK_URL`, no new secrets are needed.

