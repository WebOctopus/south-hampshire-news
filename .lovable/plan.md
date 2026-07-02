## Why the chat opens on the opposite side

The bubble is anchored bottom-left by the CRM, but our custom CSS in `index.html` (added earlier to stop the Close-X from jumping) hard-codes the open state to `right:20px`. It only mirrors to the left when the container has an `.octopus-left` class or `[data-position="left"]` attribute — and this particular CRM build doesn't set either. So on open, our override yanks the bubble to the right while the CRM keeps the chat window on the left, splitting them across the screen.

## Fix

Detect the bubble's actual side at runtime instead of relying on CRM class names.

1. In the boot script in `index.html`, when `wire()` runs, read the bubble's computed `left`/`right` (and its `getBoundingClientRect().left` vs viewport width) to determine whether the widget is anchored left or right.
2. Add a class (`octopus-anchor-left` or `octopus-anchor-right`) to `#octopus-chat-container` based on that measurement, and re-check on resize.
3. Rewrite the override CSS to key off those two classes instead of `.octopus-left` / `[data-position="left"]`, so both the bubble (fixed close-X position) and the chat window (20px side gap + 20px bottom gap above the bubble) always match the side the CRM chose.
4. Verify with Playwright at 1280×800: open the widget, confirm bubble and window are both on the same side with the 20px side gap and 20px vertical gap between them.

Scope stays in `index.html`; no other files touched.
