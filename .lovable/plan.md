## Goal
Stop the launcher bubble from jumping position when it toggles into the close (X) state. It should stay in the exact same spot as the closed speech-icon bubble.

## Cause
When the widget opens, the loader's own styles reposition/resize `#octopus-chat-bubble` (moves it into the container corner and/or changes size), so our `display:flex!important` override reveals it in a new location. The icon swap itself is fine — the shift is layout.

## Change (index.html only)
Extend the desktop-only `HEIGHT_OVERRIDE_CSS` block so the open-state bubble is pinned to the same viewport position and size as the closed-state bubble:

- `#octopus-chat-container.octopus-open:not(.octopus-mobile) #octopus-chat-bubble{`
  - `position:fixed!important;`
  - `right:20px!important; bottom:20px!important; left:auto!important; top:auto!important;`
  - `width:60px!important; height:60px!important;`
  - `margin:0!important;`
  - `transform:none!important;`
- Mirror for left-anchored widgets (`.octopus-left` / `[data-position="left"]`): `left:20px!important; right:auto!important;`

Keep the existing icon-swap logic and the popout window offsets untouched.

## Verification
Playwright at 1280×800: capture the bubble's `getBoundingClientRect()` before click, click to open, capture again, assert the rect is unchanged (±1px). Confirm the X icon renders in the same spot as the speech icon.

## Files
- `index.html`
