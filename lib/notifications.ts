import "server-only";
import type { Prisma, NotificationType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/**
 * In-app notification primitives. Triggered inside the same transaction as
 * the event they describe (e.g. an invoice is created → recipient student
 * gets notified, all in one tx). The bell icon polls `unreadCountForUser`
 * and `listForUser` reads the full list.
 *
 * Out of scope per the plan: email / SMS push. The "notification agent"
 * described in the assessment spec is realised as an internal trigger that
 * writes to this table; delivery is in-app only.
 */
export type NotifyArgs = {
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  payload?: Record<string, unknown>;
};

/** Write a single notification row inside the given transaction. */
export async function notify(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  args: NotifyArgs,
): Promise<void> {
  await tx.notification.create({
    data: {
      id: crypto.randomUUID(),
      recipientUserId: args.recipientUserId,
      type: args.type,
      title: args.title,
      body: args.body,
      link: args.link ?? null,
      payload: args.payload ? JSON.stringify(args.payload) : null,
    },
  });
}

/** Bulk-notify a list of users (skipping falsy ids). */
export async function notifyMany(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  recipientUserIds: ReadonlyArray<string | null | undefined>,
  template: (uid: string) => NotifyArgs,
): Promise<void> {
  const ids = Array.from(new Set(recipientUserIds.filter((x): x is string => Boolean(x))));
  if (ids.length === 0) return;
  await tx.notification.createMany({
    data: ids.map((uid) => {
      const args = template(uid);
      return {
        id: crypto.randomUUID(),
        recipientUserId: args.recipientUserId,
        type: args.type,
        title: args.title,
        body: args.body,
        link: args.link ?? null,
        payload: args.payload ? JSON.stringify(args.payload) : null,
      };
    }),
  });
}

/** Read APIs (used by client components / Server Components). */
export async function unreadCountForUser(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientUserId: userId, readAt: null },
  });
}

export async function listForUser(
  userId: string,
  opts: { limit?: number; cursor?: string } = {},
): Promise<
  Array<{
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    link: string | null;
    readAt: Date | null;
    createdAt: Date;
  }>
> {
  const rows = await prisma.notification.findMany({
    where: { recipientUserId: userId },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 25,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link,
    readAt: r.readAt,
    createdAt: r.createdAt,
  }));
}

export async function markRead(userId: string, ids: ReadonlyArray<string>): Promise<void> {
  if (ids.length === 0) return;
  await prisma.notification.updateMany({
    where: { recipientUserId: userId, id: { in: [...ids] }, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string): Promise<number> {
  const res = await prisma.notification.updateMany({
    where: { recipientUserId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return res.count;
}

/** Type-only re-export so consumers don't need to import from prisma. */
export type { NotificationType };
export type PrismaTransaction = Prisma.TransactionClient;
