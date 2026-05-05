## Widen the desktop menu dropdowns

The dropdown panels currently auto-size to content, and inside each panel the items column is wrapped in `grid md:grid-cols-2` even though we only ever render one sub-section. The result is a narrow left column where titles like "Latest Community News" wrap onto five lines (visible in the screenshot).

### Changes

**`src/components/Navigation.tsx`** (inside `NavigationMenuContent`)

1. Give the panel an explicit minimum width so it doesn't shrink-wrap:
   - Change the outer wrapper from `w-full bg-white border ...` to `w-[640px] lg:w-[760px] bg-white border ...`.
2. Remove the unused 2-column grid around the items list so titles get the full left column:
   - Replace `<div className="grid gap-6 md:grid-cols-2"><div>...items...</div></div>` with just the items block (no inner grid wrapper).
3. Keep the existing 3:2 split between items area and "Latest News / Upcoming Events / AdvertisingAlerts" featured panel (`md:col-span-3 lg:col-span-3` + `md:col-span-1 lg:col-span-2`), so the right-hand promo card stays the same proportion but now sits in a wider container.

### Result

- Dropdown headers ("Latest Community News", "Featured Advertisers", "Newsletter Signup", etc.) render on a single line on desktop.
- Featured panel on the right keeps its current look, just with a bit more breathing room.
- No changes to mobile (Sheet/Accordion) menu, routing, or visibility logic.
