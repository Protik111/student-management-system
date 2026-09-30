import "server-only";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userRoles, users, type Role } from "@/lib/db/schema";
import { can, type Permission } from "@/lib/rbac";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  schoolId: string | null;
  roles: Role[];
};

/**
 * Returns the current user from the session, or `null` if unauthenticated.
 * Server-only. Use `requireUser()` in protected route handlers / server components.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const su = session?.user;
  if (!su?.id) return null;

  // Pull fresh role list from DB (cheap) — primary role comes from JWT
  const roles = db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, su.id))
    .all()
    .map((r) => r.role);

  return {
    id: su.id,
    email: su.email,
    fullName: su.fullName,
    role: su.role,
    schoolId: su.schoolId,
    roles: roles.length ? roles : [su.role],
  };
}

/** Redirects to /login if no session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects to /login (or /unauthorized) if the user lacks the role. */
export async function requireRole(role: Role | Role[]): Promise<SessionUser> {
  const user = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) {
    const params = new URLSearchParams({
      required: allowed.join(","),
      actual: user.role,
    });
    redirect(`/unauthorized?${params.toString()}`);
  }
  return user;
}

/** Throws (or redirects) if the user lacks a specific permission. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    const params = new URLSearchParams({
      required: permission,
      actual: user.role,
    });
    redirect(`/unauthorized?${params.toString()}`);
  }
  return user;
}

/** Look up the canonical schoolId for a user; creates nothing. */
export async function getSchoolIdForUser(userId: string): Promise<string | null> {
  const row = db.select().from(users).where(eq(users.id, userId)).limit(1).get();
  return row?.schoolId ?? null;
}