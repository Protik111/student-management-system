"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROLE_NAV, type Role } from "@/lib/rbac";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = ROLE_NAV[role];

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-emerald">
          <GraduationCap className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-default font-semibold tracking-tight text-text">SMS</p>
          <p className="text-meta text-text-subtle">School platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-chip px-3 py-2 text-default transition-colors",
                    active
                      ? "bg-emerald-bg font-semibold text-emerald"
                      : "text-text-muted hover:bg-base hover:text-text",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-emerald" : "bg-border-strong",
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-6 py-4 text-meta text-text-subtle">
        v0.1.0 · Module 1
      </div>
    </aside>
  );
}