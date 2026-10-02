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
import { generateStudentAdmissionNo } from "@/lib/sequences";
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
  programmeId: string | null;
  programmeName: string | null;
  academicYear: number | null;
  currentClassId: string | null;
  currentClassName: string | null;
  /** Latest enrollment status (if any), used for the status filter. */
  enrollmentStatus: EnrollmentStatus | null;
  createdAt: Date;
}

export interface StudentListFilters {
  q?: string;
  status?: EnrollmentStatus;
  programmeId?: string;
  academicYear?: number;
}

export async function listStudents(
  filters: StudentListFilters = {},
): Promise<StudentListItem[]> {
  const actor = await requirePermission("manage_students");

  const where: Record<string, unknown> = {};
  if (actor.role === "ADMIN" && actor.schoolId) {
    where.schoolId = actor.schoolId;
  }
  if (filters.programmeId) where.programmeId = filters.programmeId;
  if (filters.academicYear) where.academicYear = filters.academicYear;

  // Free-text search (q) is applied client-side after the fetch so we
  // don't over-fetch every row of every school just to substring-match
  // names. The other filters narrow the DB query before pagination.

  const rows = await prisma.student.findMany({
    where,
    orderBy: [{ admissionNo: "asc" }],
    include: {
      user: { select: { email: true, fullName: true, phone: true, avatarUrl: true, isActive: true } },
      school: { select: { id: true, name: true } },
      programme: { select: { id: true, name: true } },
      currentClass: { select: { id: true, name: true, section: true } },
    },
  });

  let mapped: StudentListItem[] = rows.map((s) => ({
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
    programmeId: s.programmeId,
    programmeName: s.programme?.name ?? null,
    academicYear: s.academicYear,
    currentClassId: s.currentClassId,
    currentClassName: s.currentClass
      ? `${s.currentClass.name}-${s.currentClass.section}`
      : null,
    enrollmentStatus: null,
    createdAt: s.createdAt,
  }));

  // Hydrate the latest enrollment status for every student we returned, so
  // the UI can filter by status without an extra round-trip per row.
  if (mapped.length > 0) {
    const latestEnrollments = await prisma.enrollment.findMany({
      where: { studentId: { in: mapped.map((s) => s.id) } },
      orderBy: [{ enrolledAt: "desc" }],
      select: { studentId: true, status: true },
      distinct: ["studentId"],
    });
    const statusByStudent = new Map(
      latestEnrollments.map((e) => [e.studentId, e.status]),
    );
    mapped = mapped.map((s) => ({
      ...s,
      enrollmentStatus: statusByStudent.get(s.id) ?? null,
    }));
  }

  // Enrolment status is a derived column (we don't store it on Student —
  // it's the status of the latest Enrollment row). Filter in-memory.
  if (filters.status) {
    const studentsWithStatus = await prisma.enrollment.findMany({
      where: {
        studentId: { in: mapped.map((s) => s.id) },
        status: filters.status,
      },
      select: { studentId: true },
      orderBy: [{ enrolledAt: "desc" }],
    });
    const idsWithStatus = new Set(studentsWithStatus.map((r) => r.studentId));
    mapped = mapped.filter((s) => idsWithStatus.has(s.id));
  }

  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    if (q) {
      mapped = mapped.filter((s) =>
        [
          s.fullName,
          s.email,
          s.admissionNo,
          s.schoolName,
          s.guardianName,
          s.currentClassName,
          s.programmeName,
        ]
          .filter((v) => v != null)
          .some((v) => (v as string).toLowerCase().includes(q)),
      );
    }
  }

  return mapped;
}

/* ─── Form options (school + class + programme pickers) ──────────────────── */

export interface StudentFormOptions {
  schools: { id: string; name: string; isActive: boolean }[];
  /** Classes keyed by schoolId so the client can filter when a school is picked. */
  classesBySchool: Record<string, { id: string; name: string; section: string; academicYear: string }[]>;
  /** Programmes keyed by schoolId. */
  programmesBySchool: Record<string, { id: string; name: string; code: string }[]>;
}

export async function getStudentFormOptions(): Promise<StudentFormOptions> {
  const actor = await requirePermission("manage_students");

  const [schools, classes, programmes] = await Promise.all([
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
    prisma.programme.findMany({
      where:
        actor.role === "ADMIN" && actor.schoolId
          ? { schoolId: actor.schoolId, isActive: true }
          : { isActive: true },
      orderBy: [{ schoolId: "asc" }, { name: "asc" }],
      select: { id: true, schoolId: true, name: true, code: true },
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
  const programmesBySchool: StudentFormOptions["programmesBySchool"] = {};
  for (const p of programmes) {
    (programmesBySchool[p.schoolId] ??= []).push({
      id: p.id,
      name: p.name,
      code: p.code,
    });
  }
  return { schools, classesBySchool, programmesBySchool };
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
): Promise<ActionResult<{ id: string; admissionNo: string }>> {
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

  // Programme must belong to the same school
  const programme = await prisma.programme.findUnique({
    where: { id: data.programmeId },
    select: { id: true, schoolId: true, isActive: true },
  });
  if (!programme) {
    return fail("Programme not found", { programmeId: ["Invalid programme"] });
  }
  if (programme.schoolId !== data.schoolId) {
    return fail("Programme is not in the selected school", {
      programmeId: ["Programme is not in the selected school"],
    });
  }
  if (!programme.isActive) {
    return fail("Programme is inactive", { programmeId: ["Programme is inactive"] });
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

  // Email uniqueness
  const dupEmail = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (dupEmail) return fail("A user with that email already exists", { email: ["Email already in use"] });

  if (!data.password) {
    return fail("Password is required", { password: ["Password is required"] });
  }
  const passwordHash = await hash(data.password, 10);

  const academicYear = getCurrentAcademicYear();

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Auto-generate the student ID inside it.
      const admissionNo = await generateStudentAdmissionNo(tx, data.schoolId);

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
          admissionNo,
          programmeId: data.programmeId,
          academicYear: data.academicYear,
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
            status: "enrolled",
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
            status: "enrolled",
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
          admissionNo,
          programmeId: data.programmeId,
          academicYear: data.academicYear,
          currentClassId: student.currentClassId,
        },
      });
      return student;
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/students");
    return ok({ id: created.id, admissionNo: created.admissionNo });
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

  // Programme-scope check on new programmeId
  if (rest.programmeId && rest.programmeId !== existing.programmeId) {
    const prog = await prisma.programme.findUnique({
      where: { id: rest.programmeId },
      select: { id: true, schoolId: true, isActive: true },
    });
    if (!prog) return fail("Programme not found", { programmeId: ["Invalid programme"] });
    if (prog.schoolId !== existing.schoolId) {
      return fail("Programme is not in the student's school", {
        programmeId: ["Programme is not in the student's school"],
      });
    }
    if (!prog.isActive) {
      return fail("Programme is inactive", { programmeId: ["Programme is inactive"] });
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
      if (rest.programmeId !== undefined) studentPatch.programmeId = rest.programmeId;
      if (rest.academicYear !== undefined) studentPatch.academicYear = rest.academicYear;
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
            status: "enrolled",
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
            status: "enrolled",
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