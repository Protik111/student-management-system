import "server-only";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db/prisma";

/**
 * Discriminated-union return shape every server action returns to the client.
 * Avoids thrown errors crossing the server/client boundary; clients pattern-match.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string, fieldErrors?: Record<string, string[]>): ActionResult<T> {
  return { ok: false, error, fieldErrors };
}

/**
 * Generates a 12-character temporary password using a URL-safe alphabet.
 * Sufficient entropy for a single-shot reset where the admin relays it
 * to the user out-of-band; not stored server-side.
 */
export function generateTempPassword(): string {
  // 12 chars from 64-char alphabet = ~72 bits of entropy
  return randomBytes(9)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, 12);
}

/**
 * Writes one audit-log row inside an existing transaction. Caller is
 * expected to have started the transaction via `prisma.$transaction`.
 */
export async function writeAuditLog(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  args: {
    actorId: string | null;
    schoolId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    payload?: unknown;
  },
): Promise<void> {
  await tx.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      actorId: args.actorId,
      schoolId: args.schoolId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      payload: args.payload === undefined ? null : JSON.stringify(args.payload),
    },
  });
}

/**
 * Returns the current academic year in `YYYY-YYYY` form. In Bangladesh and
 * most South-Asian schools the academic year runs Apr–Mar, but we don't try
 * to encode that policy here — the caller may pass `ACADEMIC_YEAR` via env
 * (the seed uses 2025-2026) or we fall back to a calendar-year derivation.
 */
export function getCurrentAcademicYear(now: Date = new Date()): string {
  const fromEnv = process.env.ACADEMIC_YEAR;
  if (fromEnv && /^\d{4}-\d{4}$/.test(fromEnv)) return fromEnv;
  const y = now.getUTCFullYear();
  return `${y}-${y + 1}`;
}