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

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface CourseEnrollmentRow {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  source: "enrolled" | "added";
  enrolledAt: Date;
}

export interface EnrollmentListResult {
  rows: CourseEnrollmentRow[];
  total: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function flattenZod(err: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    (out[path] ??= []).push(issue.message);
  }
  return out;
}

/* ─── enrollSelf ─────────────────────────────────────────────────────────── */

export async function enrollSelf(
  courseId: string,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("enroll_self");
  } catch {
    return fail("Only students can self-enroll");
  }

  if (actor.role !== "STUDENT") {
    return fail("Only students can self-enroll");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      schoolId: true,
      isActive: true,
      title: true,
      teacher: { select: { userId: true, user: { select: { fullName: true } } } },
    },
  });
  if (!course) return fail("Course not found");
  if (!course.isActive) return fail("This course isn't currently active");

  const student = await prisma.student.findUnique({
    where: { userId: actor.id },
    select: { id: true, schoolId: true },
  });
  if (!student) return fail("Your account isn't linked to a student profile");
  if (student.schoolId !== course.schoolId) {
    return fail("This course is offered at a different school");
  }

  // Already enrolled? — idempotent success so refreshes don't surprise.
  const existing = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
    select: { id: true },
  });
  if (existing) return ok({ id: existing.id });

  try {
    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.courseEnrollment.create({
        data: {
          studentId: student.id,
          courseId,
          source: "enrolled",
        },
        select: { id: true, enrolledAt: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "course_enrollment.create",
        entityType: "course_enrollment",
        entityId: row.id,
        payload: { courseId, studentId: student.id, source: "enrolled" },
      });
      return row;
    });

    if (course.teacher?.userId) {
      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          recipientUserId: course.teacher.userId,
          type: "course_enrolled",
          title: "New enrollment",
          body: `${actor.fullName} just enrolled in "${course.title}".`,
          link: "/teacher/courses",
          payload: JSON.stringify({ courseId, enrollmentId: created.id }),
        },
      });
    }

    revalidatePath("/student/browse");
    revalidatePath("/student/courses");
    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/teacher/courses/${courseId}`);
    revalidatePath("/admin/enrollments");
    return ok({ id: created.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't enroll in course");
  }
}

/* ─── addStudentToCourse ─────────────────────────────────────────────────── */

export async function addStudentToCourse(input: {
  courseId: string;
  studentId: string;
}): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("add_student_to_course");
  } catch {
    return fail("You don't have permission to add students to courses");
  }

  const { courseId, studentId } = input;

  const [course, student] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        schoolId: true,
        isActive: true,
        title: true,
        teacherId: true,
        teacher: { select: { userId: true } },
      },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        schoolId: true,
        userId: true,
        user: { select: { email: true, fullName: true } },
      },
    }),
  ]);

  if (!course) return fail("Course not found");
  if (!student) return fail("Student not found");
  if (course.schoolId !== student.schoolId) {
    return fail("Course and student are in different schools");
  }
  if (actor.schoolId && course.schoolId !== actor.schoolId) {
    return fail("Course is in a different school");
  }

  // Teacher must own the course.
  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || teacherRow.id !== course.teacherId) {
      return fail("You can only add students to your own courses");
    }
  }

  const existing = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  });
  if (existing) {
    return ok({ id: existing.id });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.courseEnrollment.create({
        data: { studentId, courseId, source: "added" },
        select: { id: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "course_enrollment.add",
        entityType: "course_enrollment",
        entityId: row.id,
        payload: { courseId, studentId, source: "added" },
      });
      return row;
    });

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        recipientUserId: student.userId,
        type: "course_added",
        title: `Added to "${course.title}"`,
        body: `${actor.fullName} added you to "${course.title}".`,
        link: `/student/courses/${courseId}`,
        payload: JSON.stringify({ courseId, enrollmentId: created.id }),
      },
    });

    revalidatePath("/student/courses");
    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/teacher/courses/${courseId}`);
    revalidatePath("/admin/enrollments");
    return ok({ id: created.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't add student to course");
  }
}

/* ─── removeStudentFromCourse ────────────────────────────────────────────── */

export async function removeStudentFromCourse(input: {
  courseId: string;
  studentId: string;
}): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_enrollments");
  } catch {
    return fail("You don't have permission to remove enrollments");
  }

  const { courseId, studentId } = input;

  const existing = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true, course: { select: { schoolId: true, teacherId: true } } },
  });
  if (!existing) return fail("Enrollment not found");
  if (existing.course.schoolId !== actor.schoolId) {
    return fail("Course is in a different school");
  }

  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || teacherRow.id !== existing.course.teacherId) {
      return fail("You can only remove enrollments from your own courses");
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.courseEnrollment.delete({ where: { id: existing.id } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "course_enrollment.delete",
        entityType: "course_enrollment",
        entityId: existing.id,
        payload: { courseId, studentId },
      });
    });
    revalidatePath("/student/courses");
    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/teacher/courses/${courseId}`);
    revalidatePath("/admin/enrollments");
    return ok({ id: existing.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't remove enrollment");
  }
}

/* ─── listEnrollmentsForCourse ──────────────────────────────────────────── */

export async function listEnrollmentsForCourse(
  courseId: string,
): Promise<CourseEnrollmentRow[]> {
  let actor;
  try {
    actor = await requirePermission("view_course_enrollments");
  } catch {
    return [];
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, schoolId: true, teacherId: true },
  });
  if (!course) return [];
  if (actor.schoolId && course.schoolId !== actor.schoolId) return [];

  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || teacherRow.id !== course.teacherId) return [];
  }

  const rows = await prisma.courseEnrollment.findMany({
    where: { courseId },
    orderBy: { enrolledAt: "desc" },
    include: {
      student: {
        select: { id: true, user: { select: { fullName: true, email: true } } },
      },
      course: { select: { id: true, title: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    courseId: r.course.id,
    courseTitle: r.course.title,
    studentId: r.student.id,
    studentName: r.student.user.fullName,
    studentEmail: r.student.user.email,
    source: r.source,
    enrolledAt: r.enrolledAt,
  }));
}

/* ─── listAllEnrollments (admin) ────────────────────────────────────────── */

export async function listAllEnrollments(filters: {
  courseId?: string;
  studentId?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<EnrollmentListResult> {
  let actor;
  try {
    actor = await requirePermission("view_course_enrollments");
  } catch {
    return { rows: [], total: 0 };
  }

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 25));

  const where: import("@prisma/client").Prisma.CourseEnrollmentWhereInput = {};
  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.studentId) where.studentId = filters.studentId;
  if (actor.schoolId) {
    where.course = { schoolId: actor.schoolId };
  }
  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow) return { rows: [], total: 0 };
    where.course = { ...(where.course as object), teacherId: teacherRow.id };
  }

  const [total, rows] = await Promise.all([
    prisma.courseEnrollment.count({ where }),
    prisma.courseEnrollment.findMany({
      where,
      orderBy: { enrolledAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: { id: true, user: { select: { fullName: true, email: true } } },
        },
        course: { select: { id: true, title: true } },
      },
    }),
  ]);
  return {
    rows: rows.map((r) => ({
      id: r.id,
      courseId: r.course.id,
      courseTitle: r.course.title,
      studentId: r.student.id,
      studentName: r.student.user.fullName,
      studentEmail: r.student.user.email,
      source: r.source,
      enrolledAt: r.enrolledAt,
    })),
    total,
  };
}