# Manual Testing Guide

A walkthrough for exercising the SMS app by hand — covers setup, what each
role sees, a guided tour of the CRUD flows, and the things that are still
placeholders.

> **Looking for a hands-on test script for the new Registry/Programme
> features (SMS-#### IDs, programme-based fees, overdue widget, CSV
> import with `programmeCode`)?** See
> [`docs/REGISTRY_TEST_GUIDE.md`](./REGISTRY_TEST_GUIDE.md) — a numbered,
> step-by-step test plan with pass/fail checklists and a troubleshooting
> matrix.

---

## 1. Prerequisites

- **Node 22+** and **npm** (the project uses `node:22-alpine` in Docker).
- **Docker + Docker Compose** — the Postgres DB runs as a container.
- A POSIX shell (bash / zsh).

> The dev server runs on **http://localhost:3000**. Postgres is exposed on
> **localhost:5432** (so Prisma CLI, Studio, and Vitest can all reach it
> without Compose networking).

---

## 2. One-time setup

```bash
# 1. Install dependencies
npm install

# 2. Start the Postgres container (waits for the healthcheck)
docker compose up -d db
docker compose ps        # confirm sms-db shows "healthy"

# 3. Create your local .env
cp .env.example .env
# (Defaults already match the docker-compose service — no edits needed
#  unless you change the DB user/password.)

# 4. Push the schema and seed demo data
npm run db:push
npm run db:seed
```

