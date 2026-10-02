# Manual Testing Guide

Setup and a quick smoke checklist. For the **hands-on step-by-step
test script** for the Registry/Programme features (programmes CRUD,
SMS-#### auto-generated IDs, programme-based fees, overdue widget,
CSV import with `programmeCode`, cross-school guards, audit log), see
[`REGISTRY_TEST_GUIDE.md`](./REGISTRY_TEST_GUIDE.md). For Prisma
schema-edit gotchas, see [`PRISMA_GOTCHAS.md`](./PRISMA_GOTCHAS.md).

## Setup

```bash
npm install
docker compose up -d db
cp .env.example .env
# edit .env: replace AUTH_SECRET and CRON_SECRET with real secrets
npm run db:migrate:deploy
npm run db:seed
npm run dev            # http://localhost:3000
```

Full setup details: see the **Quick start** in `README.md`.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Super admin | `admin@sms.local` | `admin123` |
| School admin | `school.admin@sms.local` | `admin123` |
| Teacher | `teacher@sms.local` | `admin123` |
| Student | `student@sms.local` | `admin123` |

## Smoke checklist

After `npm run dev` is up:

- [ ] `/login` returns the login page (unauthenticated requests redirect).
- [ ] Sign in as `school.admin@sms.local` — land on `/admin`.
- [ ] `/admin/programmes` lists `BSC-CS` and `BBA` (seeded).
- [ ] `/admin/students` lists `Rahim Ahmed` with admission number
      `SMS-2025-0001`.
- [ ] `/admin/fees` renders the fee structures table and the **Overdue
      invoices** widget (empty until you backdate an invoice).
- [ ] Sign in as `student@sms.local` — `/student/courses` loads with the
      categories dropdown populated (no `manage_categories` error).
- [ ] Sign in as `teacher@sms.local` — sidebar shows Overview / My
      Courses / Assessments / Enter Results (no dangling
      Classes/Attendance/Library entries).
- [ ] `npm test` passes — 10/10 across `createStudent`,
      `createProgramme`, `programmeFees`.

## Inspecting the DB

```bash
npm run db:studio                  # https://localhost:5555
docker exec -it sms-db psql -U app -d app
```

## Reset state

```bash
# Wipe the DB and re-seed.
npx prisma migrate reset --force   # drops, replays all migrations, re-seeds

# Or nuke the Postgres volume entirely.
docker compose down -v
docker compose up -d db
npm run db:migrate:deploy && npm run db:seed
```

## Gotchas

- **`DATABASE_URL is not set`** — `.env.example` wasn't copied to `.env`,
  or you're running Prisma CLI from a shell that doesn't load it.
- **`Connection refused on localhost:5432`** — Postgres container isn't
  up. `docker compose up -d db` and wait for `healthy`.
- **New-model runtime errors** — see `PRISMA_GOTCHAS.md` (the
  `rm -rf .next` step is the easy one to forget).
- **`db:push` fails on enum rewrites** — also in `PRISMA_GOTCHAS.md`;
  use `db:migrate:deploy`.