

## Plan: Update Chatbot Widget Script

### Overview

Replace the current chatbot widget script with the new Supabase-hosted version that should be publicly accessible.

---

### Implementation

**File to modify:** `index.html`

Replace the existing script tag:

```html
<!-- Remove this -->
<script src="https://f634468b-9654-4bdc-8401-06aeda72dc34.lovableproject.com/chatbot-widget.js" data-chatbot-id="f532ace8-8e6d-4694-81d1-ef91e7f36915"></script>

<!-- Replace with this -->
<script src="https://nztjzyhtynfijonrkuem.supabase.co/functions/v1/widget-loader?id=f532ace8-8e6d-4694-81d1-ef91e7f36915" async></script>
```

---

### Technical Notes

- The new script is hosted on **Supabase Edge Functions**, which are publicly accessible (no authentication required)
- The chatbot ID (`f532ace8-8e6d-4694-81d1-ef91e7f36915`) is now passed as a query parameter instead of a data attribute
- The `async` attribute allows the script to load without blocking page rendering
- This should resolve the previous issue where the script required Lovable authentication

---

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Replace chatbot widget script URL with Supabase-hosted version |

