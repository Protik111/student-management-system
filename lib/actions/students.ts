"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  getCurrentAcademicYear,
  type ActionResult,
} from "@/lib/actions/_helpers";
import {
  studentCreateSchema,
  studentUpdateSchema,
  type StudentCreateInput,
  type StudentUpdateInput,
} from "@/lib/actions/schemas";
import type { Gender, EnrollmentStatus } from "@/lib/db/types";

/* ─── List ───────────────────────────────────────────────────────────────── */

export interface StudentListItem {
  id: string;
  userId: string;
  admissionNo: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  dateOfBirth: Date | null;
  gender: Gender | null;
  guardianName: string | null;
  guardianPhone: string | null;
  schoolId: string;
  schoolName: string;
  currentClassId: string | null;
  currentClassName: string | null;
  createdAt: Date;
}

export async function listStudents(): Promise<StudentListItem[]> {
  const actor = await requirePermission("manage_students");

  const where =
    actor.role === "ADMIN" && actor.schoolId
      ? { schoolId: actor.schoolId }
      : {};

  const rows = await prisma.student.findMany({
    where,
    orderBy: [{ admissionNo: "asc" }],
    include: {
      user: { select: { email: true, fullName: true, phone: true, avatarUrl: true, isActive: true } },
      school: { select: { id: true, name: true } },
      currentClass: { select: { id: true, name: true, section: true } },
    },
  });

  return rows.map((s) => ({
    id: s.id,
    userId: s.userId,
    admissionNo: s.admissionNo,
    fullName: s.user.fullName,
    email: s.user.email,
    phone: s.user.phone,
    avatarUrl: s.user.avatarUrl,
    isActive: s.user.isActive,
    dateOfBirth: s.dateOfBirth,
    gender: s.gender,
    guardianName: s.guardianName,
    guardianPhone: s.guardianPhone,
    schoolId: s.schoolId,
    schoolName: s.school.name,
    currentClassId: s.currentClassId,
    currentClassName: s.currentClass
      ? `${s.currentClass.name}-${s.currentClass.section}`
      : null,
    createdAt: s.createdAt,
  }));
}

/* ─── Form options (school + class pickers) ──────────────────────────────── */

export interface StudentFormOptions {
  schools: { id: string; name: string; isActive: boolean }[];
  /** Classes keyed by schoolId so the client can filter when a school is picked. */
  classesBySchool: Record<string, { id: string; name: string; section: string; academicYear: string }[]>;
}

export async function getStudentFormOptions(): Promise<StudentFormOptions> {
  const actor = await requirePermission("manage_students");

  const [schools, classes] = await Promise.all([
    actor.role === "ADMIN" && actor.schoolId
      ? prisma.school.findMany({
          where: { id: actor.schoolId },
          select: { id: true, name: true, isActive: true },
        })
      : prisma.school.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, isActive: true },
        }),
    prisma.class.findMany({
      where:
        actor.role === "ADMIN" && actor.schoolId
          ? { schoolId: actor.schoolId }
          : {},
      orderBy: [{ schoolId: "asc" }, { gradeLevel: "asc" }, { section: "asc" }],
      select: {
        id: true,
        schoolId: true,
        name: true,
        section: true,
        academicYear: true,
      },
    }),
  ]);

  const classesBySchool: StudentFormOptions["classesBySchool"] = {};
  for (const c of classes) {
    (classesBySchool[c.schoolId] ??= []).push({
      id: c.id,
      name: c.name,
      section: c.section,
      academicYear: c.academicYear,
    });
  }
  return { schools, classesBySchool };
}

/* ─── Enrollments (for the history page) ─────────────────────────────────── */

export interface EnrollmentListItem {
  id: string;
  classId: string;
  className: string;
  classSection: string;
  classGradeLevel: number;
  academicYear: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  leftAt: Date | null;
}

