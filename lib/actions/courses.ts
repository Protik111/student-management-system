"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import {
  courseCreateSchema,
  courseUpdateSchema,
  courseListSearchSchema,
  type CourseCreateInput,
  type CourseUpdateInput,
  type CourseListSearchInput,
} from "@/lib/actions/schemas";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface CourseListItem {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  teacherId: string;
  teacherName: string;
  priceCents: number;
  isActive: boolean;
  createdAt: Date;
  enrollmentCount: number;
  materialCount: number;
}

export interface CourseDetail extends CourseListItem {
  updatedAt: Date;
  isEnrolled: boolean;
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

function buildOrderBy(
  sort: import("@/lib/actions/schemas").CourseSort,
): Prisma.CourseOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "oldest":
      return [{ createdAt: "asc" }];
    case "title-asc":
      return [{ title: "asc" }];
    case "title-desc":
      return [{ title: "desc" }];
    case "price-asc":
      return [{ priceCents: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ priceCents: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

/* ─── listCourses ────────────────────────────────────────────────────────── */

export interface CourseListResult {
  rows: CourseListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listCourses(
  rawInput: CourseListSearchInput = {},
): Promise<CourseListResult> {
  const actor = await requirePermission("view_courses");

  const parsed = courseListSearchSchema.safeParse(rawInput);
  if (!parsed.success) {
    // Fall back to defaults rather than throwing — the table page renders
    // empty rows on bad filters.
    return { rows: [], total: 0, page: 1, pageSize: 20 };
  }
  const { q, sort, page, pageSize, categoryId, teacherId, isActive } =
    parsed.data;

  const where: Prisma.CourseWhereInput = {};
  if (actor.role === "ADMIN" && actor.schoolId) {
    where.schoolId = actor.schoolId;
  } else if (actor.role === "TEACHER") {
    // Teachers see courses in their school but listMyCourses handles their
    // personal set; here we keep the full list scoped to school.
    if (actor.schoolId) where.schoolId = actor.schoolId;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (teacherId) where.teacherId = teacherId;
  if (typeof isActive === "boolean") where.isActive = isActive;

  const skip = (page - 1) * pageSize;
  const [total, rows] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        teacher: { select: { id: true, user: { select: { fullName: true } } } },
        _count: {
          select: { enrollments: true, materials: true },
        },
      },
    }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      schoolId: r.schoolId,
      title: r.title,
      description: r.description,
      categoryId: r.categoryId,
      categoryName: r.category.name,
      teacherId: r.teacher.id,
      teacherName: r.teacher.user.fullName,
      priceCents: r.priceCents,
      isActive: r.isActive,
      createdAt: r.createdAt,
      enrollmentCount: r._count.enrollments,
      materialCount: r._count.materials,
    })),
    total,
    page,
    pageSize,
  };
}

/* ─── listMyCourses ──────────────────────────────────────────────────────── */

export async function listMyCourses(): Promise<CourseListItem[]> {
  const actor = await requirePermission("view_courses");

  if (actor.role === "ADMIN") {
    if (!actor.schoolId) return [];
    const rows = await prisma.course.findMany({
      where: { schoolId: actor.schoolId },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        teacher: { select: { id: true, user: { select: { fullName: true } } } },
        _count: { select: { enrollments: true, materials: true } },
      },
    });
    return rows.map(toListItem);
  }

  if (actor.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacher) return [];
    const rows = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        teacher: { select: { id: true, user: { select: { fullName: true } } } },
        _count: { select: { enrollments: true, materials: true } },
      },
    });
    return rows.map(toListItem);
  }

  // STUDENT
  const student = await prisma.student.findUnique({
    where: { userId: actor.id },
    select: { id: true },
  });
  if (!student) return [];
  const rows = await prisma.course.findMany({
    where: {
      enrollments: { some: { studentId: student.id } },
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      teacher: { select: { id: true, user: { select: { fullName: true } } } },
      _count: { select: { enrollments: true, materials: true } },
    },
  });
  return rows.map(toListItem);
}

