# Worldbuilding Companion

Local web app for shaping, checking, and navigating a Notion-first Canon.

## Development

1. Copy `.env.example` to `.env.local` and replace the placeholder values.
2. Run `pnpm install`.
3. Run `docker compose up -d` to start the local Postgres sidecar.
4. Run `pnpm db:migrate`.
5. Run `pnpm db:verify`.
6. Run `pnpm dev` and open the local Next.js URL.
7. Open `/setup`, enter a Canon name, and provision the owned Notion structure.

## Sidecar Database

Postgres is sidecar persistence for derived Canon state. Notion remains the canonical source.

The Docker Compose runtime starts Postgres with credentials that match `.env.example`:

- Start: `docker compose up -d`
- Apply migrations: `pnpm db:migrate`
- Verify connectivity: `pnpm db:verify`
- Stop: `docker compose down`
- Reset local database storage: `docker compose down --volumes`

`pnpm db:verify` checks the Postgres connection and prints that Postgres is derived sidecar state while Notion remains canonical. It does not create or change Canon data.

After a reset, start Postgres again and rerun `pnpm db:migrate` before using the app.

## Canon Provisioning

The Setup surface can create or register one Canon and provision the owned Notion structure under `NOTION_PARENT_PAGE_ID` using the internal Notion integration from `NOTION_TOKEN`.

Provisioning creates or verifies separate Notion databases for Characters, Locations, Factions, Events, Lore Entries, Relationships, and Sources. Re-running the flow is idempotent: each database is reported as `created`, `reused`, or `needs_attention`.

Postgres stores the Canon identity, Notion database identifiers, provisioning status, and sync metadata as derived sidecar state. Notion remains the canonical source for Canon data.

## Scripts

- `pnpm dev`: starts the local Next.js app.
- `pnpm build`: builds the app.
- `pnpm test`: runs automated tests.
- `pnpm lint`: runs ESLint.
- `pnpm db:generate`: generates Drizzle migrations from `src/db/schema.ts`.
- `pnpm db:migrate`: applies Drizzle migrations to Postgres using `DATABASE_URL`.
- `pnpm db:verify`: verifies the local Postgres sidecar connection without writing Canon data.
- `pnpm db:studio`: opens Drizzle Studio.
