import { and, eq, gte, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { attendance, auditLogs, classes, enrollments } from "@/lib/db/schema";

/**
 * Create an empty `attendance` row for any class that does not yet have one
 * for the given date. Real status entries are added when the teacher takes
 * attendance during the day. Idempotent.
 */
export async function finalizeAttendanceForDate(
  day: Date = new Date(),
): Promise<number> {
  const startOfDay = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const allClasses = db.select().from(classes).all();
  let created = 0;

  db.transaction(() => {
    for (const c of allClasses) {
      const existing = db
        .select({ id: attendance.id })
        .from(attendance)
        .where(
          and(
            eq(attendance.classId, c.id),
            gte(attendance.date, startOfDay),
            lt(attendance.date, endOfDay),
          ),
        )
        .get();
      if (existing) continue;

      // Find any active enrollment to ensure the class actually has students
      const anyStudent = db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.classId, c.id), eq(enrollments.status, "active")))
        .get();
      if (!anyStudent) continue;

      db.insert(attendance)
        .values({
          id: crypto.randomUUID(),
          schoolId: c.schoolId,
          classId: c.id,
          date: startOfDay,
          takenBy: null,
          notes: "auto-skeleton (finalize cron)",
        })
        .run();

      db.insert(auditLogs)
        .values({
          id: crypto.randomUUID(),
          actorId: null,
          schoolId: c.schoolId,
          action: "attendance.finalize",
          entityType: "attendance",
          entityId: c.id,
          payload: JSON.stringify({ date: startOfDay.toISOString() }),
        })
        .run();

      created += 1;
    }
  });

  return created;
}