"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import {
  teacherCreateSchema,
  teacherUpdateSchema,
  type TeacherCreateInput,
  type TeacherUpdateInput,
} from "@/lib/actions/schemas";

/* ─── List ───────────────────────────────────────────────────────────────── */

export interface TeacherListItem {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  hireDate: Date | null;
  qualification: string | null;
  specialization: string | null;
  salary: number | null;
  schoolId: string;
  schoolName: string;
  createdAt: Date;
}

export async function listTeachers(): Promise<TeacherListItem[]> {
  const actor = await requirePermission("manage_teachers");

  const where =
    actor.role === "ADMIN" && actor.schoolId
      ? { schoolId: actor.schoolId }
      : {};

  const rows = await prisma.teacher.findMany({
    where,
    orderBy: [{ employeeId: "asc" }],
    include: {
      user: { select: { email: true, fullName: true, phone: true, avatarUrl: true, isActive: true } },
      school: { select: { id: true, name: true } },
    },
  });

  return rows.map((t) => ({
    id: t.id,
    userId: t.userId,
    employeeId: t.employeeId,
    fullName: t.user.fullName,
    email: t.user.email,
    phone: t.user.phone,
    avatarUrl: t.user.avatarUrl,
    isActive: t.user.isActive,
    hireDate: t.hireDate,
    qualification: t.qualification,
    specialization: t.specialization,
    salary: t.salary,
    schoolId: t.schoolId,
    schoolName: t.school.name,
    createdAt: t.createdAt,
  }));
}

/* ─── Form options (school picker only — teachers have no class) ─────────── */

export interface TeacherFormOptions {
  schools: { id: string; name: string; isActive: boolean }[];
}

export async function getTeacherFormOptions(): Promise<TeacherFormOptions> {
  const actor = await requirePermission("manage_teachers");

  const schools =
    actor.role === "ADMIN" && actor.schoolId
      ? await prisma.school.findMany({
          where: { id: actor.schoolId },
          select: { id: true, name: true, isActive: true },
        })
      : await prisma.school.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, isActive: true },
        });

  return { schools };
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createTeacher(
  input: TeacherCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_teachers");
  } catch {
    return fail("You don't have permission to create teachers");
  }

  const parsed = teacherCreateSchema.safeParse(input);
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

  // Email + employeeId uniqueness
  const dupEmail = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (dupEmail) {
    return fail("A user with that email already exists", { email: ["Email already in use"] });
  }

  const dupEmp = await prisma.teacher.findUnique({
    where: { schoolId_employeeId: { schoolId: data.schoolId, employeeId: data.employeeId } },
    select: { id: true },
  });
  if (dupEmp) {
    return fail("Employee ID already used in this school", {
      employeeId: ["Already used in this school"],
    });
  }

  if (!data.password) {
    return fail("Password is required", { password: ["Password is required"] });
  }
  const passwordHash = await hash(data.password, 10);

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
          primaryRole: "TEACHER",
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
      const teacher = await tx.teacher.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          schoolId: data.schoolId,
          employeeId: data.employeeId,
          qualification: data.qualification ?? null,
          specialization: data.specialization ?? null,
          salary: data.salary ?? null,
          hireDate: data.hireDate ?? new Date(),
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: data.schoolId,
        action: "teachers.create",
        entityType: "teacher",
        entityId: teacher.id,
        payload: {
          email: user.email,
          employeeId: teacher.employeeId,
        },
      });
      return teacher;
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/teachers");
    return ok({ id: created.id });
  } catch (err) {
    return messageFromError(err, "Failed to create teacher");
  }
}

export async function updateTeacher(
  input: TeacherUpdateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_teachers");
  } catch {
    return fail("You don't have permission to update teachers");
  }

  const parsed = teacherUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const { id, ...rest } = parsed.data;
  if (Object.keys(rest).length === 0) {
    return fail("Nothing to update");
  }

  const existing = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) return fail("Teacher not found");

  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only edit teachers in your school");
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

  // employeeId uniqueness
  if (rest.employeeId && rest.employeeId !== existing.employeeId) {
    const dup = await prisma.teacher.findUnique({
      where: {
        schoolId_employeeId: { schoolId: existing.schoolId, employeeId: rest.employeeId },
      },
      select: { id: true },
    });
    if (dup && dup.id !== id) {
      return fail("Employee ID already used in this school", {
        employeeId: ["Already used in this school"],
      });
    }
  }

  try {
    const changedFields = Object.keys(rest);
    await prisma.$transaction(async (tx) => {
      // Split user-table patches vs teacher-table patches
      const userPatch: Record<string, unknown> = {};
      if (rest.email !== undefined) userPatch.email = rest.email;
      if (rest.fullName !== undefined) userPatch.fullName = rest.fullName;
      if (rest.phone !== undefined) userPatch.phone = rest.phone ?? null;
      if (rest.avatarUrl !== undefined) userPatch.avatarUrl = rest.avatarUrl ?? null;
      if (rest.isActive !== undefined) userPatch.isActive = rest.isActive;
      if (Object.keys(userPatch).length > 0) {
        await tx.user.update({ where: { id: existing.userId }, data: userPatch });
      }
      const teacherPatch: Record<string, unknown> = {};
      if (rest.employeeId !== undefined) teacherPatch.employeeId = rest.employeeId;
      if (rest.qualification !== undefined) teacherPatch.qualification = rest.qualification ?? null;
      if (rest.specialization !== undefined) teacherPatch.specialization = rest.specialization ?? null;
      if (rest.salary !== undefined) teacherPatch.salary = rest.salary ?? null;
      if (rest.hireDate !== undefined) teacherPatch.hireDate = rest.hireDate ?? null;
      if (Object.keys(teacherPatch).length > 0) {
        await tx.teacher.update({ where: { id }, data: teacherPatch });
      }
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId,
        action: "teachers.update",
        entityType: "teacher",
        entityId: id,
        payload: { changedFields },
      });
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/teachers");
    return ok({ id });
  } catch (err) {
    return messageFromError(err, "Failed to update teacher");
  }
}

export async function toggleTeacherActive(
  id: string,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("manage_teachers");
  } catch {
    return fail("You don't have permission to update teachers");
  }

  if (id === actor.id) return fail("You can't deactivate your own account");

  const existing = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) return fail("Teacher not found");

  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only edit teachers in your school");
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
        action: "teachers.toggle_active",
        entityType: "teacher",
        entityId: id,
        payload: { isActive: nextActive },
      });
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/teachers");
    return ok({ id, isActive: nextActive });
  } catch (err) {
    return messageFromError(err, "Failed to toggle teacher status");
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