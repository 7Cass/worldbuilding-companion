# Limited Effect Adoption

Effect will be used as a limited service-layer tool, not as the default programming model for the whole app. It is appropriate for Notion sync, AI diagnostics, Review Queue processing, retries, typed errors, configuration, logging, and concurrent or cancelable jobs, but should not be used in React components, UI state, simple CRUD, or ordinary rendering paths unless the code has enough failure modes or composition pressure to justify it.
