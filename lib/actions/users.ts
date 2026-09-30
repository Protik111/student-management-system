"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  generateTempPassword,
  type ActionResult,
} from "@/lib/actions/_helpers";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateInput,
  type UserUpdateInput,
} from "@/lib/actions/schemas";
import { ROLES, type Role } from "@/lib/db/types";

/* ─── List ───────────────────────────────────────────────────────────────── */

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  primaryRole: Role;
  roles: Role[];
  schoolId: string | null;
  schoolName: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export async function listUsers(): Promise<UserListItem[]> {
  const actor = await requirePermission("manage_users");

  const where =
    actor.role === "school_admin" && actor.schoolId
      ? { schoolId: actor.schoolId }
      : {};

  const rows = await prisma.user.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
    include: {
      school: { select: { id: true, name: true } },
      roles: { select: { role: true } },
    },
  });

  return rows.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
    primaryRole: u.primaryRole,
    roles: u.roles.map((r) => r.role),
    schoolId: u.schoolId,
    schoolName: u.school?.name ?? null,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));
}

/* ─── Lookup data for UserForm (school picker + role picker) ─────────────── */

export interface UserFormOptions {
  schools: { id: string; name: string; isActive: boolean }[];
  /** Roles the caller is allowed to assign. school_admin never sees super_admin. */
  assignableRoles: Role[];
  /** When true the caller is allowed to leave schoolId empty (super admins creating super admins). */
  canCreateCrossSchool: boolean;
}

export async function getUserFormOptions(): Promise<UserFormOptions> {
  const actor = await requirePermission("manage_users");

  if (actor.role === "school_admin") {
    const school = actor.schoolId
      ? await prisma.school.findUnique({
          where: { id: actor.schoolId },
          select: { id: true, name: true, isActive: true },
        })
      : null;
    return {
      schools: school ? [school] : [],
      assignableRoles: ["school_admin", "teacher", "student"],
      canCreateCrossSchool: false,
    };
  }

  const schools = await prisma.school.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, isActive: true },
  });

  return {
    schools,
    assignableRoles: [...ROLES],
    canCreateCrossSchool: true,
  };
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createUser(
  input: UserCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_users");
  } catch {
    return fail("You don't have permission to create users");
  }

  const parsed = userCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const data = parsed.data;

  // School_admin scope: force schoolId, reject super_admin primary
  if (actor.role === "school_admin") {
    if (!actor.schoolId) {
      return fail("Your account is not attached to a school");
    }
    if (data.primaryRole === "super_admin") {
      return fail("School admins cannot create super admins");
    }
    data.schoolId = actor.schoolId; // force
  } else {
    // super_admin: super_admin primary → schoolId must be null
    if (data.primaryRole === "super_admin" && data.schoolId) {
      return fail("Super admins cannot be attached to a school", {
        schoolId: ["Leave empty for super admins"],
      });
    }
    if (data.primaryRole !== "super_admin" && !data.schoolId) {
      return fail("A school is required for non-super-admin users", {
        schoolId: ["School is required"],
      });
    }
  }

  // Verify school exists if set
  if (data.schoolId) {
    const school = await prisma.school.findUnique({
      where: { id: data.schoolId },
      select: { id: true },
    });
    if (!school) return fail("Selected school not found", { schoolId: ["Invalid school"] });
  }

  // Email uniqueness
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return fail("A user with that email already exists", { email: ["Email already in use"] });
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
          schoolId: data.schoolId ?? null,
          primaryRole: data.primaryRole,
          isActive: true,
        },
      });
      // Insert role rows (composite PK). One upsert per role is fine; createMany would
      // fail on conflict but roles are new here.
      await tx.userRole.createMany({
        data: data.roles.map((role) => ({
          userId: user.id,
          role,
          schoolId: data.schoolId ?? null,
        })),
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: data.schoolId ?? null,
        action: "users.create",
        entityType: "user",
        entityId: user.id,
        payload: {
          email: user.email,
          primaryRole: user.primaryRole,
          roles: data.roles,
        },
      });
      return user;
    });

    revalidatePath("/super-admin/users");
    revalidatePath("/school-admin/users");
    return ok({ id: created.id });
  } catch (err) {
    return messageFromError(err, "Failed to create user");
  }
}

