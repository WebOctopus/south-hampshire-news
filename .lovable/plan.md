

## Plan: Structure Webhook Payload with Clear Category Names

### Overview

Update the form submission system to include a clear, human-readable `form_category` field in the JSON payload sent to the webhook. This allows the receiving system to easily categorize and route submissions.

---

### Current Payload Structure

The current payload sent to the webhook looks like:
```json
{
  "journey_type": "editorial",
  "contact": { ... },
  "data": { ... },
  "consents": { ... },
  "meta": { ... }
}
```

The `journey_type` values are internal codes:
- `editorial`
- `advertising`
- `discover_extra`
- `think_advertising`

---

### Proposed Payload Structure

Add a new `form_category` field with clear, descriptive names:

```json
{
  "form_category": "Submit a Story",
  "journey_type": "editorial",
  "contact": {
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "phone": "...",
    "postcode": "...",
    "company": "..."
  },
  "data": {
    // Journey-specific fields
  },
  "consents": {
    // Consent flags
  },
  "meta": {
    "source": "discover_combined_form",
    "page_url": "...",
    "submitted_at": "2026-02-02T16:58:00.000Z",
    "utm_source": null,
    "utm_medium": null,
    "utm_campaign": null,
    "utm_content": null,
    "utm_term": null
  }
}
```

**Category Mapping:**

| Journey Type | Form Category |
|-------------|---------------|
| `editorial` | Submit a Story |
| `advertising` | Request an Advertising Quote |
| `discover_extra` | Subscribe to Discover EXTRA |
| `think_advertising` | Subscribe to THINK Advertising |

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDiscoverForms.ts` | Add category mapping and include `form_category` in payload |

---

### Implementation Details

**Add category mapping function:**

```typescript
const getCategoryLabel = (journeyType: JourneyType): string => {
  switch (journeyType) {
    case 'editorial':
      return 'Submit a Story';
    case 'advertising':
      return 'Request an Advertising Quote';
    case 'discover_extra':
      return 'Subscribe to Discover EXTRA';
    case 'think_advertising':
      return 'Subscribe to THINK Advertising';
    default:
      return 'Unknown';
  }
};
```

**Update the submitForm payload:**

```typescript
const payload = {
  form_category: getCategoryLabel(formState.journey_type),
  journey_type: formState.journey_type,
  contact: formState.contact,
  data: formState.data,
  consents: formState.consents,
  meta: {
    ...formState.meta,
    source: 'discover_combined_form',
    page_url: window.location.href,
    submitted_at: new Date().toISOString()
  }
};
```

---

### Example Payloads

**Submit a Story:**
```json
{
  "form_category": "Submit a Story",
  "journey_type": "editorial",
  "contact": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "07123456789"
  },
  "data": {
    "editorial_organisation": "Local Charity",
    "editorial_story_summary": "Community garden opens",
    "editorial_category": "community_news_story",
    "editorial_story_text": "Full story content..."
  },
  "consents": { ... },
  "meta": { ... }
}
```

**Request an Advertising Quote:**
```json
{
  "form_category": "Request an Advertising Quote",
  "journey_type": "advertising",
  "contact": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@business.com",
    "phone": "07987654321",
    "company": "Local Shop Ltd"
  },
  "data": {
    "advertising_business_name": "Local Shop Ltd",
    "advertising_editions_interested": ["Southampton", "Eastleigh"],
    "advertising_ad_sizes": ["quarter_page", "half_page"]
  },
  "consents": { ... },
  "meta": { ... }
}
```

**Subscribe to Discover EXTRA:**
```json
{
  "form_category": "Subscribe to Discover EXTRA",
  "journey_type": "discover_extra",
  "contact": {
    "first_name": "Sarah",
    "email": "sarah@email.com"
  },
  "data": {
    "newsletter_discover_keep_use_frequency": "every_issue",
    "newsletter_discover_rating": "much_better"
  },
  "consents": { 
    "discover_extra": true 
  },
  "meta": { ... }
}
```

**Subscribe to THINK Advertising:**
```json
{
  "form_category": "Subscribe to THINK Advertising",
  "journey_type": "think_advertising",
  "contact": {
    "first_name": "Mike",
    "email": "mike@company.com"
  },
  "data": {
    "newsletter_think_feedback": "Looking forward to tips"
  },
  "consents": { 
    "think_monthly": true 
  },
  "meta": { ... }
}
```

---

### Summary

This is a simple change that adds a human-readable `form_category` field to the webhook payload while keeping the existing `journey_type` for backward compatibility. The receiving webhook can now easily categorize submissions using the `form_category` field.

