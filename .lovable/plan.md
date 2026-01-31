

## Plan: Add Chatbot Widget to Website

### Overview

Add the Lovable chatbot widget script to the website so it appears on all pages.

---

### Implementation

**File to modify:** `index.html`

Add the chatbot script tag just before the closing `</body>` tag:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
  <script src="https://f634468b-9654-4bdc-8401-06aeda72dc34.lovableproject.com/chatbot-widget.js" data-chatbot-id="f532ace8-8e6d-4694-81d1-ef91e7f36915"></script>
</body>
```

---

### Technical Notes

- The script will load asynchronously and inject the chatbot widget into the page
- The `data-chatbot-id` attribute identifies which chatbot configuration to use
- Placing it at the end of the body ensures it doesn't block page rendering
- The widget will appear on all pages since it's in the root HTML file

---

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add chatbot widget script before closing `</body>` tag |

