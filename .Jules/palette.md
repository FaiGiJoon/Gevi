## 2025-05-09 - [UX Synchronization and Accessibility Polish]
**Learning:** Initial page load states often drift from system state in simple SPA-like interfaces. Explicitly fetching the current system state (e.g., current palette) during initialization ensures the UI is honest and functional from the start.
**Action:** Always include a "sync" step in the initialization logic that aligns dropdowns, toggles, and previews with the backend's current configuration.
