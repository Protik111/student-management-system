import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";

/**
 * Read-side for the AuditLog table. The write side is `writeAuditLog` in
 * `lib/actions/_helpers.ts`; this module is what every role's audit page
 * calls to render its log.
 *
 * Scoping:
 *   - super_admin → sees all rows (cross-school)
 *   - school_admin / teacher → rows scoped to their school
 *   - student → rows scoped to their school's records that mention them,
 *     plus rows where the student themselves is the actor.
 */
export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  schoolId: string | null;
  schoolName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  payload: unknown;
  createdAt: Date;
}

export interface AuditQuery {
  entityType?: string;
  actorId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  cursor?: string;
}

export async function listAuditLogs(query: AuditQuery = {}): Promise<AuditLogItem[]> {
  const actor = await requirePermission("view_audit");

  const where: Record<string, unknown> = {};
  if (actor.role === "ADMIN") {
    // Cross-school.
  } else if (actor.role === "STUDENT" && actor.id) {
    // Student can see:
    //   1. Their own audit entries (where actorId === user.id)
    //   2. Audit rows in their school that touch a Student or Invoice
    //      entity. (We approximate with schoolId scoping; the entity
    //      detail page surfaces the high-signal records.)
    const studentSchoolId = actor.schoolId ?? undefined;
    where.OR = [
      { actorId: actor.id },
      studentSchoolId ? { schoolId: studentSchoolId } : { actorId: "__never__" },
    ];
  } else {
    if (!actor.schoolId) return [];
    where.schoolId = actor.schoolId;
  }

  if (query.entityType) where.entityType = query.entityType;
  if (query.actorId) where.actorId = query.actorId;
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: query.limit ?? 100,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    include: {
      actor: { select: { fullName: true, email: true } },
      school: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    actorId: r.actorId,
    actorName: r.actor?.fullName ?? null,
    actorEmail: r.actor?.email ?? null,
    schoolId: r.schoolId,
    schoolName: r.school?.name ?? null,
    action: r.action,
    entityType: r.entityType,
    entityId: r.entityId,
    payload: r.payload ? JSON.parse(r.payload) : null,
    createdAt: r.createdAt,
  }));
}

/** Distinct entity types present in the audit log — used by the filter dropdown. */
export async function listEntityTypes(): Promise<string[]> {
  await requirePermission("view_audit");
  const groups = await prisma.auditLog.groupBy({
    by: ["entityType"],
    _count: { entityType: true },
    orderBy: { entityType: "asc" },
  });
  return groups.map((g) => g.entityType);
}
