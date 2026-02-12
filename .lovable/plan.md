

## Make Design Service blurb consistent with the other 3 info points

The "DESIGN SERVICE" blurb currently uses a different style (plain box with `bg-muted/50`) compared to the three points below it ("WHAT YOU'RE BOOKING", "INVESTMENT SHOWN", "IMMEDIATE CONFIRMATION") which use an icon + text layout with `flex items-start gap-2`.

### Change

**File: `src/components/FixedTermBasketSummary.tsx`**

Replace the current Design Service blurb (lines 307-313) with the same layout pattern used by the other three points:

```tsx
<div className="flex items-start gap-2">
  <span className="text-primary font-medium">🎨</span>
  <div>
    <p className="font-medium">DESIGN SERVICE:</p>
    <p className="text-muted-foreground">By booking online you get discounted advert design. Our professional design team creates response focused ads at very low cost - just provide your content, images, logo and branding kit if you have one.</p>
  </div>
</div>
```

Then move it into the same `space-y-4` container as the other three points (the `mt-6 space-y-4 text-sm` div at line 317), making it the first item in that group of four.

This gives it the same icon-left, text-right layout as the others. The paint palette emoji keeps visual consistency with the emoji icons used by the other points.

