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
import {
  programmeCreateSchema,
  programmeUpdateSchema,
  type ProgrammeCreateInput,
  type ProgrammeUpdateInput,
} from "@/lib/actions/schemas";

/* ─── List (full table for the Programmes admin page) ────────────────────── */

export interface ProgrammeListItem {
  id: string;
  schoolId: string;
  schoolName: string;
  name: string;
  code: string;
  durationYears: number;
  isActive: boolean;
  createdAt: Date;
  studentCount: number;
}

export async function listProgrammes(): Promise<ProgrammeListItem[]> {
  await requirePermission("manage_programmes");

  const rows = await prisma.programme.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      school: { select: { name: true } },
      _count: { select: { students: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    schoolId: r.schoolId,
    schoolName: r.school.name,
    name: r.name,
    code: r.code,
    durationYears: r.durationYears,
    isActive: r.isActive,
    createdAt: r.createdAt,
    studentCount: r._count.students,
  }));
}

/* ─── Picker list (only the active ones for the actor's school) ──────────── */

export async function listProgrammesForSchool(
  schoolId: string,
): Promise<Array<{ id: string; name: string; code: string; durationYears: number }>> {
  const actor = await requirePermission("manage_students");
  if (actor.role === "ADMIN" && actor.schoolId && actor.schoolId !== schoolId) {
    return [];
  }
  const rows = await prisma.programme.findMany({
    where: { schoolId, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, durationYears: true },
  });
  return rows;
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createProgramme(
  input: ProgrammeCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_programmes");
  } catch {
    return fail("You don't have permission to create programmes");
  }
  if (actor.role === "ADMIN" && !actor.schoolId) {
    return fail("No school context");
  }

  const parsed = programmeCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const data = parsed.data;
  const schoolId = data.schoolId ?? actor.schoolId!;

  if (actor.role === "ADMIN" && schoolId !== actor.schoolId) {
    return fail("You can only create programmes in your school");
  }

  // Cross-check that the school exists
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return fail("School not found");

  // Unique-code check (Prisma unique is on (schoolId, code))
  const dup = await prisma.programme.findUnique({
    where: { schoolId_code: { schoolId, code: data.code } },
  });
  if (dup) {
    return fail("A programme with that code already exists in this school", {
      code: ["Code already in use"],
    });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const prog = await tx.programme.create({
        data: {
          id: crypto.randomUUID(),
          schoolId,
          name: data.name,
          code: data.code,
          durationYears: data.durationYears,
          isActive: data.isActive,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId,
        action: "programmes.create",
        entityType: "Programme",
        entityId: prog.id,
        payload: {
          name: prog.name,
          code: prog.code,
          durationYears: prog.durationYears,
        },
      });
      return prog;
    });

    revalidatePath("/admin/programmes");
    revalidatePath("/admin/fees");
    revalidatePath("/admin/students");
    return ok({ id: created.id });
  } catch (err) {
    return messageFromError(err, "Failed to create programme");
  }
}

export async function updateProgramme(
  input: ProgrammeUpdateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_programmes");
  } catch {
    return fail("You don't have permission to update programmes");
  }

  const parsed = programmeUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const { id, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0) {
    return fail("Nothing to update");
  }

  const existing = await prisma.programme.findUnique({ where: { id } });
  if (!existing) return fail("Programme not found");

  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only update programmes in your school");
  }

  // If code is changing, ensure no collision in (schoolId, code)
  if (patch.code && patch.code !== existing.code) {
    const dup = await prisma.programme.findUnique({
      where: { schoolId_code: { schoolId: existing.schoolId, code: patch.code } },
    });
    if (dup && dup.id !== id) {
      return fail("A programme with that code already exists in this school", {
        code: ["Code already in use"],
      });
    }
  }

  try {
    const changedFields = Object.keys(patch);
    await prisma.$transaction(async (tx) => {
      await tx.programme.update({ where: { id }, data: patch });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId,
        action: "programmes.update",
        entityType: "Programme",
        entityId: id,
        payload: { changedFields },
      });
    });

    revalidatePath("/admin/programmes");
    revalidatePath("/admin/fees");
    revalidatePath("/admin/students");
    return ok({ id });
  } catch (err) {
    return messageFromError(err, "Failed to update programme");
  }
}

export async function toggleProgrammeActive(
  id: string,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("manage_programmes");
  } catch {
    return fail("You don't have permission to update programmes");
  }

  const existing = await prisma.programme.findUnique({ where: { id } });
  if (!existing) return fail("Programme not found");

  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only update programmes in your school");
  }

  const nextActive = !existing.isActive;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.programme.update({ where: { id }, data: { isActive: nextActive } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId,
        action: "programmes.toggle_active",
        entityType: "Programme",
        entityId: id,
        payload: { isActive: nextActive },
      });
    });

    revalidatePath("/admin/programmes");
    revalidatePath("/admin/fees");
    revalidatePath("/admin/students");
    return ok({ id, isActive: nextActive });
  } catch (err) {
    return messageFromError(err, "Failed to toggle programme status");
  }
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

function messageFromError(err: unknown, fallback: string): ActionResult<never> {
  const message = err instanceof Error ? err.message : fallback;
  return fail(message || fallback);
}