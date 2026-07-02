Reduce the open Octopus/Mirola chat widget height so it stops overlapping the hero title on the homepage.

**Context**
The widget loader script injects CSS that gives the open widget a fixed `max-height: 680px`. At that size the open panel reaches up behind the "South Hampshire's Biggest..." title (see screenshot). There is no built-in `data-height` attribute in the loader, so we will override the injected style.

**Change**
- File: `index.html`
- Add a `<style>` block just before the widget `<script>` tag that overrides the widget container's open-state `max-height`.
- Rule: `#octopus-chat-container.octopus-open:not(.octopus-mobile) { max-height: min(520px, calc(100vh - 140px)) !important; }`
  - Keeps the widget within the lower portion of the viewport on desktop/tablet.
  - Does not affect the full-screen mobile experience (`.octopus-mobile.octopus-open` remains at 100%).
  - Preserves the existing `data-color="#10b981"`.

**Scope and impact**
- Display-only CSS override.
- No changes to the loader script URL or chatbot configuration.
- No logic, backend, or booking flow impact.