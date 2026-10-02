# Prisma gotchas in this repo

Two specific things will bite you if you don't know about them. Both
came in with the Registry refactor.

## 1. `npm run db:push` cannot rewrite enums

The Registry migration
(`prisma/migrations/20260102000000_programmes_enrollment_status_sms_ids/`)
rewrites the `EnrollmentStatus` enum from
`{active, graduated, transferred, dropped}` to
`{enrolled, deferred, withdrawn, completed}`, with a data mapping
baked into the SQL. `prisma db push` runs Prisma's own schema-diff
engine, which only knows how to *add* enum values — when values are
*removed*, it can't know which old rows map onto the new ones, and
the cast fails with `invalid input value for enum
"EnrollmentStatus_new": "active"`.

**Use `npm run db:migrate:deploy`** (`prisma migrate deploy`) for
first-time setup and any future enum change. It replays the
hand-written `.sql` files in `prisma/migrations/` in order and
records each in `_prisma_migrations`.

`db:push` is still fine for purely additive schema changes
(new nullable column, new index, new table).

## 2. `npm run db:migrate` does not work

`npm run db:migrate` runs `prisma migrate dev`, which uses a
**shadow database** to detect drift. The shadow DB is empty, and
this repo's earliest migration
(`20251001000000_unified_roles_courses_enrollments_materials`) was
written to apply on top of an existing schema (created by an
earlier `db push`) — it has no baseline `CREATE TABLE` block, so
it crashes on the shadow DB with `relation "User" does not exist`
(P3018).

**Fix:** use `npm run db:migrate:deploy` everywhere. To make
`db:migrate` work in the future, you'd need a
`prisma/migrations/20240101000000_baseline/migration.sql` with every
`CREATE TABLE` / `CREATE TYPE` statement the schema would
auto-generate from a fresh `db push`. Not worth doing until drift
detection is actually needed.

## 3. After editing the schema: clear `.next/`

Turbopack caches the **compiled** version of every server component
the first time it's hit. The cache captures references to whatever
Prisma client object existed at that moment. Regenerating the
client updates `node_modules/.prisma/client/` on disk, but the
cached page bundle keeps a reference to the old one — so
`prisma.<newModel>` is `undefined` at runtime, even though TypeScript
and `npx prisma validate` are both green.

You'll see `prisma.<model>` being `undefined` for **every** page that
touches the new model. The fix:

```bash
npm run db:generate         # update node_modules/.prisma/client/
npm run db:migrate:deploy   # or `npm run db:push` for additive changes
# stop `npm run dev`
rm -rf .next                # drop Turbopack's cached bundles
npm run dev
```

The `.next` clear is the step that's easy to forget. Don't.

## Symptom cheat-sheet

| Error | Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'findMany')` on a new model | Stale Turbopack bundle referencing the pre-regen client | `rm -rf .next` and restart |
| TS says `prisma.foo` exists but runtime says undefined | Same — TS uses the fresh `.d.ts`, runtime uses the cached bundle | `rm -rf .next` |
| `invalid input value for enum "EnrollmentStatus_new": "active"` from `db:push` | Used `db:push` for an enum rewrite | Use `npm run db:migrate:deploy` |
| `P3006 … relation "User" does not exist` from `db:migrate` | Shadow DB is empty; earliest migration has no baseline | Use `npm run db:migrate:deploy` |