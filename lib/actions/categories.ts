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
  categoryCreateSchema,
  type CategoryCreateInput,
} from "@/lib/actions/schemas";

/* ─── List ───────────────────────────────────────────────────────────────── */

export interface CategoryListItem {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description: string | null;
  courseCount: number;
  createdAt: Date;
}

export async function listCategories(): Promise<CategoryListItem[]> {
  const actor = await requirePermission("manage_categories");

  const where: Prisma.CategoryWhereInput =
    actor.role === "ADMIN" && actor.schoolId
      ? { schoolId: actor.schoolId }
      : {};

  const rows = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    schoolId: r.schoolId,
    name: r.name,
    code: r.code,
    description: r.description,
    courseCount: r._count.courses,
    createdAt: r.createdAt,
  }));
}

/** Lightweight list used to populate course-form selects. Includes all schools
 *  if the caller is an ADMIN without a schoolId (super-admin scenario). */
export async function listCategoriesForSelect(): Promise<
  { id: string; name: string; schoolId: string }[]
> {
  const actor = await requirePermission("view_courses");
  const where: Prisma.CategoryWhereInput =
    actor.role === "ADMIN" && actor.schoolId
      ? { schoolId: actor.schoolId }
      : {};
  const rows = await prisma.category.findMany({
    where,
    select: { id: true, name: true, schoolId: true },
    orderBy: { name: "asc" },
  });
  return rows;
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createCategory(
  input: CategoryCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_categories");
  } catch {
    return fail("You don't have permission to create categories");
  }

  if (!actor.schoolId) {
    return fail(
      "Your account isn't attached to a school. Contact an administrator.",
    );
  }

  const parsed = categoryCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }

  const existing = await prisma.category.findUnique({
    where: {
      schoolId_code: { schoolId: actor.schoolId, code: parsed.data.code },
    },
    select: { id: true },
  });
  if (existing) {
    return fail("A category with that code already exists in your school", {
      code: ["Code already in use"],
    });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.category.create({
        data: {
          schoolId: actor.schoolId!,
          name: parsed.data.name,
          code: parsed.data.code,
          description: parsed.data.description || null,
        },
        select: { id: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "category.create",
        entityType: "category",
        entityId: row.id,
        payload: { name: parsed.data.name, code: parsed.data.code },
      });
      return row;
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");
    return ok({ id: created.id });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return fail("A category with that code already exists", {
        code: ["Code already in use"],
      });
    }
    return fail((e as Error).message ?? "Couldn't create category");
  }
}

export async function deleteCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_categories");
  } catch {
    return fail("You don't have permission to delete categories");
  }

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, schoolId: true, _count: { select: { courses: true } } },
  });
  if (!existing) return fail("Category not found");
  if (existing.schoolId !== actor.schoolId) {
    return fail("You can only delete categories in your school");
  }
  if (existing._count.courses > 0) {
    return fail(
      `Category has ${existing._count.courses} course(s) attached. Move or delete them first.`,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.category.delete({ where: { id } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "category.delete",
        entityType: "category",
        entityId: id,
        payload: null,
      });
    });
    revalidatePath("/admin/categories");
    return ok({ id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't delete category");
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