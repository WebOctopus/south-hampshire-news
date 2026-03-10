

## Make Area & Schedule Step Heading Editable

### Changes

**`src/hooks/useAdvertisingContent.ts`** — Add to `areaSelection` section:
- `pageHeading`: "Select Areas & Publication Schedule"
- `pageDescription`: "Choose your areas and set up your campaign timeline"

**`src/components/AreaAndScheduleStep.tsx`** — Wrap the main heading (line 560) and description (lines 562-564) in `EditableText` components reading from `advertisingContent?.areaSelection?.pageHeading` and `advertisingContent?.areaSelection?.pageDescription`, with current text as fallbacks. Also wrap the error-state heading/description (lines 541-542) similarly.

