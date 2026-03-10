

## Make Pricing Options Step Heading Editable

### Changes

**`src/hooks/useAdvertisingContent.ts`** — Add a `pricingOptions` section to `defaultAdvertisingContent`:
- `pageHeading`: "Choose Your Advertising Package"
- `pageDescription`: "Select the package that best fits your business needs. Each option is designed for different advertising goals and budgets."

**`src/components/PricingOptionsStep.tsx`** — Accept optional `advertisingContent` and `onContentSave` props. Import `EditableText` and wrap the heading (line 191) and description (line 193-195) in `EditableText` components reading from `advertisingContent?.pricingOptions`.

**`src/components/AdvertisingStepForm.tsx`** — Pass `advertisingContent` and `onContentSave` props to both `PricingOptionsStep` instances (lines 1009 and 1131).

