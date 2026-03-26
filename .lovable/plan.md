

## Reorder Homepage Sections

Rearrange the three sections in `src/pages/Index.tsx` (after IconCardsSection) to this order:

1. **Latest Stories** (`LatestStoriesGrid`)
2. **Featured Advertisers** (`FeaturedAdvertisersSection`)
3. **What Our Readers Say** (`TestimonialsCarousel`)

Currently the order is: Testimonials → Featured Advertisers → Latest Stories. Just swap the JSX blocks around. Remove the `hidden md:block` wrapper from TestimonialsCarousel so it's visible on all devices (or keep it if you prefer mobile-hidden — your call).

### File: `src/pages/Index.tsx` (~lines 117-131)

Reorder to:

```tsx
<IconCardsSection />

{/* Latest Stories */}
<div id="news">
  <LatestStoriesGrid />
</div>

{/* Featured Advertisers */}
<FeaturedAdvertisersSection />

{/* Our Readers Say */}
<div className="hidden md:block">
  <TestimonialsCarousel />
</div>

{/* Discover Extra */}
<NewsletterSignup />
```

Single file change, no logic changes.

