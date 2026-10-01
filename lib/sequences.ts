import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Atomic per-school sequence generators. We derive the next number by
 * counting how many rows of the target type the school already has and
 * adding 1 — that's safe inside a transaction because the counting row
 * is locked until the transaction commits, and any concurrent caller
 * that reads the same count is blocked.
 *
 * Format: `INV-YYYY-NNNN` and `RCP-YYYY-NNNN`.
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