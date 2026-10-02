# SMS — School Management System

A multi-tenant school management web app built as a technical assessment.
Implements Modules 1–3 of the brief (Auth + RBAC, Schools & Users CRUD,
Students & Teachers CRUD) plus the **Registry / Programme** refactor that
landed in the PEN Global pass: a `Programme` model, programme-based fee
structures, the `enrolled / deferred / withdrawn / completed` enrollment
lifecycle, and auto-generated `SMS-YYYY-####` student IDs. Ships with a
Vitest integration suite and placeholder pages for the navigation
entries that ship in later modules.

## Registry (PEN Global)

The brief refers to a **"Registry"** stakeholder voice. The Registry is
**not** a separate code role — it maps to the merged **ADMIN** role
(`/admin` dashboard). Conceptually, the Registry team:

- Owns the catalogue of **Programmes** (degrees/tracks) — `/admin/programmes`.
- Issues **Student IDs** in the `SMS-YYYY-####` format per school, per year.
- Manages the **enrollment lifecycle** (`enrolled → deferred / withdrawn / completed`).
- Sets the **programme-based fee structure** that `createInvoice` auto-derives
  from when no explicit `feeStructureId` is supplied.

The full data-model is **programme-based**: every `Student` belongs to a
`Programme`, every `FeeStructure` is attached to a `Programme` (with
`classId` retained as an optional sub-scope), and every `Invoice`'s amount
is derived from `student.programme → active FeeStructure`.

> A hands-on test script for these features (programmes CRUD,
> auto-generated `SMS-YYYY-####` IDs, programme-based fees, the
> overdue widget, the CSV import, and cross-school guards) lives in
> [`docs/REGISTRY_TEST_GUIDE.md`](./docs/REGISTRY_TEST_GUIDE.md).

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.3.2** (App Router, Turbopack) + React 19 |
| Language | **TypeScript** in `strict` mode |
| Database | **PostgreSQL 16** via Prisma 7's driver adapter (`@prisma/adapter-pg` + `pg`) |
| ORM | **Prisma 7.10** with full schema in `prisma/schema.prisma` |
| Auth | **NextAuth v5 (beta)** — credentials provider, JWT sessions, bcryptjs |
| Validation | **Zod 4** + react-hook-form on the client |
| Styling | **Tailwind CSS v4**, Radix primitives, `class-variance-authority`, `lucide-react` |
| Tests | **Vitest 2** (integration — exercises real Prisma against a Postgres test schema) |

## Quick start

This is the path a fresh reviewer follows after cloning the repo.

**Prerequisites**

- **Node 22 or newer** (a `.nvmrc` pins `22`; `package.json` declares
  `engines.node >=22`).
- **Docker + Docker Compose** — the dev DB is a Postgres container; the
  compose file also provisions an `app` and `cron` container, but for
  day-to-day development we just run the DB and start Next.js on the
  host (faster HMR).
- A POSIX shell (bash / zsh).

**Steps**

```bash
# 1. Install dependencies. The "postinstall" hook regenerates the
#    Prisma client so it matches the current schema.
npm install

# 2. Start Postgres (just the `db` service; the host-side Next.js
#    dev server connects to it via the published localhost:5432 port).
docker compose up -d db
docker compose ps     # confirm `sms-db` is "healthy" within ~10s

# 3. Create your local .env from the committed template.
cp .env.example .env

# 4. Generate real secrets for the two placeholders. AUTH_SECRET is
#    used by NextAuth to sign JWTs; CRON_SECRET is the shared bearer
#    token the cron container uses to hit /api/cron/* endpoints.
#    Replace the `replace-me-with-…` placeholders in .env with the
#    output of these:
#        openssl rand -base64 32   # paste into AUTH_SECRET
#        openssl rand -hex 32     # paste into CRON_SECRET

# 5. Apply the database migrations. The Registry refactor ships a
#    hand-written migration that rewrites the `EnrollmentStatus` enum
#    (active → enrolled, etc.) — `db:push` can't do that, so we use
#    `db:migrate:deploy` (which is `prisma migrate deploy` — no
#    shadow database, just replays pending migrations onto the real DB).
npm run db:migrate:deploy

# 6. Seed demo data. Idempotent — safe to re-run; updates existing
#    rows by their natural keys instead of erroring.
npm run db:seed

# 7. Start the dev server.
npm run dev
# open http://localhost:3000
```

