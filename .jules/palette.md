## 2024-10-18 - Accessibility on Icon-Only Timeline Elements
**Learning:** Icon-only interactive elements in sequence builders (like reorder and delete buttons) often lack text nodes, leaving screen reader users without context about the button's action. Adding `aria-label` directly addresses this accessibility gap.
**Action:** When creating or reviewing components with icon-only buttons, especially in list or timeline interfaces, ensure each button has an explicit `aria-label` describing its function.
