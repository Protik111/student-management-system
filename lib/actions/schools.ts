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
  schoolCreateSchema,
  schoolUpdateSchema,
  type SchoolCreateInput,
  type SchoolUpdateInput,
} from "@/lib/actions/schemas";

/* ─── List (for table hydration on the server page) ─────────────────────── */

export interface SchoolListItem {
  id: string;
  name: string;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: Date;
  userCount: number;
}

export async function listSchools(): Promise<SchoolListItem[]> {
  await requirePermission("manage_schools");

  const rows = await prisma.school.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { users: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    contactEmail: r.contactEmail,
    contactPhone: r.contactPhone,
    isActive: r.isActive,
    createdAt: r.createdAt,
    userCount: r._count.users,
  }));
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createSchool(
  input: SchoolCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_schools");
  } catch {
    return fail("You don't have permission to create schools");
  }

  const parsed = schoolCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const data = parsed.data;

  // Unique-name check (Prisma unique is on name; surface a friendly error)
  const existing = await prisma.school.findUnique({ where: { name: data.name } });
  if (existing) {
    return fail("A school with that name already exists", { name: ["Name already in use"] });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          address: data.address ?? null,
          contactEmail: data.contactEmail ?? null,
          contactPhone: data.contactPhone ?? null,
          logoUrl: data.logoUrl ?? null,
          isActive: data.isActive,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: school.id,
        action: "schools.create",
        entityType: "school",
        entityId: school.id,
        payload: {
          name: school.name,
          contactEmail: school.contactEmail,
          contactPhone: school.contactPhone,
        },
      });
      return school;
    });

    revalidatePath("/admin/schools");
    return ok({ id: created.id });
  } catch (err) {
    return messageFromError(err, "Failed to create school");
  }
}

export async function updateSchool(
  input: SchoolUpdateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_schools");
  } catch {
    return fail("You don't have permission to update schools");
  }

  const parsed = schoolUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const { id, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0) {
    return fail("Nothing to update");
  }

  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) return fail("School not found");

  if (patch.name && patch.name !== existing.name) {
    const dup = await prisma.school.findUnique({ where: { name: patch.name } });
    if (dup && dup.id !== id) {
      return fail("A school with that name already exists", { name: ["Name already in use"] });
    }
  }

  try {
    const changedFields = Object.keys(patch);
    await prisma.$transaction(async (tx) => {
      await tx.school.update({ where: { id }, data: patch });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: id,
        action: "schools.update",
        entityType: "school",
        entityId: id,
        payload: { changedFields },
      });
    });

    revalidatePath("/admin/schools");
    return ok({ id });
  } catch (err) {
    return messageFromError(err, "Failed to update school");
  }
}

export async function toggleSchoolActive(
  id: string,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("manage_schools");
  } catch {
    return fail("You don't have permission to update schools");
  }

  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) return fail("School not found");

  const nextActive = !existing.isActive;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.school.update({ where: { id }, data: { isActive: nextActive } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: id,
        action: "schools.toggle_active",
        entityType: "school",
        entityId: id,
        payload: { isActive: nextActive },
      });
    });

    revalidatePath("/admin/schools");
    return ok({ id, isActive: nextActive });
  } catch (err) {
    return messageFromError(err, "Failed to toggle school status");
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
