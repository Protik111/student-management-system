import { and, eq, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditLogs, bookIssues, books } from "@/lib/db/schema";

/**
 * Mark any book issue whose `dueDate` is in the past and whose status is
 * still `issued` as `overdue`. Idempotent — re-running is safe.
 *
 * Returns the number of issues that transitioned to overdue.
 */
export async function markOverdueBooks(now: Date = new Date()): Promise<number> {
  const dueCutoff = now;

  const candidates = db
    .select({ id: bookIssues.id, bookId: bookIssues.bookId, status: bookIssues.status })
    .from(bookIssues)
    .where(and(eq(bookIssues.status, "issued"), lt(bookIssues.dueDate, dueCutoff)))
    .all();

  if (candidates.length === 0) return 0;

  // Single transaction: flip status + write audit entry.
  db.transaction(() => {
    for (const c of candidates) {
      db.update(bookIssues).set({ status: "overdue" }).where(eq(bookIssues.id, c.id)).run();
      db.insert(auditLogs)
        .values({
          id: crypto.randomUUID(),
          actorId: null,
          schoolId: null,
          action: "library.mark_overdue",
          entityType: "book_issue",
          entityId: c.id,
          payload: JSON.stringify({ previousStatus: "issued", newStatus: "overdue" }),
        })
        .run();
    }
  });

  // Also nudge the parent book's availableCopies column (informational)
  db.update(books)
    .set({ updatedAt: new Date() })
    .where(
      sql`${books.id} IN (${sql.join(
        candidates.map((c) => sql`${c.bookId}`),
        sql`, `,
      )})`,
    )
    .run();

  return candidates.length;
}