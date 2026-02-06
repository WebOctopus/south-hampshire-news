

## Plan: Add Consent Checkbox to Discover Extra Contact Details Step

### Overview

Currently, the Discover EXTRA journey has this step flow:
1. **Step 1 (Contact Information)**: First Name, Last Name, Email, Postcode - uses `SharedContactStep`
2. **Step 2 (Interests)**: Feedback questions + consent checkbox - uses `NewsletterJourney`

The user wants the consent checkbox to appear on Step 1 alongside the contact details, with the explanatory text about email frequency and postcode personalization.

### Solution

Update `SharedContactStep` to:
1. Accept consents and onConsentsChange props (for the discover_extra consent)
2. Display the newsletter consent checkbox specifically for `discover_extra` journey
3. Include the custom explanatory text above the form fields

---

### Implementation Steps

#### 1. Update SharedContactStep.tsx

**Add new props** for consent handling:
- `consents?: Consents`
- `onConsentsChange?: (updates: Partial<Consents>) => void`

**Add custom intro text** for discover_extra journey with the specified copy about email frequency and postcode personalization.

**Add consent checkbox** at the bottom of the form, styled consistently with existing consent boxes in the codebase.

#### 2. Update DiscoverFormsHub.tsx

Pass the `consents` and `updateConsents` props to `SharedContactStep` when rendering for the `discover_extra` journey.

#### 3. Update canProceed validation

Ensure step 1 for `discover_extra` now also validates that the consent checkbox is checked.

---

### Visual Layout

The Contact Details step for Discover EXTRA will display:

```text
Your Contact Details

We usually send one email a month, occasionally two if there is a special
event, announcement or offer to share. By adding your postcode we know
which edition of Discover you receive (one of 14 local editions) and can
tailor the e-newsletter to you. You can unsubscribe at any time.

[First Name *]  [Last Name]
[Email *]
[Postcode]

┌──────────────────────────────────────────────────────────────────┐
│ ☑ Yes, I'd like to receive Discover EXTRA emails *               │
│   Get exclusive content, competitions, and local news delivered  │
│   to your inbox.                                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/forms/SharedContactStep.tsx` | Add consents props, custom intro text for discover_extra, consent checkbox |
| `src/components/forms/DiscoverFormsHub.tsx` | Pass consents and updateConsents to SharedContactStep for discover_extra |
| `src/components/forms/DiscoverFormsHub.tsx` | Update step 1 validation for discover_extra to require consent checkbox |