Sign in with one of the [demo credentials](#demo-credentials) below.

**If `docker compose up -d db` complains that port 5432 is already
in use**, stop the conflicting service or change the published port in
`docker-compose.yml` (and update `DATABASE_URL` in `.env` to match).

**If you only want Postgres in Docker and want to run the app + cron
inside containers too**, run `docker compose up --build` instead of
step 7. That uses the bundled `Dockerfile`, exposes the app on
`http://localhost:3000`, and the `cron` service hits `/api/cron/*`
on the in-network `app` service. The `DATABASE_URL` in your `.env`
should use `localhost` either way (the host-side `app` container's
own env uses `db` — see `docker-compose.yml`).

## Demo credentials

| Role | Email | Password | What they can do |
|---|---|---|---|
| Super admin | `admin@sms.local` | `admin123` | Create schools, jump into any tenant, manage platform users |
| School admin | `school.admin@sms.local` | `admin123` | Manage Sunrise Academy users, students, programmes, fees |
| Teacher | `teacher@sms.local` | `admin123` | My Courses, Assessments, Enter Results |
| Student | `student@sms.local` | `admin123` | My Courses, Browse Courses, My Assessments, My Results, My Fees |

The seed creates one school (`Sunrise Academy`), two programmes
(`BSC-CS` and `BBA`), one class (`Grade 10 - A`), one teacher
(`Ayesha Siddiqua`), one student (`Rahim Ahmed`, `SMS-2025-0001`) already
enrolled, one subject (`Mathematics`), and one library book.

## Project structure

```
app/
├── (auth)/               ← login, logout
├── (dashboard)/          ← role-gated dashboards
│   ├── super-admin/      ← schools, users, students, teachers
│   ├── school-admin/     ← scoped to one school
│   ├── teacher/          ← personal view + Module 4–6 placeholders
│   └── student/          ← personal view + Module 4–6 placeholders
├── api/auth/[...nextauth]/route.ts
└── unauthorized/

lib/
├── actions/              ← server actions ("use server") — one file per resource
│   ├── _helpers.ts       ← ActionResult<T>, writeAuditLog, generateTempPassword
│   ├── schemas.ts        ← Zod schemas + input/output type aliases
│   ├── auth.ts           ← login/logout/getCurrentSession
│   ├── schools.ts        ← create/update/toggleActive for schools
│   ├── programmes.ts     ← list/create/update/toggleActive for programmes
│   ├── fees.ts           ← fee structures + invoices (auto-derives from programme)
│   ├── users.ts          ← create/update/toggleActive + temp-password flow
│   ├── students.ts       ← create/update/toggleActive + auto SMS-#### ids
│   ├── enrollments.ts    ← enrollment lifecycle (enrolled/deferred/withdrawn/completed)
│   ├── teachers.ts       ← create/update/toggleActive + audit logs
│   └── students-import.ts ← bulk CSV import with programmeCode
├── auth.ts, auth-helpers.ts   ← NextAuth wiring + requireRole/requirePermission
├── rbac.ts               ← PERMISSIONS matrix, ROLE_NAV, nav helpers
├── sequences.ts          ← nextInvoiceNo, nextReceiptNo, nextStudentId
├── fees-utils.ts         ← formatCents, deriveStatus (shared client/server)
├── db/prisma.ts          ← singleton Prisma client (driver-adapter)
└── ...

components/
├── ui/                   ← shadcn-style primitives (Button, Card, …)
├── shell/                ← Sidebar, header, ComingSoon, RoleOverview
├── auth/                 ← login form
├── admin/
│   ├── schools/          ← school CRUD UI
│   ├── programmes/       ← programme CRUD UI (Registry)
│   ├── users/            ← user CRUD UI
│   ├── students/         ← student CRUD UI + CSV import wizard
│   ├── enrollments/      ← enrollment status control + history
│   └── teachers/         ← teacher CRUD UI
└── fees/                 ← FeesHub, FeeStructureForm, invoice list

prisma/
├── schema.prisma         ← full DB schema
├── seed.ts               ← idempotent demo seed (programmes, fees, student)
└── migrations/           ← versioned SQL migrations

tests/
├── setup.ts              ← isolated test DB, reset/seed helpers
├── stubs/server-only.ts  ← no-op stub for the `server-only` package
└── actions/
    ├── createStudent.test.ts   ← 4 integration cases
    ├── createProgramme.test.ts ← 3 integration cases
    └── programmeFees.test.ts   ← 3 integration cases
```

## Architecture notes

### RBAC

Every protected route runs `requireRole(<role>)` or
`requirePermission("<permission>")` server-side. The permission matrix lives in
`lib/rbac.ts`; the sidebar nav (`ROLE_NAV`) is driven by the same matrix so the
visible menu can never drift from what the role can actually open.

### Server actions return `ActionResult<T>`

Every server action returns a discriminated union:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

This avoids thrown errors crossing the server/client boundary; client forms
pattern-match on `result.ok` and show `result.error` inline. Multi-field Zod
failures come back as `fieldErrors[name][]` for per-input highlighting.

### Atomic mutations + audit log

Mutations that touch multiple tables (e.g. `createStudent` → User + UserRole +
Student + Enrollment) run inside `prisma.$transaction` and call
`writeAuditLog(tx, …)` inside the same transaction. Either everything commits
or nothing does, and the audit row is guaranteed to exist for every successful
state change. Uniqueness checks (email, admissionNo per school) run **before**
the transaction so a violation never even opens a savepoint.

### Tenant isolation

`school_admin` rows always carry a non-null `schoolId`. Server actions that
read or write data scoped to a school filter on the actor's `schoolId`; the
created/updated record's `schoolId` is forced from the session and ignored
from the form payload. Cross-school writes (e.g. a `currentClassId` belonging
to a different school) are rejected pre-transaction.

### Server-only enforcement

`lib/actions/*` imports `server-only` at the top. If a client component
accidentally imports from there, the build fails fast rather than leaking
server code into a bundle. The Vitest config aliases `server-only` to a no-op
stub because the test process isn't a Next bundler.

## Testing

```bash
npm test            # one-shot, exits non-zero on failure
npm run test:watch  # re-run on change
```

The test suite pushes the current schema into the test Postgres database
(defaults to the same DB used for local dev; override with `DATABASE_URL_TEST`),
then truncates every table and re-seeds fixtures (`tests/setup.ts`) before
each test. The action under test exercises the real Prisma client, real
Zod schema, real audit-log writes, and real transaction rollback — only
`auth()` and `next/cache` are stubbed.

What's covered today:

- **`createStudent`** (`tests/actions/createStudent.test.ts`) — atomic
  happy path (User + UserRole + Student + Enrollment + two audit rows),
  email uniqueness rejection, cross-school class rejection with no row
  leaks, missing programme rejection, admission-number auto-generation
  (`SMS-YYYY-####`), and sequential non-colliding IDs.
- **`createProgramme`** (`tests/actions/createProgramme.test.ts`) —
  happy path + audit, duplicate code per school, cross-school guard.
- **`programmeFees`** (`tests/actions/programmeFees.test.ts`) —
  `createFeeStructure` with `programmeId`, `createInvoice` auto-derives
  amount from the student's programme, and a graceful refusal when no
  amount can be derived.

What's **not** covered yet: `update*`, `toggle*Active`, the rest of the action
chain (`schools`, `users`, `teachers`). These will land as their respective
modules ship.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest one-shot |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:push` | Apply current `schema.prisma` to the dev DB (additive changes only) |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | `prisma migrate dev` — needs a baseline migration; **broken in this repo, see [After editing the Prisma schema](#after-editing-the-prisma-schema)** |
| `npm run db:migrate:deploy` | `prisma migrate deploy` — replays pending migrations; **use this for first-time setup and any enum rewrite** |
| `npm run db:studio` | Open Prisma Studio against the dev DB |
| `npm run db:seed` | Idempotent demo seed |

## After editing the Prisma schema

When you add or change a model (e.g. adding `Programme`, renaming a
field, swapping an enum), the dev server needs **all four** of these in
order, or you'll see a confusing runtime error like
`Cannot read properties of undefined (reading 'findMany')`:

```bash
# 1. Regenerate the client so `node_modules/.prisma/client/` knows
#    about the new model.
npm run db:generate

# 2. Sync the DB. **Use `npm run db:migrate:deploy` (not `db:migrate`)
#    if the change includes a hand-written migration under
#    `prisma/migrations/`** (e.g. the
#    `20260102000000_programmes_enrollment_status_sms_ids` migration
#    that rewrites `EnrollmentStatus`). See the next section for why
#    `db:migrate` doesn't work in this codebase.
npm run db:migrate:deploy

# 3. Stop `npm run dev` if it's running, then drop Turbopack's
#    compiled-server-module cache — otherwise it keeps serving the
#    page bundle that was built against the *old* client.
rm -rf .next

# 4. Restart.
npm run dev
```

### `db:push` vs `migrate deploy` vs `migrate dev` — when to use which

| Situation | Use |
|-----------|------|
| Pure additive change (new nullable column, new index, new table) | `npm run db:push` |
| Adding/changing an enum (drops old values, adds new ones) | `npm run db:migrate:deploy` |
| Hand-written migration in `prisma/migrations/<timestamp>_*` exists for this change | `npm run db:migrate:deploy` |
| Schema and DB are already in sync and you just want to regenerate the client | `npm run db:generate` only |

> **`npm run db:migrate` does not work in this codebase.** It runs
> `prisma migrate dev`, which uses a shadow database to detect drift.
> The shadow DB is empty, and the project's earliest migration
> (`20251001000000_…`) was written to apply on top of an existing
> schema (created by `db push`) — it never had a baseline `CREATE
> TABLE` block, so it crashes on the shadow DB with `relation "User"
> does not exist` (P3018). Use `db:migrate:deploy` instead; it doesn't
> need a shadow DB and just replays pending migrations onto the real
> DB.

`db:push` is the fast path: it skips migration history entirely and
applies the schema diff directly. That's fine for additive work where
nothing in the DB needs rewriting. It's **not** fine for enum rewrites
because Prisma's diff engine only knows how to add enum values — when
you drop values, it can't know which old values map onto the new ones,
so it fails the cast.

`prisma migrate deploy` runs any hand-written `.sql` files in
timestamp order and records each in `_prisma_migrations`, so the audit
trail survives. Our hand-written enum rewrite uses the TEXT → UPDATE →
DROP TYPE → CREATE TYPE → CAST pattern precisely so this works.

### Adding a baseline migration later

If you want to make `migrate dev` work cleanly in the future, you'd
need a `prisma/migrations/20240101000000_baseline/migration.sql` that
contains every `CREATE TABLE` and `CREATE TYPE` statement that the
schema would auto-generate from a fresh `db push`. That's a sizeable
chunk of SQL; not worth doing until the project needs the drift
detection that `migrate dev` provides.

### Why the `.next` clear is non-optional

Turbopack caches the **compiled** version of every server component the
first time it's hit. The cache captures references to whatever Prisma
client object existed at that moment. Regenerating the client updates
`node_modules/.prisma/client/` on disk, but the cached page bundle keeps
a reference to the old one — so `prisma.<newModel>` stays `undefined`
even though the freshly-generated client works in plain Node.

You'll see this as `prisma.<model>` being `undefined` for **every**
page that touches the new model, even though `npx prisma validate`
passes and `npx prisma generate` succeeds. Stopping the server and
removing `.next/` is the only fix — the runtime, generated client, and
schema are otherwise correct.

### What you'll see if you skip the cache clear

| Symptom | Cause |
|---|---|
| `Cannot read properties of undefined (reading 'findMany')` on a new model | Stale Turbopack bundle referencing the pre-regen client |
| TypeScript says `prisma.foo` exists but runtime says it's undefined | Same as above — TS uses the freshly-generated `.d.ts`, runtime uses the cached bundle |
| `prisma.<oldModel>` works but `prisma.<newModel>` throws | The new model was added since the cache was last built |
| Test passes, dev fails | Vitest re-imports the client fresh each run; Turbopack does not |
| `Error: invalid input value for enum "EnrollmentStatus_new": "active"` from `db:push` | Used `db:push` for a hand-written enum rewrite; use `prisma migrate deploy` instead (it executes the data-mapping `.sql` in the migration file) |
| `Error: P3006 … Migration … failed to apply cleanly to the shadow database … relation "User" does not exist` from `db:migrate` | `migrate dev` uses a shadow DB and this project has no baseline migration (the earliest one was written on top of an existing schema). Use `prisma migrate deploy` instead |

## Notes & known constraints

- **Postgres via Docker Compose** — local dev expects the `db` service in
  `docker-compose.yml` to be running. The `app` container talks to it via
  Compose's internal network (`db:5432`); host-machine tools (Prisma CLI,
  Studio, Vitest) use `localhost:5432`. Both URLs ship in `.env.example`.
- **No background jobs** — audit-log writes are inline in the action
  transaction. A queue (BullMQ, etc.) would be the next step if report
  generation or bulk imports land.
- **No CSRF token rotation** — Next.js server actions have built-in
  same-origin protection via the action ID; explicit CSRF tokens are not
  added.

## How I built this (and where AI helped)

The product decisions are mine. AI was one of several tools I used
during the build — useful for the parts that are mechanical or
well-trodden, less useful for the parts that required reading the brief
carefully and making trade-offs.

### What I decided

- **Mapping "Registry" to ADMIN.** The brief talks about a Registry
  stakeholder team, but doesn't add a fourth code role. I chose to map
  Registry onto the existing merged-ADMIN role rather than invent a new
  role surface. The justification lives in the **Registry (PEN Global)**
  section near the top of this README.
- **Re-number, don't preserve.** Existing `ADM-*` admission numbers
  were inconsistent across schools and years, so I chose to re-number
  every student to `SMS-YYYY-####` per school per year instead of
  trying to preserve legacy strings. The brief asks for a single
  canonical format, and the new `nextStudentId` helper (in
  `lib/sequences.ts`) makes the auto-generation race-proof via the
  `(schoolId, admissionNo)` unique index.
- **Programme-only on FeeStructure.** The brief is explicit that fees
  follow the programme, not the class. I made `programmeId` the primary
  scope on `FeeStructure` and kept `classId` as an *optional* sub-scope
  for back-compat — the migration sets `programmeId = NULL` for old
  class-scoped fees rather than backfilling them to a fake programme.
- **Hand-written migration over auto-generated.** The `EnrollmentStatus`
  enum rewrite (`active → enrolled` etc.) can't be auto-generated
  because Prisma's diff engine doesn't know how to map old enum values
  onto new ones. I wrote the migration by hand using the
  TEXT → UPDATE → DROP TYPE → CREATE TYPE → CAST pattern so the data
  rewrite is part of the migration itself, not a manual fix-up step.
- **Shared `deriveStatus`.** Pulled it into `lib/fees-utils.ts` (not
  `lib/actions/fees.ts`) because the new overdue widget on
  `/admin/fees` needs to call it from a server component, and
  `lib/actions/*` is `"use server"`. Keeping utilities out of the
  server-action boundary is a deliberate choice; the file's header
  comment explains it.

### Where I used AI (Puku CLI)

I used **Puku CLI** as an accelerator on the mechanical parts. It did
not design the data model, write the brief interpretation, or take
product decisions — it typed what I told it to type, with a few good
suggestions I kept and many I rejected.

Concrete things I asked it to do:

- **Draft the enum-rewrite migration SQL.** I described the
  TEXT → UPDATE → DROP TYPE → CREATE TYPE → CAST pattern, gave it the
  mapping table (`active→enrolled`, `graduated→completed`,
  `transferred→withdrawn`, `dropped→withdrawn`), and asked it to
  generate the row-statement `ROW_NUMBER()` renumbering for
  `admissionNo`. I reviewed the output and tightened the locking
  language in the JSDoc — the original wording claimed "row locks"
  which was wrong; uniqueness is what guarantees it.
- **Scaffold the test files.** The three integration tests
  (`createStudent`, `createProgramme`, `programmeFees`) follow the
  pattern in `tests/setup.ts`. I asked Puku to mirror that pattern
  for the new actions; I reviewed each test and added the assertions
  I cared about (e.g. the `SMS-\d{4}-\d{4}` regex, the
  `status === "enrolled"` check on the auto-created enrollment).
- **Boilerplate CRUD UI.** `components/admin/programmes/ProgrammeForm`
  and `ProgrammesList` mirror `schools/SchoolForm` and
  `SchoolsList`. I described the diff (add `Programme` to the
  existing school CRUD pattern, swap school pickers for category
  pickers) and Puku produced the component pair. I rewrote the
  copy and the action wiring by hand.
- **One-shot rewrites on the docs.** The structure of this README
  (Stack / Quick start / Demo credentials / Project structure / etc.)
  was scaffolded by Puku against an earlier version of the project;
  I edited each section by hand for the Registry refactor.

### What I rejected

- **Puku's first pass at the role-permission matrix.** It suggested
  splitting Registry into a new `REGISTRY` permission row. I kept
  Registry inside ADMIN because the brief maps Registry to the
  existing admin dashboard — adding a new one would have introduced a
  permission the brief doesn't ask for and a nav entry that duplicates
  what ADMIN already does.
- **Puku's first cut at the overdue widget.** It suggested computing
  overdue inline inside the page component, which would have coupled
  the page to the `deriveStatus` logic. I moved `deriveStatus` to
  `lib/fees-utils.ts` so the page stays declarative and the helper is
  unit-testable.
- **"Just use `prisma db push` for everything."** Puku's first answer
  to the migration question was `db push`. That fails on enum
  rewrites because Prisma's diff engine doesn't know the value
  mapping. I overrode it with the hand-written migration + `migrate
  deploy` approach, and documented the gotcha in the **After editing
  the Prisma schema** section above so I don't forget next time.

### How to verify

- Every server action returns the `ActionResult<T>` union — the same
  shape before and after the refactor.
- Every mutation runs inside `prisma.$transaction` and calls
  `writeAuditLog(tx, …)` inside the same transaction — the audit
  guarantee from the original codebase carries over.
- The schema validates clean: `npx prisma validate` exits zero.
- The test suite is the same shape as before (`npm test` → 10 cases
  across 3 files); I extended it, I didn't rewrite it.
