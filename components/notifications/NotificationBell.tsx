"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";

import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/cn";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/actions/notifications";

/**
 * Bell icon with a dropdown panel showing the 8 most recent notifications.
 * Polls every 30s to keep the unread badge fresh.
 *
 * The bell is rendered client-side; it doesn't need an `initialCount` because
 * we just fetch on mount and poll afterwards.
 */
export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const unread = items.filter((i) => !i.readAt).length;

  async function refresh() {
    try {
      const data = await listMyNotifications(8);
      setItems(data);
    } catch {
      // Silent; polling errors shouldn't break the topbar.
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleMarkAll() {
    setLoading(true);
    const res = await markAllNotificationsRead();
    setLoading(false);
    if (res.ok) {
      setItems((curr) => curr.map((i) => ({ ...i, readAt: i.readAt ?? new Date() })));
    } else {
      toast.error({ title: "Couldn't mark as read", description: res.error });
    }
  }

  async function handleClick(id: string, link: string | null) {
    // Optimistically mark this one read.
    setItems((curr) =>
      curr.map((i) => (i.id === id && !i.readAt ? { ...i, readAt: new Date() } : i)),
    );
    void markNotificationsRead([id]);
    if (link) setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-text-muted hover:text-text"
        aria-label={`Notifications (${unread} unread)`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold leading-none text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-96 max-w-[90vw] rounded-card border border-border bg-card shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-default font-semibold text-text">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={loading}
                className="flex items-center gap-1 text-meta font-medium text-emerald hover:text-emerald-light disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </header>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-meta text-text-subtle">
                You're all caught up.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((n) => {
                  const inner = (
                    <>
                      <span
                        className={cn(
                          "mt-1 h-2 w-2 flex-none rounded-full",
                          n.readAt ? "bg-transparent" : "bg-emerald",
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-default font-medium text-text">
                          {n.title}
                        </p>
                        <p className="line-clamp-2 text-meta text-text-muted">
                          {n.body}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-text-subtle">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                      {!n.readAt && (
                        <Check
                          className="h-3.5 w-3.5 flex-none text-emerald opacity-0 group-hover:opacity-100"
                          aria-hidden
                        />
                      )}
                    </>
                  );

                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => handleClick(n.id, n.link)}
                          className="group flex items-start gap-3 px-4 py-3 hover:bg-base"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClick(n.id, null)}
                          className="group flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-base"
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-border px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-meta font-medium text-emerald hover:text-emerald-light"
            >
              View all notifications
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}

function formatRelative(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}
