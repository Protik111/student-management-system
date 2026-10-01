import { Bell } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/auth-helpers";
import NotificationsList from "@/components/notifications/NotificationsList";
import { listMyNotifications } from "@/lib/actions/notifications";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  await requireUser();
  const initial = await listMyNotifications(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Every alert and update delivered to your account."
        actions={<Bell className="h-5 w-5 text-text-subtle" aria-hidden />}
      />

      {initial.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="We'll alert you when invoices are issued, grades are published, or submissions arrive."
        />
      ) : (
        <NotificationsList initialItems={initial} />
      )}
    </div>
  );
}