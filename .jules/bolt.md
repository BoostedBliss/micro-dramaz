## 2024-11-09 - Debouncing LocalStorage Persistence with Large State
**Learning:** Saving state containing large base64 strings (like data URIs for images) synchronously to `localStorage` blocks the main thread and causes UI freezes during rapid updates (like typing).
**Action:** Always debounce operations like `localStorage.setItem` when the state size is large to keep the main thread unblocked.
