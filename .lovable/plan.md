## Add redirect for legacy Google listing URL

**File**: `src/App.tsx`

- Ensure `Navigate` is imported from `react-router-dom`.
- Add a new route before the catch-all `*` route:
  ```tsx
  <Route path="/calendars-with-sidebar-2-2" element={<Navigate to="/advertising" replace />} />
  ```

This sends anyone landing on `/calendars-with-sidebar-2-2` straight to `/advertising`, using `replace` so the old URL doesn't pollute browser history.

### Recommended follow-up (outside the codebase)
- Update the URL on the Google Business Profile listing to `https://discovermagazines.co.uk/advertising` so search results point to the canonical page directly.
- Optional: if you have Cloudflare in front of the domain, add a Page Rule / Bulk Redirect for a true HTTP 301.