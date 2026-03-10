

## Make Design Fee Step Editable via "Edit Page"

### Changes

**`src/hooks/useAdvertisingContent.ts`** — Add a `designFee` section to `defaultAdvertisingContent`:
- `pageHeading`: "Artwork Design Service"
- `pageDescription`: "Do you need help designing your advertisement?"
- `alertText`: "Professional artwork is essential for effective advertising. Our design team can create eye-catching materials that drive results."
- `cardTitle`: "Artwork Design Fee"
- `cardDescription`: "Select whether you need our professional design services"
- `yesLabel`: "Yes, please contact me to start the design process"
- `yesDescription`: "Our professional design team will work with you to create compelling artwork that captures attention and drives customer engagement."
- `bullet1`: "Professional design consultation"
- `bullet2`: "Unlimited revisions until you're satisfied"
- `bullet3`: "Print-ready artwork delivered"
- `noLabel`: "No, finished artwork will be supplied"
- `noDescription`: "You'll provide your own print-ready artwork that meets our specifications. No design fee will be added to your booking."
- `noNote`: "Artwork must be supplied in high-resolution print-ready format (PDF, AI, or EPS)"
- `footerNote`: "The design fee covers the creation of your artwork. If you choose to supply your own artwork, please ensure it meets our technical specifications."

**`src/components/DesignFeeStep.tsx`** — Accept optional `advertisingContent` and `onContentSave` props. Wrap all hardcoded text strings in `<EditableText>` components reading from `advertisingContent?.designFee` with fallbacks to defaults.

**`src/components/AdvertisingStepForm.tsx`** — Pass `advertisingContent` and `onContentSave` (the `updateAdvertisingField` function) to both `DesignFeeStep` instances.

