

## Add "Saved Quote" Pipeline Tag — Quotes Only

### Change

Update `src/lib/webhookPayloadResolver.ts` to add `pipeline_tag: 'saved_quote'` to the payload **only when `record_type` is `'quote'`**. Booking payloads remain completely untouched.

### Technical Detail

In `buildCrmWebhookPayload`, after the existing payload object is built, add:

```typescript
if (raw.record_type === 'quote') {
  payload.pipeline_tag = 'saved_quote';
}
```

No changes to booking payloads, no edge function changes, no other file changes. The CRM's existing booking automation continues unaffected.

### Files Changed

| File | Change |
|---|---|
| `src/lib/webhookPayloadResolver.ts` | Add `pipeline_tag: 'saved_quote'` conditionally for quotes only |

