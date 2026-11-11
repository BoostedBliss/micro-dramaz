## 2024-05-18 - Synchronous LocalStorage Blocking with Base64 Images
**Learning:** Storing large base64 strings (data URIs for images) in React state and subsequently writing them to `localStorage` synchronously on every keystroke/update causes severe main-thread blocking. `JSON.stringify` on massive objects freezes the UI and causes input lag.
**Action:** When a global state object contains heavy data (like inline base64 images) and needs to be persisted locally, use debouncing to delay `localStorage.setItem` writes, preventing micro-stutters during high-frequency updates like text inputs.
