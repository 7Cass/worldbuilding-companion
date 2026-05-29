# Worldbuilding Companion

Local web app for shaping, checking, and navigating a Notion-first Canon.

## Development

1. Copy `.env.example` to `.env.local` and replace the placeholder values.
2. Run `pnpm install`.
3. Provide a local Postgres database that matches `DATABASE_URL`.
4. Run `pnpm db:migrate`.
5. Run `pnpm dev` and open the local Next.js URL.

## Sidecar Database

Postgres is sidecar persistence for derived Canon state. Notion remains the canonical source.

The current scaffold expects an existing Postgres instance reachable through `DATABASE_URL`. A reproducible Docker Compose runtime is tracked in [issue #17](https://github.com/7Cass/worldbuilding-companion/issues/17) and should land before Canon provisioning work in [issue #2](https://github.com/7Cass/worldbuilding-companion/issues/2).

## Scripts

- `pnpm dev`: starts the local Next.js app.
- `pnpm build`: builds the app.
- `pnpm test`: runs automated tests.
- `pnpm lint`: runs ESLint.
- `pnpm db:generate`: generates Drizzle migrations from `src/db/schema.ts`.
- `pnpm db:migrate`: applies Drizzle migrations to Postgres using `DATABASE_URL`.
- `pnpm db:studio`: opens Drizzle Studio.
