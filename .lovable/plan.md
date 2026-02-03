

## Plan: Route Form Submissions to Different Webhooks by Journey Type

### Overview

Add routing logic to the `submit-discover-form` edge function so different form types are sent to different webhook endpoints.

---

### Routing Configuration

| Journey Type | Webhook Destination |
|--------------|---------------------|
| `editorial` (Submit a story) | `https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook` |
| `advertising` (Request an Advertising Quote) | Current `DISCOVER_FORMS_WEBHOOK_URL` secret |
| `discover_extra` (Discover EXTRA newsletter) | Current `DISCOVER_FORMS_WEBHOOK_URL` secret |
| `think_advertising` (THINK monthly email) | Current `DISCOVER_FORMS_WEBHOOK_URL` secret |
| `distributor` (Apply for distribution) | Current `DISCOVER_FORMS_WEBHOOK_URL` secret |

---

### Implementation Steps

#### Step 1: Add New Secret for Editorial Webhook

A new secret will be added:
- **Name**: `EDITORIAL_WEBHOOK_URL`
- **Value**: `https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook`

#### Step 2: Update Edge Function with Routing Logic

**File**: `supabase/functions/submit-discover-form/index.ts`

Add logic to select the webhook URL based on `journey_type`:

```text
┌─────────────────────────┐
│  Form Submission        │
│  (with journey_type)    │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ journey_type? │
    └───────┬───────┘
            │
     ┌──────┴──────┐
     │             │
editorial      all others
     │             │
     ▼             ▼
EDITORIAL_    DISCOVER_FORMS_
WEBHOOK_URL   WEBHOOK_URL
```

The function will:
1. Read the `journey_type` from the incoming payload
2. Select the appropriate webhook URL based on the journey type
3. Both webhooks use the same `INBOUND_WEBHOOK_API_KEY` for authentication

---

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/submit-discover-form/index.ts` | Add routing logic based on journey_type |

### Secrets to Add

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `EDITORIAL_WEBHOOK_URL` | `https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook` | Webhook for editorial/story submissions |

---

### Technical Details

The edge function will be updated to:

1. Load both webhook URLs from environment variables
2. Determine which URL to use based on `payload.journey_type`
3. Fall back to the default webhook if a journey-specific one isn't configured
4. Log which webhook is being used for debugging

Example routing logic:
```typescript
const journeyType = payload.journey_type;
let webhookUrl: string;

if (journeyType === 'editorial') {
  webhookUrl = Deno.env.get("EDITORIAL_WEBHOOK_URL") || defaultWebhookUrl;
} else {
  webhookUrl = defaultWebhookUrl;
}
```

---

### Summary

This approach keeps the configuration flexible:
- Editorial stories go to their dedicated webhook
- All other forms continue using the existing webhook
- Both use the same API key for authentication
- Easy to add more journey-specific webhooks in the future

