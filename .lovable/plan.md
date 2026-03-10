

## Add Distribution Dates to View Quote

**`src/components/dashboard/ViewQuoteContent.tsx`**:

Add a "Distribution Start Date" field to the quote details section, using the `distribution_start_date` field from the quote data. Display it formatted in UK date format (e.g., "Mar 2026" or "15 Mar 2026") after the Total Circulation section, before the Area Selection.

- Add a `Calendar` icon import from lucide-react
- Show `distribution_start_date` when it exists on the quote, formatted with `toLocaleDateString('en-GB', ...)`
- Place it in the pricing grid or as a standalone field below Total Circulation

