

## Add Design Service blurb to FixedTermBasketSummary

The blurb was previously added to `BookingSummaryStep.tsx`, but the screen shown in the screenshot is actually rendered by `FixedTermBasketSummary.tsx`. The design service text needs to be added there as well, below the "Book Now" button.

### Change

**File: `src/components/FixedTermBasketSummary.tsx`**

Insert the Design Service blurb after the "Book Now" button (around line 215), before the "What You're Booking" section:

```tsx
{/* Design Service Blurb */}
<div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
  <p className="font-medium mb-1">DESIGN SERVICE:</p>
  <p className="text-muted-foreground">
    By booking online you get discounted advert design. Our professional design team creates response focused ads at very low cost - just provide your content, images, logo and branding kit if you have one.
  </p>
</div>
```

### Side note (not in this fix)

The screenshot also shows "Selected issues: undefined 'y" and "undefined 'ne" — this is a separate bug in the month formatting logic in `FixedTermBasketSummary.tsx` where the year/month parsing is failing. This can be addressed separately if needed.

