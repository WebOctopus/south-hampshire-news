

## Add Booking Terms & Conditions to Dashboard

### Approach
Add a new "Terms & Conditions" sidebar tab in the Advertising section of the dashboard. When selected, it shows a well-designed, accordion-based page with the 3+ Subscription terms, payment details, and contact information. This keeps the terms easily accessible without cluttering the booking cards.

### Design
The page will feature:
- A header card with a shield/document icon and title "Terms of Booking & Payment"
- Three collapsible accordion sections:
  1. **3+ Subscription Terms** — the 8 bullet points about FREE for 3, paid areas, direct debit, inflationary increases, etc.
  2. **Payment & Billing** — GoCardless reference, payment dates, invoice issuer details
  3. **Accounts & Support** — Michael Price contact details
- Clean typography with the Discover brand orange accents, subtle card borders, and proper spacing
- An info badge at the top noting these terms apply to 3+ Subscription bookings

### Files to change

**1. `src/components/dashboard/DashboardSidebar.tsx`**
- Add a new menu item `"Terms & Conditions"` with a `FileText` or `Shield` icon under the Advertising group, value `"terms"`

**2. `src/components/dashboard/BookingTerms.tsx`** (new file)
- Self-contained component with accordion sections containing the provided terms content
- Uses existing UI components: `Card`, `Accordion`, `Badge`, `Separator`

**3. `src/pages/Dashboard.tsx`**
- Import `BookingTerms` component
- Add rendering case for `activeTab === 'terms'` in the tab content switch