function toListItem(r: {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  categoryId: string;
  category: { name: string };
  teacherId: string;
  teacher: { id: string; user: { fullName: string } };
  priceCents: number;
  isActive: boolean;
  createdAt: Date;
  _count: { enrollments: number; materials: number };
}): CourseListItem {
  return {
    id: r.id,
    schoolId: r.schoolId,
    title: r.title,
    description: r.description,
    categoryId: r.categoryId,
    categoryName: r.category.name,
    teacherId: r.teacher.id,
    teacherName: r.teacher.user.fullName,
    priceCents: r.priceCents,
    isActive: r.isActive,
    createdAt: r.createdAt,
    enrollmentCount: r._count.enrollments,
    materialCount: r._count.materials,
  };
}

/* ─── getCourse ──────────────────────────────────────────────────────────── */

export async function getCourse(
  id: string,
): Promise<CourseDetail | null> {
  const actor = await requirePermission("view_courses");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      teacher: { select: { id: true, user: { select: { fullName: true } } } },
      _count: { select: { enrollments: true, materials: true } },
    },
  });
  if (!course) return null;

  // Cross-school access is forbidden for everyone.
  if (
    actor.role !== "ADMIN" &&
    course.schoolId !== actor.schoolId
  ) {
    return null;
  }

  let isEnrolled = false;
  if (actor.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (student) {
      const enr = await prisma.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        select: { id: true },
      });
      isEnrolled = Boolean(enr);
    }
  }

  return {
    id: course.id,
    schoolId: course.schoolId,
    title: course.title,
    description: course.description,
    categoryId: course.categoryId,
    categoryName: course.category.name,
    teacherId: course.teacher.id,
    teacherName: course.teacher.user.fullName,
    priceCents: course.priceCents,
    isActive: course.isActive,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    enrollmentCount: course._count.enrollments,
    materialCount: course._count.materials,
    isEnrolled,
  };
}

/* ─── createCourse ───────────────────────────────────────────────────────── */

export async function createCourse(
  input: CourseCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_courses");
  } catch {
    return fail("You don't have permission to create courses");
  }

  if (!actor.schoolId) {
    return fail(
      "Your account isn't attached to a school. Contact an administrator.",
    );
  }

  const parsed = courseCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const data = parsed.data;

  // Teachers are auto-assigned to themselves unless they specify a teacherId
  // (which they can't, given the schema is optional and forms hide it). Admin
  // can override.
  let teacherId = data.teacherId;
  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true, schoolId: true },
    });
    if (!teacherRow) {
      return fail("Your account isn't linked to a teacher profile");
    }
    if (teacherRow.schoolId !== actor.schoolId) {
      return fail("Teacher record is in a different school");
    }
    teacherId = teacherRow.id;
  }
  if (!teacherId) {
    return fail("Teacher is required");
  }

  // Validate category belongs to the school
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true, schoolId: true },
  });
  if (!category) return fail("Category not found");
  if (category.schoolId !== actor.schoolId) {
    return fail("Category is in a different school");
  }
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true, schoolId: true },
  });
  if (!teacher) return fail("Teacher not found");
  if (teacher.schoolId !== actor.schoolId) {
    return fail("Teacher is in a different school");
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.course.create({
        data: {
          schoolId: actor.schoolId!,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          teacherId: teacherId!,
          priceCents: data.priceCents,
          isActive: data.isActive,
        },
        select: { id: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "course.create",
        entityType: "course",
        entityId: row.id,
        payload: { title: data.title, categoryId: data.categoryId },
      });
      return row;
    });

    revalidatePath("/admin/courses");
    revalidatePath("/teacher/courses");
    revalidatePath("/student/browse");
    return ok({ id: created.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't create course");
  }
}

/* ─── updateCourse ───────────────────────────────────────────────────────── */