The seed step prints the demo credentials on success — see
[§4 Demo credentials](#4-demo-credentials).

If `docker compose up -d db` complains about port `5432` already being in
use, either stop the conflicting service or change the published port in
`docker-compose.yml` (and update `DATABASE_URL` in `.env` to match).

---

## 3. Run the app

```bash
npm run dev
# open http://localhost:3000
```

You should land on the login page. There's no public landing page —
unauthenticated traffic is redirected to `/login`.

---

## 4. Demo credentials

All four demo users share the password **`admin123`**.

| Role | Email | What they can do |
|---|---|---|
| Super admin | `admin@sms.local` | Create schools, jump into any tenant, manage platform users |
| School admin | `school.admin@sms.local` | Manage Sunrise Academy users, students, teachers |
| Teacher | `teacher@sms.local` | Read-only on own profile; placeholder nav for classes/attendance/results/library |
| Student | `student@sms.local` | Read-only on own profile; placeholder nav for results/attendance/library |

The seed creates one school (`Sunrise Academy`), two programmes
(`BSC-CS` and `BBA`), one class (`Grade 10 - A`), one teacher
(`Ayesha Siddiqua`), one student (`Rahim Ahmed`, admission number
`SMS-2025-0001`) already enrolled, one subject (`Mathematics`), and one
library book.

---

## 5. Role-by-role tour

### 5.1 Super admin (`admin@sms.local`)

The super-admin dashboard is the only place that can create schools, which
in turn unblocks every other CRUD flow. Recommended order:

1. **Schools → Create school**
   - Click **Schools** in the sidebar → **New school**.
   - Fill in name, address, contact email/phone. Toggle active/inactive.
   - Submit. The new school should appear in the list and become selectable
     in every other CRUD form.

2. **Programmes → Create programme** (Registry workflow)
   - Click **Programmes** in the sidebar → **New programme**.
   - Pick a school, fill in the programme name (e.g. `BSc Computer
     Science`), a short code (e.g. `BSC-CS`), the duration, and an
     active toggle. Codes are unique per school.
   - Try to create another programme with the same `(schoolId, code)` —
     it's rejected pre-write with a friendly inline error.

3. **Users → Create user**
   - **Users** → **New user**.
   - Pick a role, assign to a school (school admin / teacher / student
     must have a school; super admin must not).
   - The new user gets a **temporary password** shown once on success.
     They can log in with it immediately and the app forces a password
     change on first login (or admin can re-issue from the users list).

4. **Students → Create student** — the most complex form because it
   touches four tables in one transaction.
   - Fill in name, email, password, DOB, gender, guardian info.
   - **Programme is required** — every student belongs to a programme.
     Pick one from the school-scoped dropdown.
   - **Academic year** is required; the SMS-YYYY-#### id uses the current
     year by default.
   - **Admission number is auto-generated** as `SMS-YYYY-####` per
     school, per year. You can't pick your own.
   - Optional: pick an existing class from the school to auto-enroll.
   - **Important**: trying to use a class that belongs to a *different*
     school returns a pre-transaction error and writes nothing — verify
     by inspecting that no student row was created.
   - Trying to reuse an email rejects before any DB write.

5. **Students → Enrollments history**
   - Open any student → **Enrollments** tab. Shows the academic year,
     class, status (`enrolled` / `deferred` / `withdrawn` / `completed`).
   - The status-change dropdown only offers values from the new enum;
     switching to anything other than `enrolled` stamps `leftAt` on the
     row, returning to `enrolled` clears it.

6. **Teachers → Create teacher** — same shape as students but with
   `employeeId`, qualification, specialization, salary.

7. **Fees → Fee structures**
   - Click **Fees** in the sidebar → **Fee structures → New**.
   - Name, amount (cents), frequency, optional due day, **programme
     scope** (primary), optional class scope.
   - The fee-structures table now shows a **Programme** column.

8. **Fees → Issue invoice**
   - **Fees → Invoices → New invoice**.
   - Pick a student. If you don't supply an explicit fee structure, the
     action auto-derives `amountCents` and `description` from the
     student's programme's active fee structure.

9. **Fees → Overdue widget**
   - The home of `/admin/fees` lists the top 10 overdue invoices for
     the school. Seed an invoice with a past `dueDate` and no payments,
     then refresh — it shows up with a red badge and a link to the
     invoice detail page.

10. **Toggle active** on any of the above.
    - Deactivated users cannot log in (the auth check rejects them).

### 5.2 School admin (`school.admin@sms.local`)

The school-admin dashboard is a **scoped** version of the super-admin one:
it can do everything except manage schools, and every record it touches is
forced to its own `schoolId` regardless of what the form says.

1. **Users** → try to create a user. The school dropdown is locked to
   your own school.
2. **Students / Teachers** → same flow as super admin, but every class
   picker is filtered to your school.
3. **Cross-school isolation check**: open DevTools → Network. Try posting
   a form with a `currentClassId` from another school (you can intercept
   the request in the network tab and edit the body). The server returns
   an error and no rows are written — same as the integration test.

### 5.3 Teacher (`teacher@sms.local`)

1. Land on the dashboard. You see a personal overview.
2. Sidebar shows **Overview / My Courses / Assessments / Enter Results**
   — only routes that work or are part of the PEN Global brief. The
   historical `Classes / Attendance / Library` placeholders have been
   removed from the nav since they fall outside the brief.
3. The **profile / settings** page (when implemented) will be read-only.

### 5.4 Student (`student@sms.local`)

Mirror of the teacher experience: read-only personal view. Sidebar shows
**Overview / My Courses / Browse Courses / My Assessments / My Results /
My Fees**. The historical `Attendance / Library` placeholders have been
removed from the nav.

---

## 6. Placeholder routes (intentional)

The PEN Global brief covers four workflows (Student Enrolment, Fees &
Payments, Assessment Submission, Marksheet & Results). The sidebar only
links to those plus a small set of admin surfaces.

The following routes still resolve to an honest **"Coming soon"** page if
you hit them directly (e.g. from an old link), but they are **not** in
the sidebar because they're outside the brief — they're not bugs, they
just don't have a feature owner:

| Path | Module | Audience |
|---|---|---|
| `/teacher/classes` | Module 4 | Teacher |
| `/teacher/attendance` | Module 5 | Teacher |
| `/teacher/library` | Module 6 | Teacher |
| `/student/attendance` | Module 5 | Student |
| `/student/library` | Module 6 | Student |
| `/admin/classes` | Module 4 | Admin |
| `/admin/subjects` | Module 4 | Admin |
| `/admin/exams` | Module 5 |
| `/admin/library` | Module 6 |
| `/admin/reports` | Module 7 |
| `/admin/notifications` | Module 8 |

---

## 7. Quick smoke checklist

Tick these off in order; each one assumes the previous passed.

- [ ] `npm install` finishes without errors.
- [ ] `docker compose up -d db` reaches `healthy` within ~10 s.
- [ ] `npm run db:push` succeeds (creates ~22 tables in Postgres — the new
      `Programme` table is part of the migration).
- [ ] `npm run db:seed` prints the four demo credentials and notes the two
      programmes (`BSC-CS`, `BBA`) it created.
- [ ] `npm run dev` serves `/login` on http://localhost:3000.
- [ ] Logging in as `admin@sms.local` redirects to the super-admin dashboard.
- [ ] Creating a school works and the row appears in the schools list.
- [ ] Creating a programme works; trying to reuse the same `(schoolId, code)`
      is rejected inline.
- [ ] Creating a student auto-generates an `SMS-YYYY-####` admission number
      and stamps the new student's `programmeId` and `academicYear`.
- [ ] Creating a student in a class works; their enrollments tab shows the
      `enrolled` enrollment.
- [ ] Trying to enroll a student in a class from another school returns
      a clear error and leaves no orphan rows (verify via Prisma Studio).
- [ ] The enrollment status dropdown only offers `enrolled / deferred /
      withdrawn / completed` — no more `active / graduated / transferred
      / dropped`.
- [ ] Issuing an invoice with no fee structure auto-derives the amount
      from the student's programme's active FeeStructure.
- [ ] The `/admin/fees` home shows the **Overdue** widget (top 10).
- [ ] School admin cannot see or pick classes from other schools.
- [ ] Teacher and student dashboards show placeholders without 500 errors.
- [ ] `npm test` passes — 5/5 `createStudent` + 3/3 `createProgramme` +
      3/3 `programmeFees` integration cases.

---

## 8. Inspecting the database

For ad-hoc queries while testing, Prisma Studio is the easiest option:

```bash
npm run db:studio
# opens https://localhost:5555 in your browser
```

Or from the command line:

```bash
docker exec -it sms-db psql -U app -d app
\dt              -- list tables
SELECT email, primaryRole FROM "User";
```

---

## 9. Common gotchas

- **"DATABASE_URL is not set"** — you forgot to copy `.env.example` to
  `.env`, or you ran `prisma db push` from a shell that doesn't load it.
- **"Connection refused on localhost:5432"** — Postgres container isn't
  up. Run `docker compose up -d db` and wait for `healthy`.
- **Login fails immediately after `db:seed`** — the seed hash used bcrypt
  rounds=10; if you changed `bcryptjs`'s cost factor or replaced the seed
  password, double-check the values match the credentials table above.
- **Sidebar shows fewer items than expected** — the nav is driven by the
  RBAC permission matrix in `lib/rbac.ts`. Your role's permissions decide
  what's visible; this is intentional.
- **Audit log rows missing** — every successful create/update/toggle
  should write an `AuditLog` row inside the same Prisma `$transaction`.
  If a row is missing, the transaction likely never committed — check
  the action's `writeAuditLog` call site.

---

## 10. Resetting state

To start over from a clean DB:

```bash
# Drop and recreate every table (idempotent — re-pushes the schema)
npm run db:push -- --force-reset --accept-data-loss

# Re-seed
npm run db:seed
```

Or to nuke the Postgres volume entirely:

```bash
docker compose down -v        # WARNING: deletes the pg_data volume
docker compose up -d db
npm run db:push && npm run db:seed
```
