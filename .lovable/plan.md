## Goal

When the chatbot is open, the floating launcher bubble should stay visible and show a close (X) icon so users can click it to close the widget. When closed, it returns to the speech-bubble chat icon. The existing X button in the chatbot header stays as-is (two close options).

## Changes

Edit `index.html` only — add a small CSS + JS override just after the widget loader script:

1. **CSS override** — undo the widget's `.octopus-open #octopus-chat-bubble { display: none }` rule so the bubble remains visible when open. Position it so it sits at the bottom-left corner (matching the current `data-position="left"` and `data-offset` values), floating below the open panel that already sits at `bottom: 88px`.

2. **Small inline script** — after the widget loader has initialised, swap the bubble's inner icon based on state:
   - When container has class `octopus-open`: render an X (close) SVG inside `#octopus-chat-bubble` and set `aria-label="Close chat"`.
   - When container has class `octopus-closed`: render the original chat/speech-bubble SVG and set `aria-label="Open chat"`.
   - Attach a click handler on the bubble that calls `window.OctopusChat.toggle()` (already exposed by the loader) so a click while open closes the widget.
   - Use a `MutationObserver` on `#octopus-chat-container`'s `class` attribute to keep the icon in sync with open/close (covers header-X clicks, Escape key, and iframe-driven closes).
   - Guard with a poll/wait until `#octopus-chat-container` and `window.OctopusChat` exist, since the loader is `async`.

3. **No changes** to the header, header X button, colours, position, panel size, or mobile behaviour. The header X in the chatbot continues to work exactly as today.

## Technical details

- File touched: `index.html` only.
- The Mirola widget loader defines `.octopus-open #octopus-chat-bubble { display: none !important; }`. Override with `#octopus-chat-container.octopus-open #octopus-chat-bubble { display: flex !important; }` inside the existing `<style>` block.
- Bubble stays anchored to `bottom: 20px; left: 20px` in both states — because the open panel sits at `bottom: 88px`, the bubble naturally appears just underneath it, giving the "popping up above the icon" effect already established.
- Icon swap is done by replacing `innerHTML` of `#octopus-chat-bubble` with inline SVGs (chat bubble SVG when closed, X SVG when open). SVGs use `fill: white` to inherit the existing bubble styling.
- Click behaviour: keep the loader's existing `bubble.addEventListener('click', openChat)` untouched, but also attach a second listener that, when `isOpen` (detected via container class), calls `window.OctopusChat.close()`. The loader's open handler is a no-op when already open, so no conflict.