export async function updateUser(
  input: UserUpdateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_users");
  } catch {
    return fail("You don't have permission to update users");
  }

  const parsed = userUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", flattenZod(parsed.error));
  }
  const { id, roles, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0 && !roles) {
    return fail("Nothing to update");
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { roles: true },
  });
  if (!existing) return fail("User not found");

  // School_admin scope: must be same school
  if (actor.role === "school_admin") {
    if (existing.schoolId !== actor.schoolId) {
      return fail("You can only edit users in your school");
    }
    if (patch.primaryRole === "super_admin") {
      return fail("School admins cannot promote to super admin");
    }
    // Strip fields that cross school boundaries
    delete (patch as { schoolId?: unknown }).schoolId;
  } else {
    // super_admin: if moving a non-super user, schoolId must be valid
    if (
      patch.schoolId &&
      patch.schoolId !== existing.schoolId &&
      (patch.primaryRole ?? existing.primaryRole) !== "super_admin"
    ) {
      const school = await prisma.school.findUnique({
        where: { id: patch.schoolId },
        select: { id: true },
      });
      if (!school) return fail("Selected school not found", { schoolId: ["Invalid school"] });
    }
  }

  // Email conflict check
  if (patch.email && patch.email !== existing.email) {
    const dup = await prisma.user.findUnique({
      where: { email: patch.email },
      select: { id: true },
    });
    if (dup && dup.id !== id) {
      return fail("A user with that email already exists", {
        email: ["Email already in use"],
      });
    }
  }

  try {
    const changedFields = Object.keys(patch);
    const oldRoles = existing.roles.map((r) => r.role);
    const rolesChanged = roles ? !sameSet(roles, oldRoles) : false;

    await prisma.$transaction(async (tx) => {
      if (changedFields.length > 0) {
        await tx.user.update({ where: { id }, data: patch });
      }
      if (rolesChanged && roles) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({
          data: roles.map((role) => ({
            userId: id,
            role,
            schoolId: existing.schoolId ?? null,
          })),
        });
        // If primaryRole not explicitly set in patch, sync it from the first role
        if (patch.primaryRole === undefined) {
          await tx.user.update({ where: { id }, data: { primaryRole: roles[0] } });
        }
        changedFields.push("roles");
      }
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId ?? null,
        action: "users.update",
        entityType: "user",
        entityId: id,
        payload: {
          changedFields,
          ...(rolesChanged
            ? { rolesChanged: { old: oldRoles, next: roles } }
            : {}),
        },
      });
    });

    revalidatePath("/super-admin/users");
    revalidatePath("/school-admin/users");
    return ok({ id });
  } catch (err) {
    return messageFromError(err, "Failed to update user");
  }
}

export async function toggleUserActive(
  id: string,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("manage_users");
  } catch {
    return fail("You don't have permission to update users");
  }

  if (id === actor.id) {
    return fail("You can't deactivate your own account");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail("User not found");

  if (actor.role === "school_admin" && existing.schoolId !== actor.schoolId) {
    return fail("You can only edit users in your school");
  }

  const nextActive = !existing.isActive;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { isActive: nextActive } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId ?? null,
        action: "users.toggle_active",
        entityType: "user",
        entityId: id,
        payload: { isActive: nextActive },
      });
    });

    revalidatePath("/super-admin/users");
    revalidatePath("/school-admin/users");
    return ok({ id, isActive: nextActive });
  } catch (err) {
    return messageFromError(err, "Failed to toggle user status");
  }
}

export async function resetUserPassword(
  id: string,
): Promise<ActionResult<{ tempPassword: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_users");
  } catch {
    return fail("You don't have permission to reset passwords");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail("User not found");

  if (actor.role === "school_admin" && existing.schoolId !== actor.schoolId) {
    return fail("You can only reset passwords for users in your school");
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hash(tempPassword, 10);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { passwordHash } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId ?? null,
        action: "users.reset_password",
        entityType: "user",
        entityId: id,
        payload: {}, // never log the password value
      });
    });

    revalidatePath("/super-admin/users");
    revalidatePath("/school-admin/users");
    return ok({ tempPassword });
  } catch (err) {
    return messageFromError(err, "Failed to reset password");
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

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  for (const v of b) if (!set.has(v)) return false;
  return true;
}