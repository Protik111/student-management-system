"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCheck, Inbox } from "lucide-react";
import { format } from "date-fns";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/cn";
import {
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/actions/notifications";

interface NotificationsListProps {
  initialItems: NotificationItem[];
}

export default function NotificationsList({ initialItems }: NotificationsListProps) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const unread = items.filter((i) => !i.readAt).length;

  async function handleMarkAll() {
    setLoading(true);
    const res = await markAllNotificationsRead();
    setLoading(false);
    if (res.ok) {
      setItems((curr) =>
        curr.map((i) => ({ ...i, readAt: i.readAt ?? new Date() })),
      );
    } else {
      toast.error({ title: "Couldn't mark all as read", description: res.error });
    }
  }

  async function handleClick(id: string) {
    setItems((curr) =>
      curr.map((i) => (i.id === id && !i.readAt ? { ...i, readAt: new Date() } : i)),
    );
    void markNotificationsRead([id]);
  }

  return (
    <Card className="p-0 overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-default font-medium text-text">
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </p>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            loading={loading}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-text-subtle">
          <Inbox className="h-10 w-10" aria-hidden />
          <p className="text-default">No notifications yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationRow item={n} onClick={() => handleClick(n.id)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function NotificationRow({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: () => void;
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-1.5 h-2 w-2 flex-none rounded-full",
          item.readAt ? "bg-border" : "bg-emerald",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-default font-medium text-text">{item.title}</p>
        <p className="mt-0.5 text-default text-text-muted">{item.body}</p>
        <p className="mt-1.5 text-meta text-text-subtle">
          {format(item.createdAt, "PPP · p")}
        </p>
      </div>
    </div>
  );

  const cls = cn(
    "block px-4 py-3.5 transition-colors hover:bg-base",
    !item.readAt && "bg-emerald-bg/30",
  );

  if (item.link) {
    return (
      <Link href={item.link} onClick={onClick} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn(cls, "w-full text-left")}>
      {inner}
    </button>
  );
}