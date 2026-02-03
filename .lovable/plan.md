

## Plan: Add Authentication to Webhook Requests

### Problem

The destination webhook at `nztjzyhtynfijonrkuem.supabase.co/functions/v1/inbound-webhook` requires API key authentication. Currently, the edge function sends requests without any authentication header, resulting in a 401 error.

### Solution

1. Store the API key as a new Supabase secret
2. Update the edge function to include the authentication header when calling the webhook

---

### Implementation Steps

#### Step 1: Add the API Key Secret

A new secret will need to be added:
- **Secret Name**: `INBOUND_WEBHOOK_API_KEY`
- **Value**: The API key you provided (`qs_live_...`)

#### Step 2: Update Edge Function

**File**: `supabase/functions/submit-discover-form/index.ts`

Add the API key to the outgoing request headers:

```typescript
const response = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": Deno.env.get("INBOUND_WEBHOOK_API_KEY") || "",
  },
  body: JSON.stringify(payload),
});
```

Also add validation to ensure the API key is configured:

```typescript
const apiKey = Deno.env.get("INBOUND_WEBHOOK_API_KEY");

if (!apiKey) {
  console.error("INBOUND_WEBHOOK_API_KEY not configured");
  return new Response(
    JSON.stringify({ error: "Webhook API key not configured" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

---

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/submit-discover-form/index.ts` | Add API key header to webhook request |

### Secrets to Add

| Secret Name | Purpose |
|-------------|---------|
| `INBOUND_WEBHOOK_API_KEY` | Authentication for the destination webhook |

---

### Summary

This will authenticate the outgoing webhook requests using the `x-api-key` header, which should resolve the 401 error and allow form submissions to succeed.

