# Manual Testing Guide

A walkthrough for exercising the SMS app by hand — covers setup, what each
role sees, a guided tour of the CRUD flows, and the things that are still
placeholders.

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

The seed creates one school (`Sunrise Academy`), one class (`Grade 10 - A`),
one teacher (`Ayesha Siddiqua`), one student (`Rahim Ahmed`) already
enrolled, one subject (`Mathematics`), and one library book.

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

2. **Users → Create user**
   - **Users** → **New user**.
   - Pick a role, assign to a school (school admin / teacher / student
     must have a school; super admin must not).
   - The new user gets a **temporary password** shown once on success.
     They can log in with it immediately and the app forces a password
     change on first login (or admin can re-issue from the users list).

3. **Students → Create student** — the most complex form because it
   touches four tables in one transaction.
   - Fill in name, email, password, admission number, DOB, gender,
     guardian info.
   - Optional: pick an existing class from the school to auto-enroll.
   - **Important**: trying to use a class that belongs to a *different*
     school returns a pre-transaction error and writes nothing — verify
     by inspecting that no student row was created.
   - Trying to reuse an email or an `(schoolId, admissionNo)` pair also
     rejects before any DB write.

4. **Students → Enrollments history**
   - Open any student → **Enrollments** tab. Shows the academic year,
     class, status (active / graduated / transferred / dropped).

5. **Teachers → Create teacher** — same shape as students but with
   `employeeId`, qualification, specialization, salary.

6. **Toggle active** on any of the above.
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
2. Sidebar shows **Classes / Attendance / Results / Library** — all four
   are currently **"Coming soon" placeholders** tagged with the module
   number they ship in (Modules 4–6).
3. The **profile / settings** page (when implemented) will be read-only.

### 5.4 Student (`student@sms.local`)

Mirror of the teacher experience: read-only personal view plus placeholder
nav for **Results / Attendance / Library**.

---

## 6. Placeholder routes (intentional)

These routes render an honest **"Coming soon"** page tagged with the
module number they ship in — they're not bugs. Clicking them should not
crash the app:

| Path | Module |
|---|---|
| `/teacher/classes` | Module 4 |
| `/teacher/attendance` | Module 5 |
| `/teacher/results` | Module 5 |
| `/teacher/library` | Module 6 |
| `/student/results` | Module 5 |
| `/student/attendance` | Module 5 |
| `/student/library` | Module 6 |
| `/school-admin/classes` | Module 4 |
| `/school-admin/subjects` | Module 4 |
| `/school-admin/exams` | Module 5 |
| `/school-admin/library` | Module 6 |
| `/school-admin/reports` | Module 7 |
| `/school-admin/notifications` | Module 8 |

---

## 7. Quick smoke checklist

Tick these off in order; each one assumes the previous passed.

- [ ] `npm install` finishes without errors.
- [ ] `docker compose up -d db` reaches `healthy` within ~10 s.
- [ ] `npm run db:push` succeeds (creates ~18 tables in Postgres).
- [ ] `npm run db:seed` prints the four demo credentials.
- [ ] `npm run dev` serves `/login` on http://localhost:3000.
- [ ] Logging in as `admin@sms.local` redirects to the super-admin dashboard.
- [ ] Creating a school works and the row appears in the schools list.
- [ ] Creating a student in a class works; their enrollments tab shows the
      active enrollment.
- [ ] Trying to enroll a student in a class from another school returns
      a clear error and leaves no orphan rows (verify via Prisma Studio).
- [ ] School admin cannot see or pick classes from other schools.
- [ ] Teacher and student dashboards show placeholders without 500 errors.
- [ ] `npm test` passes — 4/4 `createStudent` integration cases.

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
