## Goal
Ensure the open chat popout window has the same side gap from the viewport edge as the launcher bubble, on whichever side the CRM positions the widget.

## Change (index.html only)
Extend the existing `HEIGHT_OVERRIDE_CSS` block (desktop only, `:not(.octopus-mobile)`) so `#octopus-chat-window` is inset from the edge to match the bubble's gap (~20px), mirrored for left-anchored widgets.

Add rules like:
- `#octopus-chat-container.octopus-open:not(.octopus-mobile) #octopus-chat-window{ right:20px!important; left:auto!important; }`
- Left-side variant (when container/body indicates left placement, e.g. `.octopus-left` or `[data-position="left"]`): `left:20px!important; right:auto!important;`

Keep the existing `bottom:80px` lift and the bubble→X toggle behavior. Mobile full-screen behavior untouched.

## Verification
Use Playwright at 1280×800 to open the widget and confirm the chat window's right edge sits ~20px from the viewport edge (matching the bubble). If possible, toggle a left-positioned variant and confirm the mirror.

## Files
- `index.html`
