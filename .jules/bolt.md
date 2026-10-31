
## 2024-05-19 - Image lazy loading optimization for StoryboardTimeline
**Learning:** Rendering many full-size scenes with generated or placeholder images in `StoryboardTimeline` simultaneously triggers massive network and decoding operations for images below the fold, causing initial render jank and slow load times.
**Action:** Always add `loading="lazy"` to `<img>` tags in components rendering lists of potentially off-screen images (e.g., `StoryboardTimeline`, `GlobalStyleModal`, etc.) to defer image loading until they are near the viewport.
