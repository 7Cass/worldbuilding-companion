# Worldbuilding Companion

Local web app for shaping, checking, and navigating a Notion-first Canon.

## Development

1. Copy `.env.example` to `.env.local` and replace the placeholder values.
2. Run `pnpm install`.
3. Run `pnpm dev` and open the local Next.js URL.

## Scripts

- `pnpm dev`: starts the local Next.js app.
- `pnpm build`: builds the app.
- `pnpm test`: runs automated tests.
- `pnpm lint`: runs ESLint.
- `pnpm db:generate`: generates Drizzle migrations from `src/db/schema.ts`.
- `pnpm db:migrate`: applies Drizzle migrations to Postgres using `DATABASE_URL`.
- `pnpm db:studio`: opens Drizzle Studio.

Postgres is sidecar persistence for derived Canon state. Notion remains the canonical source.
