import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Role } from "@/lib/rbac";

interface DashboardShellProps {
  role: Role;
  fullName: string;
  email: string;
  children: ReactNode;
}

/**
 * Two-column dashboard layout: persistent sidebar on desktop, top bar everywhere.
 * Server component — pulls session data from props, no client-side fetch.
 */
export default function DashboardShell({
  role,
  fullName,
  email,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar fullName={fullName} email={email} role={role} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}