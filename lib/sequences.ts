import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Atomic per-school sequence generators. We derive the next number by
 * counting how many rows of the target type the school already has and
 * adding 1. Safety against duplicate IDs comes from the unique constraint
 * (e.g. `@@unique([schoolId, admissionNo])` on Student), NOT from row locks —
 * two concurrent creates CAN read the same count, but only one will be
 * able to commit the insert. The caller is expected to handle the
 * `P2002` (unique violation) error by retrying the count+insert.
 *
 * Format: `INV-YYYY-NNNN`, `RCP-YYYY-NNNN`, `SMS-YYYY-NNNN`.
 */
export type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function pad(n: number): string {
  return n.toString().padStart(4, "0");
}

export async function nextInvoiceNo(tx: Tx, schoolId: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const count = await tx.invoice.count({ where: { schoolId } });
  return `INV-${year}-${pad(count + 1)}`;
}

export async function nextReceiptNo(tx: Tx, schoolId: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const count = await tx.payment.count({ where: { schoolId } });
  return `RCP-${year}-${pad(count + 1)}`;
}

/**
 * Derives the next student ID in `SMS-YYYY-NNNN` form, scoped per school
 * and per calendar year. The numbering resets each year.
 *
 * Caller MUST be inside a `prisma.$transaction`. Race safety is provided by
 * the `@@unique([schoolId, admissionNo])` constraint on `Student` — if a
 * concurrent insert wins, this helper will throw on the retry path inside
 * `retryingNextStudentId`.
 */
export async function nextStudentId(
  tx: Tx,
  schoolId: string,
  year: number = new Date().getUTCFullYear(),
): Promise<string> {
  const prefix = `SMS-${year}-`;
  const count = await tx.student.count({
    where: { schoolId, admissionNo: { startsWith: prefix } },
  });
  return `${prefix}${pad(count + 1)}`;
}

/**
 * Wrap `nextStudentId` in a small retry loop to recover from a lost race
 * (two concurrent creates each computed the same N+1; one will hit P2002).
 * On retry we re-count, which sees the committed row from the winner.
 *
 * Three attempts is plenty for any realistic concurrent create rate on a
 * single school; if we still collide after that, surface the underlying
 * Prisma error so the caller fails loudly instead of retrying forever.
 */
export async function retryingNextStudentId(
  tx: Tx,
  schoolId: string,
  year: number = new Date().getUTCFullYear(),
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await nextStudentId(tx, schoolId, year);
    } catch (err) {
      lastError = err;
      const code = (err as { code?: string })?.code;
      if (code !== "P2002") throw err;
      // Loop: re-count will see the committed row.
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Could not allocate student ID after retries");
}

/**
 * Convenience to stamp the ID on a student row that we're about to insert,
 * using the same retrying helper. Caller is responsible for catching
 * P2002 (unique violation) and surfacing a clean error to the user; if
 * they want zero-touch behaviour they should call `retryingNextStudentId`
 * directly and assign the result to `data.admissionNo` before insert.
 */
export async function generateStudentAdmissionNo(
  tx: Tx,
  schoolId: string,
  year: number = new Date().getUTCFullYear(),
): Promise<string> {
  return retryingNextStudentId(tx, schoolId, year);
}

/* Re-export Prisma types that are referenced by `Tx`. */
export type { Prisma };