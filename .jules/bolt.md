## 2026-11-10 - Debouncing LocalStorage for Large States
**Learning:** Saving large application states containing base64 data URIs to `localStorage` synchronously during rapid events (like text input) causes main-thread blocking and UI freezes, as `JSON.stringify` can be very expensive.
**Action:** Always debounce operations like state persistence to `localStorage` to prevent jank, especially when the state includes large strings.
