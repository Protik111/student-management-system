"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import {
  markAllRead,
  markRead,
  type NotifyArgs,
  type NotificationType,
} from "@/lib/notifications";
import {
  ok,
  fail,
  type ActionResult,
} from "@/lib/actions/_helpers";

/* ─── Read APIs (used by Server Components) ─────────────────────────────── */

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export async function listMyNotifications(
  limit = 25,
): Promise<NotificationItem[]> {
  const user = await requireUser();
  const rows = await prisma.notification.findMany({
    where: { recipientUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
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

export async function myUnreadCount(): Promise<number> {
  const user = await requireUser();
  return prisma.notification.count({
    where: { recipientUserId: user.id, readAt: null },
  });
}

/* ─── Mutations (called from client components) ──────────────────────────── */

export async function markNotificationsRead(
  ids: ReadonlyArray<string>,
): Promise<ActionResult<{ updated: number }>> {
  try {
    const user = await requireUser();
    if (ids.length === 0) return ok({ updated: 0 });
    const res = await prisma.notification.updateMany({
      where: { recipientUserId: user.id, id: { in: [...ids] }, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/", "layout");
    return ok({ updated: res.count });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't mark notifications as read");
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireUser();
    const count = await markAllRead(user.id);
    revalidatePath("/", "layout");
    return ok({ count });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't mark all as read");
  }
}