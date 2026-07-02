## Problem

Two click listeners are attached to `#octopus-chat-bubble`:

1. The widget loader's original listener → always calls `openChat()`.
2. Our added listener → calls `close()` when the container has `octopus-open`.

On a click while closed, listener 1 opens the widget (adding `octopus-open`), then listener 2 fires on the same click, sees `octopus-open`, and immediately closes it. Net effect: the panel never appears to open.

## Fix

Edit `index.html` only. In the existing inline `<script>` block, replace the current "add a second listener" approach with a listener-swap:

1. When init runs, clone `#octopus-chat-bubble` with `bubble.replaceWith(bubble.cloneNode(true))` to strip the loader's `openChat` listener.
2. Re-grab the fresh bubble node.
3. Attach a single click handler that calls `window.OctopusChat.toggle()` — this cleanly opens when closed and closes when open, without double-firing.
4. Keep the existing `MutationObserver` and `applyIcon` logic pointed at the new bubble node so the chat/X icon swap continues to work.

No CSS changes. Header X still works (it's separate). Mobile behaviour unchanged.

## Technical details

- File touched: `index.html` only.
- The loader exposes `window.OctopusChat.toggle`, `.open`, `.close` — we rely on `toggle()` so state stays in sync regardless of how it was changed elsewhere.
- Cloning the node is the standard way to remove an anonymous `addEventListener` handler we don't have a reference to.
- The MutationObserver on `#octopus-chat-container` keeps the icon in sync when the widget is closed via the header X, Escape key, or an iframe message.
