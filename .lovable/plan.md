## Fix the dropdown matrix box (properly this time)

### Root cause

The dropdown is being clipped by the shared `NavigationMenu` primitive, not by the panel itself. In `src/components/ui/navigation-menu.tsx`:

- `NavigationMenu` Root is `max-w-max` — only as wide as the trigger row.
- The dropdown `Viewport` is positioned `w-full` of the Root and has `overflow-hidden`.

So no matter how wide we make the inner panel in `Navigation.tsx`, anything that extends past the right edge of the trigger row gets cut off — which is the "Latest..." column being chopped in the screenshot.

### Changes

**1. `src/components/ui/navigation-menu.tsx` — let the viewport be wider than the trigger row**

- `NavigationMenu` Root: replace `max-w-max flex-1` with `w-full` (still centred by the parent flex container in `Navigation.tsx`).
- `NavigationMenuViewport` wrapper: keep `absolute left-0 top-full w-full flex justify-center` so the panel stays centred under the menu.
- `NavigationMenuViewport` itself: keep `max-w-7xl`, but allow the inner panel to define its own width by removing the forced `w-full` and keeping `overflow-hidden` only for the rounded corners (we'll size the panel explicitly so nothing overflows).

**2. `src/components/Navigation.tsx` — clean 3-column matrix layout**

Inside `NavigationMenuContent`, replace the current 5-column grid with a properly proportioned 3-column matrix:

- Outer panel: `w-[860px] xl:w-[960px] bg-white border border-border shadow-lg rounded-lg p-6`.
- Inner grid: `grid grid-cols-3 gap-6`.
  - **Columns 1–2 (items area)**: `col-span-2` containing the section heading and a nested `grid grid-cols-2 gap-x-4 gap-y-2` so the menu items flow into two even sub-columns. Items keep their icon + title + description, but `whitespace-nowrap` is removed so long titles wrap naturally inside the wider column.
  - **Column 3 (featured panel)**: `col-span-1 bg-muted/30 rounded-lg p-5` housing the existing "Latest News / Upcoming Events / AdvertisingAlerts" block. No more clipped headings.

### Result

- Dropdown panel renders fully on screen, centred under the nav, no right-side clipping.
- Items sit in a tidy 2-column matrix on the left; promo card sits cleanly on the right (matching the reference image).
- Mobile (Sheet/Accordion) menu, routing, visibility logic, and admin behaviour are untouched.
