# Semantic i18n migration

This file documents the final semantic-key contract for the interface migration.

- UI translation keys must be semantic IDs, never user-visible Portuguese sentences.
- Shared UI copy belongs under `common.*` where the meaning is genuinely shared.
- Module-specific copy belongs under its module namespace.
- Legacy Portuguese sentence-key compatibility must not be reintroduced.
- All UI keys must be present in `pt`, `en`, `es`, `de`, and `fr`.
- Placeholders/interpolation tokens must remain identical across all five languages.
- Large domain content and engines are handled in the next migration phase.
