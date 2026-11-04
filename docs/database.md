# Database

Postgres 18 in Docker, Drizzle ORM. Each module owns its tables; other modules read them through the
module's `index.ts` and never write them.

## Locally

- `pnpm --filter @tnt/api dev` starts the db, applies migrations, then starts the api.
- Only the db: `pnpm --filter @tnt/api db:up`; it listens on `localhost:${POSTGRES_PORT}` (5432),
  with the user, password and database from `.env`.
- psql inside the container: `docker compose exec db psql -U tnt -d tnt`.
- Reset the local db (deletes all local data): `docker compose down -v`.
- "password authentication failed" after changing `POSTGRES_PASSWORD` in `.env`: Postgres stored
  the password when the db was first created. Reset the db.

## Changing the schema

1. Edit or add `apps/api/src/modules/<module>/<feature>/schema.ts`; export it from the module's
   `schema.ts` (drizzle-kit reads only those).
2. `pnpm --filter @tnt/api db:generate --name=<what_changed>` writes the SQL to `apps/api/drizzle/`.
3. Read that SQL: it is what will run on every database.
4. `pnpm --filter @tnt/api db:migrate` applies it locally; Docker applies it on start.
5. Commit the schema and the migration together.

- Primary keys: ``uuid().primaryKey().default(sql`uuidv7()`)``; a test checks every table.
- Put rules the data must keep (unique, formats, ranges) in the table as constraints, not only in
  code.
- Never edit a migration that is on `main`: write a new one.

## Migrations from parallel branches

CI's `check:migrations` fails when your migration is older than the newest one on `main`
(someone merged theirs first). Then:

1. `pnpm --filter @tnt/api exec drizzle-kit drop` and pick your migration: it removes the SQL, the
   snapshot and the journal entry.
2. Update your branch from `main`.
3. Generate it again.

## Tests

Integration tests run on a fresh Postgres of the same image; see `docs/testing.md`.
