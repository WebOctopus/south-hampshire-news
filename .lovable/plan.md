Update the Mirola chatbot widget script in `index.html` so its colour matches the "Customer Login" button.

**Change**
- File: `index.html`
- Line: chatbot widget `<script>` tag
- Current: `data-color="#0066FF"`
- New: `data-color="#10b981"`

**Why this colour?**
The "Customer Login" button in `src/components/Navigation.tsx` uses Tailwind's `bg-community-green`, which is defined as `#10b981` in `tailwind.config.ts`.

**Scope and impact**
- Single-line, display-only change.
- No logic, database, or payment flow impact.
- The widget loader uses `data-color` to set the chatbot's primary colour/hover state.