## 2026-11-11 - Debounce LocalStorage Saves
**Learning:** Saving large JSON objects, especially those containing large base64 image strings, synchronously to `localStorage` on rapid state updates (like keystrokes or interval events) causes main-thread blocking and UI jank.
**Action:** Always debounce background operations like `localStorage.setItem` using a `useRef` timeout when saving complex/large state to prevent performance degradation.
