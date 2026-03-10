

## Change "View PDF" button to open the View Quote dialog

The "View PDF" button on the `QuoteConversionCard` already calls `onView(quote)`, which is the same handler that opens the View Quote dialog from the table. The only change needed is the button label and icon.

### Changes

**`src/components/dashboard/QuoteConversionCard.tsx`** (lines 170-177):
- Change icon from `Download` to `Eye`
- Change label from "View PDF" to "View"
- Update the import to include `Eye` instead of `Download`

