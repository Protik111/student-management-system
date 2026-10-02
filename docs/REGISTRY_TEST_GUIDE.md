# Registry Test Guide (Programme-based SMS)

A hands-on, step-by-step test script for the new **Registry / Programme**
features that landed in the PEN Global refactor. This is meant to be
executed in order, in a single sitting, with the dev server running.

> **Prerequisite** — finish `docs/MANUAL_TESTING.md` §1–§3 first (install,
> docker compose up, db:push, db:seed, dev server). This guide assumes
> the seed has already created Sunrise Academy + two programmes
> (`BSC-CS`, `BBA`) + one student (`Rahim Ahmed`, `SMS-2025-0001`).
>
> For role-by-role context, the registry workflow overview, and the
> list of placeholder routes, see the parent
> [`docs/MANUAL_TESTING.md`](./MANUAL_TESTING.md).

---

## How to use this guide

- Each test ends with a ✅ **Pass** checklist. Tick every box before moving on.
- If a test fails, the next section tells you **where to look** (Prisma
  Studio, audit log, Network tab).
- The guide is self-contained — no test runner required. If you also
  want to run the Vitest integration suite, jump to [§11 Vitest](#11-vitest-integration-suite-optional).

> Sign in as `school.admin@sms.local` / `admin123` for **Tests 1–8**.
> Sign in as `admin@sms.local` / `admin123` for **Test 9** (cross-school
> guards) and to inspect **Test 10** (audit log).

---

## Test 1 — Programmes CRUD

**Why it matters:** programmes are the top-level grouping in the Registry
model. Every student belongs to one; every fee structure attaches to one.

### 1.1 List page loads

1. Sign in as `school.admin@sms.local`.
2. Click **Programmes** in the sidebar (`/admin/programmes`).
3. Confirm: the page shows the two seeded programmes (`BSc Computer
   Science` and `Bachelor of Business Administration`).
4. Each row shows **Code, School, Duration, Students count, Status,
   Actions**.

✅ Pass: page loads, two programmes visible, no console errors.

### 1.2 Create a new programme

1. Click **New programme**.
2. Fill in:
   - Name: `BSc Software Engineering`
   - Code: `BSC-SE`
   - Duration: `4` years
   - Active: ✓
3. Submit.

✅ Pass: success toast **"Programme created"**, modal closes, new row
appears in the list with `Student count = 0`.

### 1.3 Duplicate code is rejected

1. Click **New programme** again.
2. Enter Name: `BSc Software Eng (dup)`, Code: `BSC-SE`, Duration: `4`.
3. Submit.

✅ Pass: the action returns a pre-transaction error. The UI shows an
inline error (e.g. `A programme with this code already exists in this
school`) and the table is **not** updated.

### 1.4 Edit a programme

1. Click **Edit** on the `BSC-SE` row.
2. Change the name to `BSc Software Engineering — Year Intake 2026`.
3. Save.

✅ Pass: name updates in the list. Code (`BSC-SE`) is preserved.

### 1.5 Deactivate, then reactivate

1. Click **Deactivate** on `BSC-SE`. Confirm in the dialog.
2. Reload the page.

✅ Pass: badge changes to **Inactive**, code still present in the table
(we hide from pickers, not from the registry).

3. Click **Activate** on the same row. Confirm.

✅ Pass: badge flips back to **Active**.

---

## Test 2 — Auto-generated student IDs (`SMS-YYYY-####`)

**Why it matters:** the brief requires Registry to issue per-school,
per-year, monotonically-increasing student IDs in `SMS-YYYY-####` format.
Admins cannot pick their own.

### 2.1 Open the new-student form

1. Navigate to **Students** (`/admin/students`) → **New student**.
2. Inspect the form.

✅ Pass: there is **no** `Admission number` text input. Instead you see
read-only text saying it will be auto-generated on save.

### 2.2 Create a student

1. Fill in:
   - Email: `test1+{timestamp}@school.com` (use a unique value each run)
   - Full name: `Karim Hossain`
   - Password: `supersecret123`
   - **Programme**: `BSc Software Engineering` (the one you just created)
   - **Academic year**: `2025`
   - Gender: `male`
   - Date of birth: `2010-04-15`
2. Submit.

✅ Pass:
- Toast says **"Student created"** and shows the generated admission
  number, e.g. `SMS-2025-0002` (because the seed already created
  `SMS-2025-0001`).
- Admission number matches the regex `^SMS-\d{4}-\d{4}$`.

### 2.3 Verify in Prisma Studio

```bash
npm run db:studio
```

Open the `Student` table.

✅ Pass: the new row has `admissionNo = SMS-2025-0002`,
`programmeId` pointing at `BSC-SE`, `academicYear = 2025`.

### 2.4 Sequential non-colliding IDs

1. Create two more students in a row on the same programme.
2. Check the generated admission numbers.

✅ Pass: numbers are `SMS-2025-0003`, `SMS-2025-0004` (no collisions, no
gaps, strictly increasing).

---

## Test 3 — Programme & status filters on the student list

**Why it matters:** the brief requires Registry to look students up by
programme and by enrollment status, not just by name.

### 3.1 Create students on two different programmes

1. Create a second student on `BBA` (Name: `Sadia Rahman`,
   email `test2+{timestamp}@school.com`, academic year 2025).

✅ Pass: success toast, new row appears.

### 3.2 Filter by programme

1. On `/admin/students`, open the **Programme** filter dropdown.
2. Pick `BSC-SE`.

✅ Pass: only the students you created on `BSC-SE` remain in the table
(`Karim Hossain` and the two from §2.4). The `BBA` student is hidden.

3. Reset the filter to **All programmes**.

### 3.3 Filter by status

1. Create one of the new students, then open it and change enrollment
   status to **Deferred** (see Test 4 for steps).
2. Back on the list, open the **Status** filter dropdown.
3. Pick `Deferred`.

✅ Pass: only the deferred student remains.

4. Reset filters.

---

## Test 4 — Enrollment lifecycle

**Why it matters:** the brief's enrollment status enum is
`enrolled / deferred / withdrawn / completed`. Anything else is wrong.

### 4.1 Open the enrollments tab

1. Open `Karim Hossain`'s profile → **Enrollments** tab.
2. The page shows: Programme, Academic year, Class (if any), Status,
   Enrolled-at, Left-at.

✅ Pass: status is currently `enrolled` and `leftAt` is `null`.

### 4.2 Verify only the new enum values are available

1. Click the status-change dropdown.

✅ Pass: the four options are **Mark Enrolled / Mark Deferred / Mark
Withdrawn / Mark Completed**. No `active / graduated / transferred /
dropped` (those are gone).

### 4.3 Mark deferred, then re-enroll

1. Choose **Mark Deferred**.

✅ Pass: status badge flips to `Deferred`, `leftAt` is stamped with the
current time.

2. Choose **Mark Enrolled** again.

✅ Pass: `leftAt` is cleared (back to `null`), status returns to
`Enrolled`.

### 4.4 Mark withdrawn

1. Choose **Mark Withdrawn**.

✅ Pass: status is `Withdrawn`, `leftAt` is set, no auto-clear (per the
"only `enrolled` clears leftAt" rule in the action).

### 4.5 Mark completed

1. Re-enroll the student first.
2. Then choose **Mark Completed**.

✅ Pass: status is `Completed`, `leftAt` is set.

---

## Test 5 — Programme-based fee structure

**Why it matters:** the new model attaches fee structures to programmes
(not classes) so invoices can auto-derive.

### 5.1 Open fee structures

1. Navigate to **Fees** (`/admin/fees`) → **Fee structures** tab.
2. Confirm the table now has a **Programme** column.

✅ Pass: the seeded fee structure shows `BSc Computer Science` in the
Programme column.

### 5.2 Create a fee structure on `BSC-SE`

1. Click **New fee structure**.
2. Fill in:
   - Name: `BSC-SE Term 1`
   - **Programme**: `BSc Software Engineering` (required)
   - Amount: `350000` (cents → $3,500.00)
   - Frequency: `termly`
   - Active: ✓
3. Submit.

✅ Pass: new row appears in the table. The Programme column shows
`BSC-SE`.

### 5.3 Try to create one without a programme (if the form allows)

The form makes `programmeId` required, so you can't submit empty.

✅ Pass: the **Create** button stays disabled or shows an inline
`Programme is required` error.

---

## Test 6 — Auto-derived invoice amount

**Why it matters:** the action `createInvoice` should look at the
student's programme and fill the amount from the active fee structure —
this is the heart of the programme-based fee model.

### 6.1 Issue an invoice with **no** fee structure selected

1. **Fees → Invoices → New invoice**.
2. Pick student `Karim Hossain` (on `BSC-SE`).
3. Leave **Fee structure** blank.
4. Description: blank or any text.
5. Due date: today + 14 days.
6. Submit.

✅ Pass:
- The form **does not** require you to type an amount; it pre-fills
  `3,500.00` (the `BSC-SE Term 1` structure you created in §5.2) as
  soon as you pick the student.
- Success toast appears and the invoice is created with
  `amountCents = 350000` and `feeStructureId` set to the `BSC-SE Term 1`
  row.

### 6.2 Override the auto-derive

1. Create another invoice for the same student.
2. Pick a different fee structure explicitly (e.g. the seeded
   `BSc Computer Science` annual fee).
3. Submit.

✅ Pass: the amount matches the **explicitly** selected fee structure,
not the programme's default.

### 6.3 Refusal when no fee is derivable

The seed and §5 make sure every programme has at least one active
structure, so you can't trigger the refusal from the UI directly. To
verify the **refusal path** exists, run the Vitest case:

```bash
npm test -- programmeFees
```

✅ Pass: the case `createInvoice fails when no fee structure is
derivable` is reported as **passed**.

---

## Test 7 — Overdue widget

**Why it matters:** the new `/admin/fees` home surfaces the top 10
overdue invoices for the school — it computes them live via
`deriveStatus` instead of round-tripping to a server action.

### 7.1 Seed an overdue invoice via Prisma Studio

```bash
npm run db:studio
```

1. Open the `Invoice` table.
2. Find any invoice for `Karim Hossain` and set `dueDate` to **yesterday**.
3. Make sure it has **no** payments (or, alternatively, set `amountCents`
   to `500000` and add a payment of `100000` so the row is "partial but
   past due" — both bucket as overdue in the widget).

### 7.2 Reload the fees page

1. Go to `http://localhost:3000/admin/fees`.

✅ Pass: the **Overdue invoices** section lists the seeded row at the
top, with a red `Overdue` badge, balance, due date, and an
**Open / View** action.

### 7.3 Cross-check the date filter

1. Create another invoice with `dueDate = tomorrow` and **no**
   payments.

✅ Pass: the new invoice does **not** appear in the overdue widget (it
shows up in the standard invoice list instead).

---

## Test 8 — CSV import with `programmeCode`

**Why it matters:** the bulk import path is one of the only ways a
school loads hundreds of students at once. The new `programmeCode`
column is what wires each row to a programme.

### 8.1 Download the template

1. Navigate to **Students → Import students** (`/admin/students/import`).
2. Click **Download CSV template**.

✅ Pass: a `students-template.csv` file downloads.

### 8.2 Inspect the headers

Open the file in any text editor. The headers are:

```
email,fullName,admissionNo,gender,dateOfBirth,class,section,guardianName,guardianPhone,address
```

> Note: the template still lists `admissionNo` for back-compat, but
> the server action **ignores** it and auto-generates `SMS-YYYY-####`
> per row. To attach a programme, add a `programmeCode` column.

### 8.3 Add `programmeCode` and import

1. Modify the file to add a `programmeCode` column header and values
   (`BSC-SE`, `BBA`, etc.) for each row.
2. Add 2–3 sample rows (make sure emails are unique and not in the DB).
3. Paste the CSV into the textarea in Step 2 of the wizard.

✅ Pass: the preview table shows 2–3 rows with the **Programme** column
filled in (not `—`).

4. Pick a default password (≥ 8 chars), click **Import**.

✅ Pass:
- Success toast: **"Imported N students"**.
- Navigate to `/admin/students`. New rows are present.
- Open one in Prisma Studio: `admissionNo` is `SMS-2025-000N` (auto),
  `programmeId` points at the right `Programme` row, `academicYear` is
  stamped.

### 8.4 Invalid programme code is rejected per row

1. Add a row with `programmeCode = DOES-NOT-EXIST`.
2. Import.

✅ Pass: the import summary shows `failed: 1` with
`Programme "DOES-NOT-EXIST" not found in the target school`. The other
rows still import successfully.

---

## Test 9 — Cross-school guards (sign in as super admin)

**Why it matters:** the brief is multi-tenant. School A must never be
able to read or write School B's data.

### 9.1 Sign in as super admin

1. Log out, sign in as `admin@sms.local` / `admin123`.

### 9.2 Create a second school + programme

1. **Schools → New school**: name `Greenwood International`, address
   `123 Oak St`, contact email `admin@greenwood.test`.
2. **Programmes → New programme**: pick the new school, code
   `BSC-CS-GW`, name `BSc Computer Science (Greenwood)`.

✅ Pass: both rows are created. The school admin in §9.3 cannot see
either.

### 9.3 Log back in as school admin and verify isolation

1. Log out, sign in as `school.admin@sms.local`.
2. **Programmes** page.

✅ Pass: only Sunrise Academy's programmes are listed.
`BSC-CS-GW` is **not** visible.

3. Open DevTools → Network. Try to POST a programme create with
   `schoolId = <Greenwood id>` (intercept and edit the body).

✅ Pass: the action rejects with an inline error and **no** row is
written. Confirm with `prisma.programme.findMany({ where: { schoolId:
greenwoodId }})` in Studio — still only the super-admin-created row.

### 9.4 Cross-school student class guard (legacy)

1. While still signed in as school admin, open the network tab.
2. Post a student create with a `currentClassId` belonging to
   Greenwood.

✅ Pass: server returns
`Class "..." is in a different school` and no `User`/`Student` row is
written (verify in Prisma Studio).

---

## Test 10 — Audit log

**Why it matters:** every successful mutation should write a row inside
the same Prisma `$transaction`. This is the basis for "you can prove who
did what, when".

### 10.1 Open the audit log

1. Sign in as super admin.
2. Navigate to **Audit log** (`/admin/audit`).
3. Filter by the most recent day (or just scroll to the bottom).

✅ Pass: for every action you did in Tests 1–9, there is a
corresponding `AuditLog` row with the right `entityType` /
`action` / `entityId`. Examples:

| What you did | Expected audit action |
|---|---|
| Created `BSC-SE` in §1.2 | `programmes.create` |
| Edited `BSC-SE` in §1.4 | `programmes.update` |
| Deactivated `BSC-SE` in §1.5 | `programmes.toggle_active` |
| Created student in §2.2 | `students.create` |
| Changed enrollment status in §4.3 | `enrollments.update_status` |
| Created fee structure in §5.2 | `fee_structures.create` |
| Issued invoice in §6.1 | `invoices.create` |
| Imported CSV in §8.3 | `students.csv_import_start` + `…_done` |

### 10.2 Failed actions are **not** audited

1. Try to create a duplicate `BSC-SE` programme (same as §1.3).
2. Check the audit log.

✅ Pass: **no** new `programmes.create` row for the failed attempt.
Failures happen pre-transaction, so no audit row is written.

---

## Test 11 — Vitest integration suite (optional)

If you want to run the automated check alongside the manual one:

```bash
npm test
```

✅ Pass: every line in the output reports **passed**:

- `createStudent` — 4 cases (atomic happy path, email uniqueness,
  cross-school class guard, missing programme + sequential ID
  auto-generation).
- `createProgramme` — 3 cases (happy path + audit, duplicate code,
  cross-school guard).
- `programmeFees` — 3 cases (fee structure by programme, auto-derive
  amount, refusal when no amount is derivable).

Total: **10 / 10 passed**.

> The suite needs Postgres reachable (same `DATABASE_URL` as dev). If
> it's not running, the suite fails fast with a connection error — fix
> the URL, not the tests.

---

## Pass / fail summary

After running all 11 tests, fill this in:

| # | Test | Pass? |
|---|---|---|
| 1 | Programmes CRUD | ☐ |
| 2 | Auto-generated `SMS-YYYY-####` | ☐ |
| 3 | Programme & status filters | ☐ |
| 4 | Enrollment lifecycle | ☐ |
| 5 | Programme-based fee structure | ☐ |
| 6 | Auto-derived invoice amount | ☐ |
| 7 | Overdue widget | ☐ |
| 8 | CSV import with `programmeCode` | ☐ |
| 9 | Cross-school guards | ☐ |
| 10 | Audit log | ☐ |
| 11 | `npm test` (10/10) | ☐ |

If any box is unchecked, see the troubleshooting section below.

---

## Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| Sidebar doesn't show **Programmes** | `manage_programmes` permission not in your role's set | `lib/rbac.ts` — confirm your role is in the `manage_programmes` row |
| Admission number column is editable | Old student form cached | Hard-refresh (`Cmd-Shift-R` / `Ctrl-Shift-R`); confirm the import in `components/admin/students/StudentForm.tsx` |
| Auto-derived amount is `0` | The programme has no active fee structure | `/admin/fees` → create an active fee structure for the programme |
| Overdue widget is empty | No past-due invoices, or all have full payments | Prisma Studio → `Invoice` table; check `dueDate` and the `Payment` child rows |
| Audit log missing rows | Action threw **before** the transaction opened (e.g. cross-school guard) | This is by design — see [Test 10.2](#102-failed-actions-are-not-audited) |
| `npm test` can't connect to Postgres | `DATABASE_URL` points at a host that's down | Run `docker compose up -d db`; check `.env` |
| `prisma generate` errors during dev | Schema drift after a manual edit | `npm run db:generate`; restart `npm run dev` |
| Status filter shows old names | Browser cached the old client bundle | Hard-refresh; clear Service Worker if present |
| `Programme is required` won't let you submit a student | The form's zod resolver enforces it | Pick a programme (no way around — the brief requires it) |

---

## What this guide does **not** cover

These are intentionally out of scope for the Registry refactor; they
land in their own modules per `docs/MANUAL_TESTING.md` §6:

- Classes CRUD (`/admin/classes`) — Module 4.
- Attendance (`/teacher/attendance`, `/student/attendance`) — Module 5.
- Exams / results (`/admin/exams`, `/teacher/results`,
  `/student/results`) — Module 5.
- Library (`/admin/library`, `/teacher/library`,
  `/student/library`) — Module 6.
- Reports (`/admin/reports`) — Module 7.
- Notifications UI (`/admin/notifications`) — Module 8.

If you want to verify a placeholder page, see
`docs/MANUAL_TESTING.md` §6 for the expected "Coming soon" copy.
