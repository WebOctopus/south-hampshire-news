Move the chatbot bubble to the left side of the page and make the open chat window appear as a floating card above the bubble location instead of anchored to the bottom corner.

**Changes**
- File: `index.html`
1. Change `data-position="right"` to `data-position="left"` on the widget script tag. This places the closed chat bubble on the bottom-left.
2. Update the inline CSS override block (added previously) to reposition the open widget container so it floats above where the bubble was:
```css
#octopus-chat-container.octopus-open:not(.octopus-mobile) {
  bottom: 88px !important;                    /* sit above the 60px bubble + 20px offset */
  left: 20px !important;
  right: auto !important;
  width: 380px !important;
  max-width: calc(100vw - 40px) !important;
  height: auto !important;
  max-height: min(520px, calc(100vh - 140px)) !important;
  padding: 0 !important;
}
```

**Why this works**
- The Octopus loader injects a stylesheet that anchors the open container to `bottom: 0` and spans `width/height: 100%` (capped at 420×680 px). This override removes the full-side anchoring and resizes the container to a fixed-width card that floats just above the normal bubble position.
- The `:not(.octopus-mobile)` guard keeps full-screen behaviour on mobile where the widget should remain edge-to-edge.
- `!important` and the body-after-script placement ensure these rules win over the injected loader styles.

**Scope and impact**
- Display-only change to `index.html`.
- No logic, backend, or booking flow impact.
- Preserves the existing green colour (`data-color="#10b981"`).