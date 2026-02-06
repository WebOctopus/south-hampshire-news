

## Plan: Add Consent Checkbox to Editorial (Submit a Story) Journey

### Current State

The form system already has consent checkboxes on most journeys:
- **Advertising**: Email contact consent + THINK newsletter (optional)
- **Discover Extra**: Newsletter subscription consent (on contact step + interests step)
- **THINK Advertising**: Newsletter subscription consent
- **Distributor**: Email contact consent

The **Editorial (Submit a Story)** journey is the only one missing a consent checkbox in its main story details step.

All journeys already have Terms & Conditions and Privacy Policy checkboxes on the final confirmation step.

---

### Solution

Add an email contact consent checkbox to the **Editorial Journey** (Submit a Story) form, similar to the existing patterns used in Advertising and Distributor journeys.

---

### Implementation Steps

#### 1. Update EditorialJourney.tsx

Add props for consent handling:
- Accept `consents` and `onConsentsChange` props
- Add a consent checkbox at the bottom of the form with appropriate styling

**Consent text**: "I consent to being contacted by email regarding my story submission"

#### 2. Update DiscoverFormsHub.tsx

Pass consent props to the EditorialJourney component (similar to how it's done for AdvertisingJourney).

#### 3. Add validation in canProceed()

Require the email contact consent to be checked before proceeding from the Editorial story details step.

#### 4. Update types.ts (if needed)

Ensure the `Consents` interface has an appropriate field for editorial consent. The existing `email_contact` field can be reused since it's generic.

---

### Visual Layout

The Editorial form will add this section at the bottom:

```text
[Story Details Form...]

─────────────────────────────────────────────────────────
Communication Preferences

☑ I consent to being contacted by email regarding my story submission *
  We'll use your email to follow up on your story and keep you updated.
─────────────────────────────────────────────────────────
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/forms/EditorialJourney.tsx` | Add consents + onConsentsChange props, add consent checkbox UI |
| `src/components/forms/DiscoverFormsHub.tsx` | Pass consents props to EditorialJourney, update canProceed validation |

---

### Technical Notes

- Uses the existing `email_contact` boolean from the `Consents` interface
- Styling matches the existing consent boxes in AdvertisingJourney and DistributorJourney
- Required consent validation prevents form progression without explicit opt-in

