## Change

Replace the existing widget loader script block in `index.html` with the simpler version supplied:

```html
<script src="https://qrbijjlviizhzuswiilf.supabase.co/functions/v1/widget-loader?id=f532ace8-8e6d-4694-81d1-ef91e7f36915" async></script>
```

This drops the `data-position="left"`, `data-offset-x`, `data-offset-y`, and `data-color` attributes — the widget will use whatever defaults the loader ships with (likely bottom-right, default colour).

## Also remove (since they only exist to patch the old left-anchored bubble)

1. The `<style>` block that force-positions `#octopus-chat-container` and `#octopus-chat-bubble` to the bottom-left when open.
2. The inline `<script>` block that clones the bubble, swaps the chat/X icon, and wires up `OctopusChat.toggle()`.

Rationale: those overrides were tailored to the left-side custom config and to make the bubble act as its own close button. With the plain default loader they're no longer needed and would likely fight the widget's own behaviour.

## Confirm before I build

- OK to also delete the custom `<style>` and inline `<script>` blocks? (Recommended.)
- Or keep them and only swap the loader `<script>` tag? (Not recommended — the CSS still targets `.octopus-open` and would misposition the new default-placed widget.)

## Files touched

- `index.html` only.
