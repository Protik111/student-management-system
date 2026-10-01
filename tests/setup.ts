/**
 * Vitest setup — runs once before any test file.
 *
 * Goals:
 *   1. Point Prisma at the test Postgres database (defaults to the local
 *      dev DB on `localhost:5432`, but `DATABASE_URL_TEST` overrides).
 *   2. Push the current schema into that DB on startup so the test run
 *      is self-bootstrapping (you don't have to remember to `db:push`
 *      before running tests).
 *   3. Provide a small set of fixtures (one school, one class, one
 *      school-admin actor) that the createStudent test depends on.
 *      `beforeEach` calls `resetTestDb()` + `seedFixtures()` so every
 *      test starts from a known empty state.
 *
 * The env vars MUST be set before importing prisma; that's why we use a
 * `setupFiles` entry and an `await import` of prisma afterwards.
 */
import { execSync } from "node:child_process";

// Default to the same Postgres the dev environment uses. Override with
// `DATABASE_URL_TEST` (e.g. CI spinning up its own container) if needed.
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  process.env.DATABASE_URL ??
  "postgresql://app:app@localhost:5432/app";
// NODE_ENV is typed as a literal; the test environment is non-prod so a
// cast is safe.
(process.env as Record<string, string>).NODE_ENV = "test";
// Pin the academic year so enrollment rows match the fixtures.
process.env.ACADEMIC_YEAR = "2025-2026";

// Push the current schema into the test DB. `--force-reset` drops and
// recreates every table — equivalent to the previous SQLite "wipe the
// file" step.
execSync("npx prisma db push --force-reset --accept-data-loss --skip-generate", {
  stdio: "ignore",
  env: { ...process.env },
});

// Now safe to import prisma (the adapter reads DATABASE_URL at import time)
const { prisma } = await import("../lib/db/prisma");

/**
 * Drops every row in dependency-safe order, then re-inserts the minimum
 * fixtures needed for the createStudent test.
 *
 * We do this lazily so a test that only needs the empty schema doesn't pay
 * the fixture cost.
 */
export async function resetTestDb() {
  // Order matters — children before parents.
  await prisma.attendanceEntry.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.bookIssue.deleteMany();
  await prisma.book.deleteMany();
  await prisma.reportCard.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
}

export async function seedFixtures() {
  // ─── School ──────────────────────────────────────────────────────────
  const school = await prisma.school.create({
    data: {
      id: "school_test_1",
      name: "Test Academy",
      address: "1 Test Lane",
      contactEmail: "test@academy.local",
      isActive: true,
    },
  });

  // Second school for cross-school test
  const otherSchool = await prisma.school.create({
    data: {
      id: "school_test_2",
      name: "Other Academy",
      isActive: true,
    },
  });

  // ─── Class (so we can attach enrollments) ────────────────────────────
  await prisma.class.create({
    data: {
      id: "class_test_1",
      schoolId: school.id,
      name: "Grade 9",
      gradeLevel: 9,
      section: "A",
      academicYear: "2025-2026",
    },
  });

  // Class in the OTHER school — used by the cross-school rejection test
  await prisma.class.create({
    data: {
      id: "class_test_2",
      schoolId: otherSchool.id,
      name: "Grade 9",
      gradeLevel: 9,
      section: "A",
      academicYear: "2025-2026",
    },
  });

  // ─── Actor (school-admin) ─────────────────────────────────────────────
  // The mocked `@/auth` returns id "actor_school_admin_1". Audit logs
  // reference this user via actorId, so the row must exist before any
  // action runs or the FK constraint on auditLog fails.
  await prisma.user.create({
    data: {
      id: "actor_school_admin_1",
      email: "actor@test.local",
      fullName: "Test School Admin",
      passwordHash: "test-only-not-real",
      primaryRole: "ADMIN",
      schoolId: school.id,
      isActive: true,
    },
  });

  return { school, otherSchool };
}

export { prisma };