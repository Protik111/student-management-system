import { prisma } from "@/lib/db/prisma";

/**
 * Create an empty `Attendance` row for any class that does not yet have one
 * for the given date. Real status entries are added when the teacher takes
 * attendance during the day. Idempotent.
 */
export async function finalizeAttendanceForDate(
  day: Date = new Date(),
): Promise<number> {
  const startOfDay = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
  );
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const allClasses = await prisma.class.findMany({
    select: { id: true, schoolId: true },
  });

  // Find classes that already have an attendance row for today — skip them.
  const existing = await prisma.attendance.findMany({
    where: {
      date: { gte: startOfDay, lt: endOfDay },
      classId: { in: allClasses.map((c) => c.id) },
    },
    select: { classId: true },
  });
  const alreadyHas = new Set(existing.map((e) => e.classId));

  // Of the remaining, only act on classes that have at least one enrolled enrollment.
  const candidates = allClasses.filter((c) => !alreadyHas.has(c.id));
  if (candidates.length === 0) return 0;

  const activeEnrollments = await prisma.enrollment.findMany({
    where: {
      classId: { in: candidates.map((c) => c.id) },
      status: "enrolled",
    },
    select: { classId: true },
    distinct: ["classId"],
  });
  const activeClassIds = new Set(activeEnrollments.map((e) => e.classId));
  const toCreate = candidates.filter((c) => activeClassIds.has(c.id));

  if (toCreate.length === 0) return 0;

  await prisma.$transaction(async (tx) => {
    await tx.attendance.createMany({
      data: toCreate.map((c) => ({
        id: crypto.randomUUID(),
        schoolId: c.schoolId,
        classId: c.id,
        date: startOfDay,
        takenBy: null,
        notes: "auto-skeleton (finalize cron)",
      })),
    });

    await tx.auditLog.createMany({
      data: toCreate.map((c) => ({
        id: crypto.randomUUID(),
        actorId: null,
        schoolId: c.schoolId,
        action: "attendance.finalize",
        entityType: "attendance",
        entityId: c.id,
        payload: JSON.stringify({ date: startOfDay.toISOString() }),
      })),
    });
  });

  return toCreate.length;
}