export async function listStudentEnrollments(
  studentId: string,
): Promise<EnrollmentListItem[]> {
  const actor = await requirePermission("manage_students");

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, schoolId: true },
  });
  if (!student) return [];

  if (actor.role === "ADMIN" && student.schoolId !== actor.schoolId) {
    return [];
  }

  const rows = await prisma.enrollment.findMany({
    where: { studentId },
    orderBy: [{ enrolledAt: "desc" }],
    include: {
      class: { select: { id: true, name: true, section: true, gradeLevel: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
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

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createStudent(
  input: StudentCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_students");
  } catch {
    return fail("You don't have permission to create students");
  }

  const parsed = studentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const data = parsed.data;

  // School admin: force schoolId to their own
  if (actor.role === "ADMIN") {
    if (!actor.schoolId) return fail("Your account is not attached to a school");
    data.schoolId = actor.schoolId;
  }

  // School must exist + be active
  const school = await prisma.school.findUnique({
    where: { id: data.schoolId },
    select: { id: true, isActive: true },
  });
  if (!school) return fail("School not found", { schoolId: ["Invalid school"] });
  if (!school.isActive && actor.role !== "ADMIN") {
    return fail("School is inactive", { schoolId: ["School is inactive"] });
  }

  // currentClassId must belong to the same school if set
  if (data.currentClassId) {
    const klass = await prisma.class.findUnique({
      where: { id: data.currentClassId },
      select: { id: true, schoolId: true },
    });
    if (!klass) return fail("Class not found", { currentClassId: ["Invalid class"] });
    if (klass.schoolId !== data.schoolId) {
      return fail("Class is not in the selected school", {
        currentClassId: ["Class is not in the selected school"],
      });
    }
  }

  // Email + admissionNo uniqueness
  const dupEmail = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (dupEmail) return fail("A user with that email already exists", { email: ["Email already in use"] });

  const dupAdm = await prisma.student.findUnique({
    where: { schoolId_admissionNo: { schoolId: data.schoolId, admissionNo: data.admissionNo } },
    select: { id: true },
  });
  if (dupAdm) {
    return fail("Admission number already used in this school", {
      admissionNo: ["Already used in this school"],
    });
  }

  if (!data.password) {
    return fail("Password is required", { password: ["Password is required"] });
  }
  const passwordHash = await hash(data.password, 10);

  const academicYear = getCurrentAcademicYear();

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone ?? null,
          avatarUrl: data.avatarUrl ?? null,
          schoolId: data.schoolId,
          primaryRole: "STUDENT",
          isActive: true,
        },
      });
      await tx.userRole.createMany({
        data: data.roles.map((role) => ({
          userId: user.id,
          role,
          schoolId: data.schoolId,
        })),
      });
      const student = await tx.student.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          schoolId: data.schoolId,
          admissionNo: data.admissionNo,
          dateOfBirth: data.dateOfBirth ?? null,
          gender: data.gender ?? null,
          currentClassId: data.currentClassId ?? null,
          guardianName: data.guardianName ?? null,
          guardianPhone: data.guardianPhone ?? null,
          address: data.address ?? null,
        },
      });
      if (data.enrollInCurrentClass && data.currentClassId) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classId: data.currentClassId,
            academicYear,
            status: "active",
          },
        });
        await writeAuditLog(tx, {
          actorId: actor.id,
          schoolId: data.schoolId,
          action: "enrollments.create",
          entityType: "enrollment",
          entityId: student.id,
          payload: {
            studentId: student.id,
            classId: data.currentClassId,
            academicYear,
            status: "active",
          },
        });
      }
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: data.schoolId,
        action: "students.create",
        entityType: "student",
        entityId: student.id,
        payload: {
          email: user.email,
          admissionNo: student.admissionNo,
          currentClassId: student.currentClassId,
        },
      });
      return student;
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/students");
    return ok({ id: created.id });
  } catch (err) {
    return messageFromError(err, "Failed to create student");
  }
}

