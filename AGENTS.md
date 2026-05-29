# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a documentation-first scaffold for Worldbuilding Companion. `CONTEXT.md` is the canonical domain glossary; preserve terms such as Canon, Character, Location, Faction, Event, Relationship, Lore Entry, Source, and Review Queue. `docs/prd/` contains product requirements. `docs/adr/` contains numbered architecture decisions named like `0001-kebab-case-title.md`.

No application source tree exists yet. When implementation starts, follow the ADR direction: a TypeScript Next.js local app using Tailwind, shadcn, Drizzle/Postgres, the official Notion SDK, and Vercel AI SDK. Keep domain model code independent from Notion and UI concerns.

## Build, Test, and Development Commands

No `package.json` or build system is configured yet, so do not assume `npm`, `pnpm`, or test scripts are available. Useful current checks:

- `git diff --check`: catches whitespace issues before commit.
- `rg -n "Canon|Relationship|Review Queue" CONTEXT.md docs`: reviews core terminology usage.
- `find docs -type f | sort`: lists ADR and PRD documents in sequence.

Once code is scaffolded, add explicit scripts for `dev`, `build`, `test`, `lint`, and database migrations.

## Coding Style & Naming Conventions

Use concise Markdown with sentence-case headings for docs. Name ADRs with a zero-padded sequence and kebab-case title, for example `0017-review-queue-writeback-policy.md`. Prefer ASCII unless a document already requires otherwise.

For future TypeScript code, use clear domain names from `CONTEXT.md`. Avoid generic replacements where the glossary gives a stricter term.

## Testing Guidelines

There is no test runner yet. Planned tests should verify behavior and domain contracts rather than implementation details. Prioritize unit tests for the Canon domain model, mocked Notion API tests for provisioning and sync, integration tests for Drizzle/Postgres persistence, fake-provider tests for diagnostics, and UI flow tests after the app shell exists.

## Commit & Pull Request Guidelines

This repository has no committed history yet, so no local commit convention is established. Until one exists, use short imperative subjects such as `Add review queue ADR` or `Define canon domain model`.

Pull requests should describe the change, link related PRDs or ADRs, call out terminology changes, and include screenshots for UI work once the app exists. For architecture changes, add or update an ADR.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `7Cass/worldbuilding-companion` using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default triage label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo with `CONTEXT.md` at the root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Agent-Specific Instructions

Read `CONTEXT.md` before changing domain language. Treat Notion as the canonical source and Postgres as derived state unless an ADR changes that decision. AI output must remain reviewable through the Review Queue before it affects Canon data.
