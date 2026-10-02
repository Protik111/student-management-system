"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import { notify } from "@/lib/notifications";
import {
  enrollmentCreateSchema,
  enrollmentUpdateStatusSchema,
  type EnrollmentCreateInput,
  type EnrollmentUpdateStatusInput,
} from "@/lib/actions/schemas";
import type { EnrollmentStatus } from "@/lib/db/types";
export type { EnrollmentStatus } from "@/lib/db/types";

/* ─── List ───────────────────────────────────────────────────────────────── */

export interface EnrollmentListItem {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  classSection: string;
  classGradeLevel: number;
  academicYear: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  leftAt: Date | null;
}

export async function listEnrollmentsForStudent(
  studentId: string,
): Promise<EnrollmentListItem[]> {
  await requirePermission("manage_students");
  const rows = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      student: { select: { user: { select: { fullName: true } } } },
      class: { select: { id: true, name: true, section: true, gradeLevel: true } },
    },
    orderBy: [{ academicYear: "desc" }, { enrolledAt: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.student.user.fullName,
    classId: r.classId,
    className: r.class.name,
    classSection: r.class.section,
    classGradeLevel: r.class.gradeLevel,
    academicYear: r.academicYear,
    status: r.status,
    enrolledAt: r.enrolledAt,
    leftAt: r.leftAt,
  }));
}

export async function listEnrollmentsForSchool(
  opts: { status?: EnrollmentStatus } = {},
): Promise<EnrollmentListItem[]> {
  const actor = await requirePermission("manage_enrollments");
  if (actor.role !== "ADMIN" && !actor.schoolId) return [];

  const rows = await prisma.enrollment.findMany({
    where: {
      ...(actor.role === "ADMIN" ? {} : { class: { schoolId: actor.schoolId! } }),
      ...(opts.status ? { status: opts.status } : {}),
    },
    include: {
      student: { select: { user: { select: { fullName: true } } } },
      class: { select: { id: true, name: true, section: true, gradeLevel: true } },
    },
    orderBy: [{ academicYear: "desc" }, { enrolledAt: "desc" }],
    take: 500,
  });
  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.student.user.fullName,
    classId: r.classId,
    className: r.class.name,
    classSection: r.class.section,
    classGradeLevel: r.class.gradeLevel,
    academicYear: r.academicYear,
    status: r.status,
    enrolledAt: r.enrolledAt,
    leftAt: r.leftAt,
  }));
}

/* ─── Status change ──────────────────────────────────────────────────────── */

export async function updateEnrollmentStatus(
  input: EnrollmentUpdateStatusInput,
): Promise<ActionResult<{ id: string; status: EnrollmentStatus }>> {
  let actor;
  try {
    actor = await requirePermission("manage_enrollments");
  } catch {
    return fail("You don't have permission to update enrollment status");
  }

  const parsed = enrollmentUpdateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }

  const { id, status, leftAt } = parsed.data;
  const existing = await prisma.enrollment.findUnique({
    where: { id },
    include: { student: { select: { userId: true, schoolId: true } }, class: true },
  });
  if (!existing) return fail("Enrollment not found");

  if (actor.role === "ADMIN" && existing.student.schoolId !== actor.schoolId) {
    return fail("You can only update enrollments in your school");
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const data: { status: EnrollmentStatus; leftAt?: Date | null } = { status };
      // Setting status to "enrolled" clears leftAt. Anything else stamps leftAt.
      if (status === "enrolled") {
        data.leftAt = null;
      } else if (leftAt) {
        data.leftAt = leftAt;
      } else if (!existing.leftAt) {
        data.leftAt = new Date();
      }
      const result = await tx.enrollment.update({ where: { id }, data });

      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.student.schoolId,
        action: "enrollments.update_status",
        entityType: "Enrollment",
        entityId: id,
        payload: {
          studentId: existing.studentId,
          classId: existing.classId,
          academicYear: existing.academicYear,
          fromStatus: existing.status,
          toStatus: status,
        },
      });

      // Notify the student so they see this in their inbox.
      await notify(tx, {
        recipientUserId: existing.student.userId,
        type: "enrollment_status_changed",
        title: `Enrollment status: ${status}`,
        body: `Your enrollment in ${existing.class.name}-${existing.class.section} (${existing.academicYear}) is now ${status}.`,
        link: "/student",
        payload: { enrollmentId: id, status },
      });

      return result;
    });

    revalidatePath(`/admin/students/${existing.studentId}/enrollments`);
    revalidatePath("/admin/enrollments");
    revalidatePath("/student");
    revalidatePath("/student/audit");
    return ok({ id: updated.id, status: updated.status });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't update enrollment status");
  }
}

/* ─── Direct create (admin-side, in addition to the StudentForm toggle) ── */

export async function createEnrollment(
  input: EnrollmentCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_enrollments");
  } catch {
    return fail("You don't have permission to create enrollments");
  }

  const parsed = enrollmentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }

  const { studentId, classId, academicYear, status } = parsed.data;

  const [student, klass] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, select: { schoolId: true, userId: true } }),
    prisma.class.findUnique({ where: { id: classId }, select: { schoolId: true } }),
  ]);
  if (!student) return fail("Student not found");
  if (!klass) return fail("Class not found");
  if (student.schoolId !== klass.schoolId) {
    return fail("Student and class are in different schools");
  }
  if (actor.role === "ADMIN" && student.schoolId !== actor.schoolId) {
    return fail("You can only enroll students in your school");
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const e = await tx.enrollment.create({
        data: { studentId, classId, academicYear, status },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: student.schoolId,
        action: "enrollments.create",
        entityType: "Enrollment",
        entityId: e.id,
        payload: { studentId, classId, academicYear, status },
      });
      await notify(tx, {
        recipientUserId: student.userId,
        type: "enrollment_created",
        title: "You're enrolled in a new class",
        body: `Welcome — you have a new ${status} enrollment for ${academicYear}.`,
        link: "/student",
        payload: { enrollmentId: e.id },
      });
      return e;
    });

    revalidatePath("/admin/enrollments");
    revalidatePath(`/admin/students/${studentId}/enrollments`);
    revalidatePath("/student");
    return ok({ id: created.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't create enrollment");
  }
}

/* ─── helpers ────────────────────────────────────────────────────────────── */

function flattenZod(err: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    (out[key] ||= []).push(issue.message);
  }
  return out;
}
