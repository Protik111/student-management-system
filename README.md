# SMS — School Management System

A multi-tenant school management web app. Implements the four
workflows from the PEN Global brief (Student Enrolment, Fees &
Payments, Assessment Submission, Marksheet & Results) on Next.js +
Postgres + Prisma. Ships with a Vitest integration suite and demo
seed. See [`docs/REGISTRY_TEST_GUIDE.md`](./docs/REGISTRY_TEST_GUIDE.md)
for a hands-on test script and [`docs/PRISMA_GOTCHAS.md`](./docs/PRISMA_GOTCHAS.md)
for the two Prisma gotchas the Registry refactor introduced.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL 16 · Prisma 7 · NextAuth v5 · Zod · Tailwind · Vitest

## Quick start

Prereqs: **Node 22+** (`.nvmrc`), **Docker**.

```bash
npm install
docker compose up -d db            # wait for "healthy" (~10s)
cp .env.example .env
# Replace the AUTH_SECRET and CRON_SECRET placeholders with output of:
#   openssl rand -base64 32   # → AUTH_SECRET
#   openssl rand -hex 32     # → CRON_SECRET

npm run db:migrate:deploy          # replays pending migrations (one for the
                                   # Registry refactor — see docs/PRISMA_GOTCHAS.md)
npm run db:seed                    # idempotent — programmes, students, fees
npm run dev                        # http://localhost:3000
```

Sign in with one of the [demo credentials](#demo-credentials) below.

If you'd rather run the whole stack in Docker (`app` + `cron` + `db`
containers) instead of host-side Next.js: `docker compose up --build`.

## Environment

`cp .env.example .env` to start. Replace the two `replace-me-with-…`
placeholders with real secrets before running anything that uses
`docker compose up` (the compose file requires both via
`${VAR:?VAR is required}`).

| Var | Purpose | Default in `.env.example` |
|---|---|---|
| `AUTH_SECRET` | NextAuth JWT signing key | placeholder — generate |
| `DATABASE_URL` | Postgres connection string | `postgresql://app:app@localhost:5432/app` |
| `CRON_SECRET` | Bearer token for `/api/cron/*` | placeholder — generate |
| `ENABLE_CRON` | Run scheduler in-process | `false` (the `cron` container drives it) |

## Demo credentials

| Role | Email | Password | What they can do |
|---|---|---|---|
| Super admin | `admin@sms.local` | `admin123` | Create schools, manage programmes, audit log |
| School admin | `school.admin@sms.local` | `admin123` | Manage Sunrise Academy users, students, fees |
| Teacher | `teacher@sms.local` | `admin123` | My Courses, Assessments, Enter Results |
| Student | `student@sms.local` | `admin123` | My Courses, Browse Courses, My Assessments, My Results, My Fees |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next dev server (Turbopack) |
| `npm test` | Vitest one-shot (10 integration cases across 3 files) |
| `npm run db:migrate:deploy` | Replay pending migrations on the real DB |
| `npm run db:push` | Apply schema diff directly (additive changes only) |
| `npm run db:seed` | Idempotent demo seed |
| `npm run db:studio` | Prisma Studio |

`npm run db:migrate` (`prisma migrate dev`) does not work in this
repo — it needs a baseline migration we don't have. See
`docs/PRISMA_GOTCHAS.md`.

## AI usage

Built with [Puku CLI](https://puku.sh) as a typing accelerator on the
mechanical parts (scaffolding CRUD UI, drafting the enum-rewrite
migration, mirror-pattern test files). The product decisions (mapping
Registry to ADMIN, re-numbering admission numbers, hand-written
migration over auto-generated, fee-by-programme scoping) and the brief
interpretation are mine. Several Puku suggestions were rejected — the
full breakdown lives in commit history; the README stays short.