# SMS — School Management System

A multi-tenant school management web app built as a technical assessment.
Implements Modules 1–3 of the brief (Auth + RBAC, Schools & Users CRUD,
Students & Teachers CRUD) plus a Vitest integration suite and placeholder
pages for the navigation entries that ship with later modules.

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

All seed users share the password **`admin123`**.

| Role | Email | What they can do |
|---|---|---|
| Super admin | `admin@sms.local` | Create schools, jump into any tenant, manage platform users |
| School admin | `school.admin@sms.local` | Manage Sunrise Academy users, students, teachers |
| Teacher | `teacher@sms.local` | Read-only on own profile; placeholder nav for classes/attendance/results/library |
| Student | `student@sms.local` | Read-only on own profile; placeholder nav for results/attendance/library |

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
│   ├── users.ts          ← create/update/toggleActive + temp-password flow
│   ├── students.ts       ← create/update/toggleActive + enroll + audit logs
│   └── teachers.ts       ← create/update/toggleActive + audit logs
├── auth.ts, auth-helpers.ts   ← NextAuth wiring + requireRole/requirePermission
├── rbac.ts               ← PERMISSIONS matrix, ROLE_NAV, nav helpers
├── db/prisma.ts          ← singleton Prisma client (driver-adapter)
└── ...

components/
├── ui/                   ← shadcn-style primitives (Button, Card, …)
├── shell/                ← Sidebar, header, ComingSoon, RoleOverview
├── auth/                 ← login form
└── admin/{schools,users,students,teachers}/   ← CRUD UIs

prisma/
├── schema.prisma         ← full DB schema
└── seed.ts               ← idempotent demo seed

tests/
├── setup.ts              ← isolated test DB, reset/seed helpers
├── stubs/server-only.ts  ← no-op stub for the `server-only` package
└── actions/createStudent.test.ts   ← 4 integration cases
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

- **`createStudent`** — atomic happy path (User + UserRole + Student +
  Enrollment + two audit rows), email uniqueness rejection, admissionNo
  uniqueness rejection per school, cross-school class rejection with no row
  leaks.

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
