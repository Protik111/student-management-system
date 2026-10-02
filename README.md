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

```bash
# 1. Install
npm install

# 2. Start Postgres (via the bundled docker-compose service)
docker compose up -d db
# wait for the healthcheck (≈5s), then verify:
docker compose ps

# 3. Copy .env.example → .env (defaults already match the docker-compose service)
cp .env.example .env

# 4. Push the schema + seed demo data (idempotent — safe to re-run)
npm run db:push
npm run db:seed

# 5. Run
npm run dev
# open http://localhost:3000
```

All seed users share the password **`admin123`**. The default `DATABASE_URL`
points at `postgresql://app:app@localhost:5432/app`; when running inside
`docker compose up` the host becomes `db` (the service name) — `.env.example`
has both variants commented.

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
| `npm run db:push` | Apply current `schema.prisma` to the dev DB |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Create + apply a named migration |
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
npx prisma generate

# 2. Sync the DB. **Use `npx prisma migrate deploy` (not `db:migrate`)
#    if the change includes a hand-written migration under
#    `prisma/migrations/`** (e.g. the
#    `20260102000000_programmes_enrollment_status_sms_ids` migration
#    that rewrites `EnrollmentStatus`). See the next section for why
#    `db:migrate` doesn't work in this codebase.
npx prisma migrate deploy

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
| Adding/changing an enum (drops old values, adds new ones) | `npx prisma migrate deploy` |
| Hand-written migration in `prisma/migrations/<timestamp>_*` exists for this change | `npx prisma migrate deploy` |
| Schema and DB are already in sync and you just want to regenerate the client | `npm run db:generate` only |

> **`npm run db:migrate` is intentionally not wired up in this
> codebase.** It runs `prisma migrate dev`, which uses a shadow
> database to detect drift. The shadow DB is empty, and the project's
> earliest migration (`20251001000000_…`) was written to apply on top
> of an existing schema (created by `db push`) — it never had a
> baseline `CREATE TABLE` block, so it crashes on the shadow DB with
> `relation "User" does not exist` (P3018). Use `migrate deploy`
> instead; it doesn't need a shadow DB and just replays pending
> migrations onto the real DB.

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

## AI Usage

This codebase was built with AI assistance (Puku CLI, an AI coding
assistant developed by the Puku AI team). AI contributed to:

- **Migration design** — the `Programme` table, `EnrollmentStatus` enum
  rewrite (TEXT → DROP → CREATE TYPE → CAST pattern), and the per-school
  `ROW_NUMBER()` renumbering of `admissionNo` were all planned and
  validated against the brief before any code was written.
- **Refactor scope** — `deriveStatus` was extracted to `lib/fees-utils.ts`
  so the new overdue widget on `/admin/fees` could call it from a server
  component without round-tripping through a "use server" action.
- **Test scaffolding** — the three test files (`createStudent`,
  `createProgramme`, `programmeFees`) follow the existing integration-test
  pattern in `tests/setup.ts` and the same `vi.mock("@/auth")` stub.
- **Boilerplate** — `ProgrammeForm`/`ProgrammesList` mirror
  `SchoolForm`/`SchoolsList`; the new programme action mirrors
  `lib/actions/schools.ts`; the status-label dictionaries in
  `EnrollmentsList` / `SchoolEnrollmentsList` were just remapped onto the
  new enum.

All public behaviour was cross-checked against the brief, the schema was
validated with `prisma validate`, and every server action still funnels
through `prisma.$transaction` with `writeAuditLog(tx, …)` so the audit
guarantees from earlier modules carry over.
