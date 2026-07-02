Reduce the open chat widget’s height so its top sits 160 px below the top of the viewport, clearing the page header/title.

## Approach
1. Keep the existing `widget-loader` `<script>` untouched so the server-controlled colour, avatar, title and position are preserved.
2. Keep the existing bubble-as-close-X inline script intact.
3. Add a tiny height override for the open widget container (desktop only):
   - Target: `#octopus-chat-container.octopus-open`
   - New `max-height: calc(100vh - 160px) !important;`
   - Leave mobile (`octopus-mobile`) at full-screen so behaviour is unchanged on phones.
4. Inject the override from the existing inline script after the widget mounts, so it reliably wins over the loader’s own injected stylesheet and avoids a separate `<style>` block that could load in the wrong order.

## File changed
- `index.html` only.

## Verification
- Open the chat on desktop and confirm its top edge clears the navigation / page title.
- Confirm the bubble still swaps to X when open and back to the avatar when closed.
- Confirm mobile still opens full-screen.