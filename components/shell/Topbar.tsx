"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";

import RoleBadge from "@/components/auth/RoleBadge";
import Button from "@/components/ui/Button";
import { ROLE_LABEL, type Role } from "@/lib/rbac";

interface TopbarProps {
  fullName: string;
  email: string;
  role: Role;
}

export default function Topbar({ fullName, email, role }: TopbarProps) {
  const initials = fullName
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        className="rounded-chip border border-border bg-card p-2 text-text-muted hover:text-text lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="hidden flex-1 lg:block">
        <p className="text-meta text-text-subtle">Signed in as</p>
        <p className="text-default font-medium text-text">{fullName}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <RoleBadge role={role} />

        <div className="hidden text-right sm:block">
          <p className="text-default font-medium leading-tight text-text">{fullName}</p>
          <p className="text-meta text-text-subtle">{email}</p>
        </div>

        <div
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-bg text-default font-semibold text-emerald"
        >
          {initials || "?"}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            signOut({ callbackUrl: "/login?expired=1", redirect: true })
          }
          aria-label={`Sign out (${ROLE_LABEL[role]})`}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}