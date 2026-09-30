/**
 * Vitest setup — runs once before any test file.
 *
 * Goals:
 *   1. Point Prisma at an isolated test SQLite database so we never touch
 *      `./data/sms.db` (the dev/seed database).
 *   2. Wipe + re-create the schema at the start of every test file so each
 *      run starts from a known empty state.
 *   3. Provide a small set of fixtures (one school, one class, one
 *      school-admin actor) that the createStudent test depends on.
 *
 * The env vars MUST be set before importing prisma; that's why we use a
 * `setupFiles` entry and an `await import` of prisma afterwards.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const TEST_DB_DIR = path.resolve(__dirname, "../data");
const TEST_DB_PATH = path.join(TEST_DB_DIR, "test-sms.db");

process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;
// NODE_ENV is typed as a literal; the test environment is non-prod so a
// cast is safe.
(process.env as Record<string, string>).NODE_ENV = "test";
// Pin the academic year so enrollment rows match the fixtures.
process.env.ACADEMIC_YEAR = "2025-2026";

// Make sure data/ exists
if (!existsSync(TEST_DB_DIR)) {
  mkdirSync(TEST_DB_DIR, { recursive: true });
}

// Wipe any prior test DB to keep the run deterministic
for (const suffix of ["", "-journal"]) {
  const p = TEST_DB_PATH + suffix;
  if (existsSync(p)) rmSync(p);
}

// Push the current schema into the fresh DB.
execSync("npx prisma db push", {
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
      primaryRole: "school_admin",
      schoolId: school.id,
      isActive: true,
    },
  });

  return { school, otherSchool };
}

export { prisma };