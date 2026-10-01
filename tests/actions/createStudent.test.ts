/**
 * Integration test for the `createStudent` server action.
 *
 * We mock `@/auth` so the action thinks it's running inside a real
 * request as a school admin, but everything else — Prisma, the schema
 * validation, the audit-log writes — runs against a fresh isolated
 * Postgres schema pushed + truncated + reseeded by `tests/setup.ts`.
 *
 * The four cases cover:
 *   1. Happy path — atomic create of User + UserRole + Student + Enrollment
 *      and one audit row per logical action.
 *   2. Email uniqueness — pre-check rejects a duplicate before any DB write.
 *   3. admissionNo uniqueness — same idea, scoped per school.
 *   4. Cross-school class — currentClassId in a different school → rejected
 *      pre-transaction; no rows leak.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock NextAuth's `auth()` to inject a school-admin session ────────────
vi.mock("@/auth", () => ({
  auth: async () => ({
    user: {
      id: "actor_school_admin_1",
      email: "actor@test.local",
      name: "Test School Admin",
      fullName: "Test School Admin",
      role: "ADMIN",
      schoolId: "school_test_1",
      roles: ["ADMIN"],
    },
  }),
}));

// ─── Mock next/cache ──────────────────────────────────────────────────────
// `revalidatePath` requires Next's static-generation store, which doesn't
// exist outside a real request. Stub it so the action's revalidate calls
// are no-ops in tests.
vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

// Pull the prisma client from the test setup (which already pushed the
// schema against the test Postgres database).
import {
  prisma,
  resetTestDb,
  seedFixtures,
} from "../setup";

// Import the action AFTER the auth mock is registered.
import { createStudent } from "@/lib/actions/students";
import type { StudentCreateFormInput } from "@/lib/actions/schemas";

// `StudentCreateFormInput` is the pre-transform shape (dateOfBirth is a
// string). The action's signature is the post-transform shape (Date); zod
// parses the form input server-side, so we cast at the call site.
type FormInput = StudentCreateFormInput;

let schoolId: string;
let otherSchoolId: string;

beforeEach(async () => {
  await resetTestDb();
  const fixtures = await seedFixtures();
  schoolId = fixtures.school.id;
  otherSchoolId = fixtures.otherSchool.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

function makeInput(): FormInput {
  return {
    email: `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`,
    fullName: "Test Student",
    password: "supersecret123",
    schoolId, // ignored by the action once it forces the actor's schoolId
    primaryRole: "STUDENT",
    roles: ["STUDENT"],
    admissionNo: `ADM-${Date.now()}`,
    enrollInCurrentClass: true,
    currentClassId: "class_test_1",
    dateOfBirth: "2010-05-15",
    gender: "male",
  };
}

// Wrapper that mirrors how the real form layer calls the action — passes
// the form-input shape and lets zod parse it.
async function callCreateStudent(input: FormInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createStudent(input as any);
}

describe("createStudent", () => {
  it("creates user + userRole + student + enrollment + audit rows atomically", async () => {
    const result = await callCreateStudent(makeInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const studentId = result.data.id;

    const [user, student, enrollments, userRole, audits] = await Promise.all([
      prisma.student
        .findUnique({ where: { id: studentId }, include: { user: true } })
        .then((s) => s?.user),
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.enrollment.findMany({ where: { studentId } }),
      prisma.userRole.findMany({ where: { user: { student: { id: studentId } } } }),
      prisma.auditLog.findMany({ where: { entityId: studentId } }),
    ]);

    expect(user?.email).toMatch(/@test\.local$/);
    expect(user?.primaryRole).toBe("STUDENT");
    expect(user?.schoolId).toBe(schoolId);
    expect(user?.isActive).toBe(true);

    expect(student?.admissionNo).toMatch(/^ADM-/);
    expect(student?.currentClassId).toBe("class_test_1");
    expect(student?.schoolId).toBe(schoolId);

    expect(userRole.map((r) => r.role)).toEqual(["STUDENT"]);

    expect(enrollments).toHaveLength(1);
    expect(enrollments[0]?.classId).toBe("class_test_1");
    expect(enrollments[0]?.status).toBe("active");
    expect(enrollments[0]?.academicYear).toBe("2025-2026");

    const actions = audits.map((a) => a.action).sort();
    expect(actions).toEqual(["enrollments.create", "students.create"]);
  });

  it("rejects a duplicate email before any DB write", async () => {
    const inputA = makeInput();
    const first = await callCreateStudent(inputA);
    expect(first.ok).toBe(true);

    // Snapshot counts after the first successful create
    const beforeCounts = {
      user: await prisma.user.count(),
      student: await prisma.student.count(),
      enrollment: await prisma.enrollment.count(),
    };

    // Now try to create another student with the SAME email
    const second = await callCreateStudent({
      ...makeInput(),
      email: inputA.email,
      admissionNo: "ADM-DIFFERENT",
    });

    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toMatch(/email already exists/i);

    const afterCounts = {
      user: await prisma.user.count(),
      student: await prisma.student.count(),
      enrollment: await prisma.enrollment.count(),
    };
    expect(afterCounts).toEqual(beforeCounts); // no leak
  });

  it("rejects a duplicate admissionNo within the same school", async () => {
    const inputA = { ...makeInput(), admissionNo: "ADM-DUP-001" };
    const first = await callCreateStudent(inputA);
    expect(first.ok).toBe(true);

    const second = await callCreateStudent({
      ...makeInput(),
      admissionNo: "ADM-DUP-001", // same school
    });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toMatch(/admission number already used/i);
  });

  it("rejects a currentClassId belonging to a different school", async () => {
    const beforeCounts = {
      user: await prisma.user.count(),
      student: await prisma.student.count(),
      enrollment: await prisma.enrollment.count(),
    };

    const result = await callCreateStudent({
      ...makeInput(),
      currentClassId: "class_test_2", // belongs to otherSchoolId
      enrollInCurrentClass: true,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/not in the selected school/i);

    const afterCounts = {
      user: await prisma.user.count(),
      student: await prisma.student.count(),
      enrollment: await prisma.enrollment.count(),
    };
    expect(afterCounts).toEqual(beforeCounts); // no leak
    // Make sure we didn't accidentally create a stray enrollment against the
    // foreign class.
    const foreignEnrollments = await prisma.enrollment.findMany({
      where: { classId: "class_test_2" },
    });
    expect(foreignEnrollments).toHaveLength(0);
  });
});