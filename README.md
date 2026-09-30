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
| Database | **SQLite** via Prisma 7's driver adapter (`@prisma/adapter-better-sqlite3`) |
| ORM | **Prisma 7.10** with full schema in `prisma/schema.prisma` |
| Auth | **NextAuth v5 (beta)** — credentials provider, JWT sessions, bcryptjs |
| Validation | **Zod 4** + react-hook-form on the client |
| Styling | **Tailwind CSS v4**, Radix primitives, `class-variance-authority`, `lucide-react` |
| Tests | **Vitest 2** (integration — exercises real Prisma against an isolated SQLite DB) |

## Quick start

```bash
# 1. Install
npm install

# 2. Provision the local SQLite DB
npm run db:push

# 3. Seed demo data (idempotent — safe to re-run)
npm run db:seed

# 4. Run
npm run dev
# open http://localhost:3000
```

Optional: copy `.env.example` to `.env` and adjust. The defaults point at
`./data/sms.db` and use `admin123` as the seed password.

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

The test suite boots an isolated SQLite database at `./data/test-sms.db`,
pushes the schema, and re-seeds fixtures (`tests/setup.ts`) before each test
file. The action under test exercises the real Prisma client, real Zod
schema, real audit-log writes, and real transaction rollback — only `auth()`
and `next/cache` are stubbed.

What's covered today:

- **`createStudent`** — atomic happy path (User + UserRole + Student +
  Enrollment + two audit rows), email uniqueness rejection, admissionNo
  uniqueness rejection per school, cross-school class rejection with no row
  leaks.

What's **not** covered yet: `update*`, `toggle*Active`, the rest of the action
chain (`schools`, `users`, `teachers`). These will land as their respective
modules ship.

## What's shipped vs. deferred

Shipped in this pass:

- **Module 1** — Auth (NextAuth credentials, JWT, bcrypt), middleware-driven
  role routing, login/logout, RBAC primitives.
- **Module 2** — Schools & Users CRUD (super admin manages schools; school
  admin manages their school's users; temp-password flow for new accounts).
- **Module 3** — Students & Teachers CRUD (atomic create with role/profile +
  enrollment; per-school admissionNo uniqueness; read-only enrollment history).
- **Finishing pass** — sidebar entries that point at unimplemented features
  render an honest "Coming soon" page tagged with the module number it ships
  in, plus the test suite and this README.

Deferred (per the brief's "you are NOT required to implement all features"
guidance):

- **Module 4** — Classes & Subjects CRUD
- **Module 5** — Attendance & Exam Results
- **Module 6** — Library (books, issues)
- **Module 7** — Reports & Analytics
- **Module 8** — Notifications

Placeholder pages for these exist at every nav entry; clicking one in the
sidebar shows a card explaining what the future module will do and which
module number it ships in.

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

- **SQLite only** — schema uses `String @id` cuid()s everywhere; no PG-only
  types. Swapping in Postgres is a matter of changing the `provider` and
  re-pushing.
- **No background jobs** — audit-log writes are inline in the action
  transaction. A queue (BullMQ, etc.) would be the next step if report
  generation or bulk imports land.
- **No CSRF token rotation** — Next.js server actions have built-in
  same-origin protection via the action ID; explicit CSRF tokens are not
  added.
