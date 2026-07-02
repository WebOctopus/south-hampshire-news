Apply a 20px gap between the chat bubble and the open chat window to match the existing side gap.

Current behaviour
- The desktop chat bubble is pinned at `bottom: 20px; right: 20px` (or `left: 20px` when anchored left) and is 60px tall.
- The chat window is currently offset `bottom: 80px`, which makes it sit exactly on top of the bubble with no visible spacing.

Change
- In `index.html`, update the `HEIGHT_OVERRIDE_CSS` block so the open `#octopus-chat-window` is offset `bottom: 100px` instead of `bottom: 80px` on desktop (`:not(.octopus-mobile)`), for both right-aligned and left-aligned widget positions.
- This adds a 20px vertical gap between the top of the bubble and the bottom of the chat window, matching the 20px horizontal side gap already in place.

Verification
- Use Playwright to open the chat widget on the homepage at desktop viewport, take a screenshot, and visually confirm a 20px gap between the bubble and the chat window. Optionally assert `getBoundingClientRect()` distance is 20px.