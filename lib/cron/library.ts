import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/**
 * Mark any book issue whose `dueDate` is in the past and whose status is
 * still `issued` as `overdue`. Idempotent — re-running is safe.
 *
 * Returns the number of issues that transitioned to overdue.
 */
export async function markOverdueBooks(now: Date = new Date()): Promise<number> {
  const candidates = await prisma.bookIssue.findMany({
    where: {
      status: "issued",
      dueDate: { lt: now },
    },
    select: { id: true, bookId: true },
  });

  if (candidates.length === 0) return 0;

  const candidateIds = candidates.map((c) => c.id);
  const touchedBookIds = Array.from(new Set(candidates.map((c) => c.bookId)));

  // Single transaction: flip status + write audit entries.
  await prisma.$transaction(async (tx) => {
    await tx.bookIssue.updateMany({
      where: { id: { in: candidateIds } },
      data: { status: "overdue" },
    });

    await tx.auditLog.createMany({
      data: candidates.map((c) => ({
        id: crypto.randomUUID(),
        actorId: null,
        schoolId: null,
        action: "library.mark_overdue",
        entityType: "book_issue",
        entityId: c.id,
        payload: JSON.stringify({ previousStatus: "issued", newStatus: "overdue" }),
      })),
    });
  });

  // Nudge the parent books' updatedAt timestamp (informational — the real
  // inventory is recomputed lazily by application code).
  try {
    await prisma.book.updateMany({
      where: { id: { in: touchedBookIds } },
      data: { updatedAt: new Date() },
    });
  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) throw err;
    // Non-fatal; audit log entry already captures the transition.
  }

  return candidates.length;
}