export async function updateStudent(
  input: StudentUpdateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_students");
  } catch {
    return fail("You don't have permission to update students");
  }

  const parsed = studentUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const { id, currentClassId, ...rest } = parsed.data;
  if (Object.keys(rest).length === 0 && currentClassId === undefined) {
    return fail("Nothing to update");
  }

  const existing = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) return fail("Student not found");

  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only edit students in your school");
  }

  // Class-scope check on new currentClassId
  if (currentClassId && currentClassId !== existing.currentClassId) {
    const klass = await prisma.class.findUnique({
      where: { id: currentClassId },
      select: { id: true, schoolId: true },
    });
    if (!klass) return fail("Class not found", { currentClassId: ["Invalid class"] });
    if (klass.schoolId !== existing.schoolId) {
      return fail("Class is not in the student's school", {
        currentClassId: ["Class is not in the student's school"],
      });
    }
  }

  // Email uniqueness
  if (rest.email && rest.email !== existing.user.email) {
    const dup = await prisma.user.findUnique({
      where: { email: rest.email },
      select: { id: true },
    });
    if (dup && dup.id !== existing.userId) {
      return fail("A user with that email already exists", { email: ["Email already in use"] });
    }
  }

  // admissionNo uniqueness
  if (rest.admissionNo && rest.admissionNo !== existing.admissionNo) {
    const dup = await prisma.student.findUnique({
      where: { schoolId_admissionNo: { schoolId: existing.schoolId, admissionNo: rest.admissionNo } },
      select: { id: true },
    });
    if (dup && dup.id !== id) {
      return fail("Admission number already used in this school", {
        admissionNo: ["Already used in this school"],
      });
    }
  }

  const academicYear = getCurrentAcademicYear();
  const isClassChange = currentClassId !== undefined && currentClassId !== existing.currentClassId;
  const wantsEnrollment = rest.enrollInCurrentClass && isClassChange;

  try {
    const changedFields = Object.keys(rest).filter((k) => k !== "enrollInCurrentClass");
    if (currentClassId !== undefined && currentClassId !== existing.currentClassId) {
      changedFields.push("currentClassId");
    }
    await prisma.$transaction(async (tx) => {
      // Split user-table patches vs student-table patches
      const userPatch: Record<string, unknown> = {};
      if (rest.email !== undefined) userPatch.email = rest.email;
      if (rest.fullName !== undefined) userPatch.fullName = rest.fullName;
      if (rest.phone !== undefined) userPatch.phone = rest.phone ?? null;
      if (rest.avatarUrl !== undefined) userPatch.avatarUrl = rest.avatarUrl ?? null;
      if (rest.isActive !== undefined) userPatch.isActive = rest.isActive;
      if (Object.keys(userPatch).length > 0) {
        await tx.user.update({ where: { id: existing.userId }, data: userPatch });
      }
      const studentPatch: Record<string, unknown> = {};
      if (rest.admissionNo !== undefined) studentPatch.admissionNo = rest.admissionNo;
      if (rest.dateOfBirth !== undefined) studentPatch.dateOfBirth = rest.dateOfBirth;
      if (rest.gender !== undefined) studentPatch.gender = rest.gender;
      if (currentClassId !== undefined) studentPatch.currentClassId = currentClassId || null;
      if (rest.guardianName !== undefined) studentPatch.guardianName = rest.guardianName ?? null;
      if (rest.guardianPhone !== undefined) studentPatch.guardianPhone = rest.guardianPhone ?? null;
      if (rest.address !== undefined) studentPatch.address = rest.address ?? null;
      if (Object.keys(studentPatch).length > 0) {
        await tx.student.update({ where: { id }, data: studentPatch });
      }
      // Optional: write a fresh enrollment row on class change
      if (wantsEnrollment && currentClassId) {
        await tx.enrollment.create({
          data: {
            studentId: id,
            classId: currentClassId,
            academicYear,
            status: "active",
          },
        });
        await writeAuditLog(tx, {
          actorId: actor.id,
          schoolId: existing.schoolId,
          action: "enrollments.create",
          entityType: "enrollment",
          entityId: id,
          payload: {
            studentId: id,
            classId: currentClassId,
            academicYear,
            status: "active",
          },
        });
      }
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId,
        action: "students.update",
        entityType: "student",
        entityId: id,
        payload: { changedFields },
      });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/students");
    return ok({ id });
  } catch (err) {
    return messageFromError(err, "Failed to update student");
  }
}

export async function toggleStudentActive(
  id: string,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("manage_students");
  } catch {
    return fail("You don't have permission to update students");
  }

  if (id === actor.id) return fail("You can't deactivate your own account");

  const existing = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) return fail("Student not found");

  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only edit students in your school");
  }

  const nextActive = !existing.user.isActive;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: { isActive: nextActive },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId,
        action: "students.toggle_active",
        entityType: "student",
        entityId: id,
        payload: { isActive: nextActive },
      });
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/students");
    return ok({ id, isActive: nextActive });
  } catch (err) {
    return messageFromError(err, "Failed to toggle student status");
  }
}

/* ─── Internal helpers ───────────────────────────────────────────────────── */

function flattenZod(err: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    (out[path] ??= []).push(issue.message);
  }
  return out;
}

function messageFromError(err: unknown, fallback: string): ActionResult<never> {
  const message = err instanceof Error ? err.message : fallback;
  return fail(message || fallback);
}