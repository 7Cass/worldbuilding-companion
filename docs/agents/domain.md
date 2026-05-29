# Domain docs

How engineering skills should consume this repo's domain documentation.

## Layout

This is a single-context repo.

- Read `CONTEXT.md` at the repo root before changing domain language.
- Read relevant ADRs in `docs/adr/` before architecture, implementation, diagnosis, or testing work.
- There is no `CONTEXT-MAP.md`; do not look for per-context domain files unless the repo layout changes.

## Vocabulary

Use the glossary terms from `CONTEXT.md`, especially Canon, Character, Location, Faction, Event, Relationship, Lore Entry, Source, and Review Queue.

Avoid synonyms that `CONTEXT.md` explicitly rejects.

## Architectural decisions

Treat Notion as the canonical source and Postgres as derived state unless an ADR changes that decision.

AI output must remain reviewable through the Review Queue before it affects Canon data.

If a proposed change contradicts an ADR, surface the conflict explicitly instead of silently overriding it.