export async function updateCourse(
  input: CourseUpdateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_courses");
  } catch {
    return fail("You don't have permission to edit courses");
  }

  const parsed = courseUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const data = parsed.data;

  const existing = await prisma.course.findUnique({
    where: { id: data.id },
    select: { id: true, schoolId: true, teacherId: true },
  });
  if (!existing) return fail("Course not found");
  if (existing.schoolId !== actor.schoolId) {
    return fail("Course is in a different school");
  }

  // Teachers may only edit their own courses.
  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || existing.teacherId !== teacherRow.id) {
      return fail("You can only edit courses you teach");
    }
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true, schoolId: true },
  });
  if (!category) return fail("Category not found");
  if (category.schoolId !== actor.schoolId) {
    return fail("Category is in a different school");
  }

  let teacherId = existing.teacherId;
  if (actor.role === "ADMIN" && data.teacherId && data.teacherId !== existing.teacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: data.teacherId },
      select: { id: true, schoolId: true },
    });
    if (!teacher) return fail("Teacher not found");
    if (teacher.schoolId !== actor.schoolId) {
      return fail("Teacher is in a different school");
    }
    teacherId = teacher.id;
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.course.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          teacherId,
          priceCents: data.priceCents,
          isActive: data.isActive,
        },
        select: { id: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "course.update",
        entityType: "course",
        entityId: row.id,
        payload: null,
      });
      return row;
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${updated.id}`);
    revalidatePath("/teacher/courses");
    revalidatePath(`/teacher/courses/${updated.id}`);
    revalidatePath("/student/browse");
    return ok({ id: updated.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't update course");
  }
}

/* ─── deleteCourse (admin-only) ──────────────────────────────────────────── */

export async function deleteCourse(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("delete_courses");
  } catch {
    return fail("Only admins can delete courses");
  }

  const existing = await prisma.course.findUnique({
    where: { id },
    select: { id: true, schoolId: true },
  });
  if (!existing) return fail("Course not found");
  if (existing.schoolId !== actor.schoolId) {
    return fail("Course is in a different school");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.course.delete({ where: { id } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "course.delete",
        entityType: "course",
        entityId: id,
        payload: null,
      });
    });
    revalidatePath("/admin/courses");
    revalidatePath("/teacher/courses");
    revalidatePath("/student/browse");
    return ok({ id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't delete course");
  }
}

/* ─── toggleCourseActive ─────────────────────────────────────────────────── */

export async function toggleCourseActive(
  id: string,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("manage_courses");
  } catch {
    return fail("You don't have permission to change course status");
  }

  const existing = await prisma.course.findUnique({
    where: { id },
    select: { id: true, schoolId: true, teacherId: true, isActive: true },
  });
  if (!existing) return fail("Course not found");
  if (existing.schoolId !== actor.schoolId) {
    return fail("Course is in a different school");
  }

  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || existing.teacherId !== teacherRow.id) {
      return fail("You can only change status on courses you teach");
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.course.update({
        where: { id },
        data: { isActive: !existing.isActive },
        select: { id: true, isActive: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: row.isActive ? "course.activate" : "course.deactivate",
        entityType: "course",
        entityId: row.id,
        payload: null,
      });
      return row;
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath("/teacher/courses");
    revalidatePath(`/teacher/courses/${id}`);
    revalidatePath("/student/browse");
    return ok({ id: updated.id, isActive: updated.isActive });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't update course status");
  }
}

/* ─── List helpers for forms ─────────────────────────────────────────────── */

export async function listTeachersForSelect(): Promise<
  { id: string; fullName: string }[]
> {
  const actor = await requirePermission("view_courses");
  if (!actor.schoolId) return [];
  const rows = await prisma.teacher.findMany({
    where: { schoolId: actor.schoolId, user: { isActive: true } },
    select: { id: true, user: { select: { fullName: true } } },
  });
  return rows.map((r) => ({ id: r.id, fullName: r.user.fullName }));
}

/** List students eligible to be added to a course (same school, not already enrolled). */
export async function listEligibleStudents(courseId: string): Promise<
  { id: string; fullName: string; email: string }[]
> {
  const actor = await requirePermission("add_student_to_course");
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { schoolId: true, teacherId: true },
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

  const enrolled = await prisma.courseEnrollment.findMany({
    where: { courseId },
    select: { studentId: true },
  });
  const enrolledIds = new Set(enrolled.map((e) => e.studentId));

  const rows = await prisma.student.findMany({
    where: {
      schoolId: course.schoolId,
      user: { isActive: true },
    },
    select: {
      id: true,
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  return rows
    .filter((r) => !enrolledIds.has(r.id))
    .map((r) => ({
      id: r.id,
      fullName: r.user.fullName,
      email: r.user.email,
    }));
}