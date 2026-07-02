Add the Mirola chatbot widget script to the site so it appears as a floating button in the bottom-right on every page.

## Implementation

Inject the script tag into `index.html` just before `</body>`:

```html
<script
  src="https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/widget-loader?id=f532ace8-8e6d-4694-81d1-ef91e7f36915"
  data-position="right"
  data-offset-x="20"
  data-offset-y="20"
  data-color="#0066FF"
  async
></script>
```

Placing it in `index.html` (rather than a React component) means:
- Loads once, site-wide, on every route with no re-mount on navigation.
- `async` so it doesn't block render.
- No React wrapper needed — the widget-loader manages its own DOM.

No other files change.