import type { ReactNode } from "react";

import DashboardShell from "@/components/shell/DashboardShell";
import { requireUser } from "@/lib/auth-helpers";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <DashboardShell
      role={user.role}
      fullName={user.fullName}
      email={user.email}
    >
      {children}
    </DashboardShell>
  );
}