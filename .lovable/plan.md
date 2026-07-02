## Goal
Restore the two behaviours from the earlier version of the widget, layered on top of the current widget-loader script (which controls colour, avatar, title and position):

1. When the chat is **open**, the launcher bubble swaps its logo/speech icon for a close **X**. When closed, it reverts to the original speech/logo icon.
2. The chat window opens as a **popout above the bubble** (floating card anchored to the bubble), rather than pinned to the bottom-right edge of the viewport.

## Changes (index.html only)

1. Keep the existing widget-loader `<script>` untouched so colour, avatar, title and position remain server-controlled.
2. The bubble→X toggle logic already exists in the inline script and works — leave it in place.
3. Extend the existing `HEIGHT_OVERRIDE_CSS` block (desktop only, `:not(.octopus-mobile)`) so the open `#octopus-chat-container` behaves as a popout above the bubble:
   - Fix width to ~380–400px and max-height `calc(100vh - 200px)` so it clears the header.
   - Anchor the container above the bubble: `bottom: 96px` (bubble height + gap), `right: 20px`, `top: auto`, `left: auto`.
   - Remove the loader's `padding-right`/`padding-bottom` on the open container so the card floats cleanly.
   - Add a subtle popout look: rounded corners, shadow, `transform-origin: bottom right` for the open animation.
4. Leave mobile (`.octopus-mobile`) untouched so it keeps opening full-screen.
5. Inject the override via the existing `injectHeightOverride()` call in `wire()` — no new injection points needed.

## Verification
- Desktop (1280×800) via Playwright: open the widget, confirm the container is a floating card positioned above the bubble (bottom ~96px, right ~20px), header of the page still visible, and the bubble shows the X icon. Close it, confirm bubble reverts to the speech/logo icon.
- Mobile (375×667): open the widget, confirm it still fills the screen.

## Files
- `index.html`
