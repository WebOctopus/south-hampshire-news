## Goal

Re-add the "bubble acts as its own close button" behaviour on top of the current plain widget loader in `index.html`, without overriding the widget's own colour, avatar, title, or position.

## What to add back to `index.html`

A single inline `<script>` (placed after the widget-loader `<script>`) that:

1. Waits for the widget to mount (`MutationObserver` on `document.body` watching for `#octopus-chat-bubble` and `#octopus-chat-container`).
2. When the bubble appears:
   - Attaches a click handler that calls `window.OctopusChat.toggle()` (falling back to clicking the container's own trigger if the API isn't exposed).
   - Observes the container for an "open" class / `aria-expanded` / visible state change.
3. When the chat opens: replaces the bubble's inner icon with an inline X SVG.
4. When the chat closes: restores the bubble's original inner HTML (cached on first sight, so the widget's own avatar/colour/logo is preserved).

## What NOT to add

- No `<style>` block. No positioning overrides. No colour overrides. No `data-*` attributes on the loader tag.
- Do not touch the loader `<script>` tag itself — colour, avatar, title, and (default bottom-right) position all stay driven by the widget config keyed to `id=f532ace8-...`.

## Behaviour after change

- Widget renders with its configured colour, avatar, title, and default position.
- Clicking the bubble opens the chat; the bubble's avatar swaps to an X.
- Clicking the bubble (now an X) closes the chat; the original avatar returns.

## Files touched

- `index.html` only.
