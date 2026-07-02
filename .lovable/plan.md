## Problem

The launcher bubble is `position: absolute` inside `#octopus-chat-container`. When the container expands to the open panel (380x520 at `bottom: 88px; left: 20px`), the bubble no longer sits at the bottom-left of the viewport — it sits inside the panel's bottom-left corner, covering the chat UI and making it look like the widget didn't open.

Session replay confirms the open/close toggle is actually firing (aria-labels swap between "Open chat" and "Close chat"), so the JS logic is fine — this is purely a positioning issue introduced when we kept the bubble visible while open.

## Fix

Edit `index.html` only. Add a CSS rule so that when the container has `octopus-open`, the bubble breaks out of the container and anchors to the viewport instead:

- `#octopus-chat-container.octopus-open #octopus-chat-bubble` → `position: fixed; bottom: 20px; left: 20px; right: auto; top: auto;` (with `!important` to beat the loader's inline styles).
- Keep the existing `display: flex !important` override so the bubble stays visible.
- Leave mobile behaviour untouched: scope this to `:not(.octopus-mobile)` so full-screen mobile chat is unaffected.

Result: when open, the floating panel sits at `bottom: 88px` and the bubble (now showing the X icon) sits at `bottom: 20px` — the "popping up above the icon" effect is preserved, and the chat panel is no longer covered.

No JS changes; the icon-swap script and header X remain as-is.
