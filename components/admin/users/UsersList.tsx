"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import AppSelect from "@/components/ui/AppSelect";
import Input from "@/components/ui/Input";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmAction } from "@/hooks/useConfirmAction";

import SearchInput from "@/components/admin/shared/SearchInput";
import RoleBadge from "@/components/admin/shared/RoleBadge";
import UserForm from "@/components/admin/users/UserForm";
import { ROLE_LABEL, type Role } from "@/lib/rbac";
import {
  type UserListItem,
  type UserFormOptions,
  toggleUserActive,
  resetUserPassword,
} from "@/lib/actions/users";

interface UsersListProps {
  variant: "super_admin" | "school_admin";
  initialUsers: UserListItem[];
  options: UserFormOptions;
  currentUserId: string;
}

export default function UsersList({
  variant,
  initialUsers,
  options,
  currentUserId,
}: UsersListProps) {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState<{
    user: UserListItem;
    password: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialUsers.filter((u) => {
      if (roleFilter !== "all" && u.primaryRole !== roleFilter) return false;
      if (!q) return true;
      return [u.fullName, u.email, u.schoolName, u.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [initialUsers, search, roleFilter]);

  const toggle = useConfirmAction<UserListItem>({
    title: (u) => (u.isActive ? "Deactivate user?" : "Activate user?"),
    description: (u) =>
      u.isActive
        ? `${u.fullName} will be unable to sign in until reactivated.`
        : `${u.fullName} will be able to sign in again.`,
    confirmText: "Continue",
    variant: "danger",
    successTitle: (u) => (u.isActive ? "User deactivated" : "User activated"),
    action: async (u) => {
      const r = await toggleUserActive(u.id);
      if (!r.ok) throw new Error(r.error);
    },
    onSuccess: () => router.refresh(),
  });

  const reset = useConfirmAction<UserListItem>({
    title: (u) => `Reset ${u.fullName}'s password?`,
    description:
      "A temporary password will be generated. The user will be required to use it on their next sign-in.",
    confirmText: "Reset password",
    variant: "primary",
    successTitle: "Password reset",
    action: async (u) => {
      const r = await resetUserPassword(u.id);
      if (!r.ok) throw new Error(r.error);
      setTempPassword({ user: u, password: r.data.tempPassword });
    },
    onSuccess: () => router.refresh(),
  });

  function refresh() {
    router.refresh();
  }

  const filterRoleOptions = [
    { value: "all", label: "All roles" },
    ...options.assignableRoles.map((r) => ({
      value: r,
      label: ROLE_LABEL[r],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={
          variant === "super_admin"
            ? "Everyone on the platform — across every school."
            : "Everyone in your school."
        }
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search users…" />
            {variant === "super_admin" && (
              <AppSelect
                options={filterRoleOptions}
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as Role | "all")}
                className="w-48"
                placeholder="Filter by role"
              />
            )}
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> New user
            </Button>
          </>
        }
      />

      {initialUsers.length === 0 ? (
        <EmptyState
          title="No users yet"
          description={
            variant === "super_admin"
              ? "Create your first user — a school admin, teacher, or student."
              : "Add teachers and students to your school."
          }
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first user
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">User</th>
                {variant === "super_admin" && (
                  <th className="px-4 py-3 text-left font-semibold">School</th>
                )}
                <th className="px-4 py-3 text-left font-semibold">Roles</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={variant === "super_admin" ? 5 : 4}
                    className="py-8 text-center text-default text-text-muted"
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isSelf = u.id === currentUserId;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text">{u.fullName}</div>
                        <div className="text-meta text-text-subtle">{u.email}</div>
                        {u.phone && (
                          <div className="text-meta text-text-subtle">{u.phone}</div>
                        )}
                      </td>
                      {variant === "super_admin" && (
                        <td className="px-4 py-3.5 text-text-muted">
                          {u.schoolName ?? (
                            <span className="text-meta text-text-subtle">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          <RoleBadge role={u.primaryRole} />
                          {u.roles
                            .filter((r) => r !== u.primaryRole)
                            .map((r) => (
                              <RoleBadge key={r} role={r} />
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={u.isActive ? "success" : "neutral"}>
                          {u.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                            Edit
                          </Button>
                          <span title="Reset password">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => reset.confirm(u)}
                            >
                              <KeyRound className="h-4 w-4" aria-hidden />
                            </Button>
                          </span>
                          <span title={isSelf ? "You can't deactivate yourself" : undefined}>
                            <Button
                              size="sm"
                              variant={u.isActive ? "ghost" : "secondary"}
                              onClick={() => toggle.confirm(u)}
                              disabled={isSelf}
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog {...toggle.dialogProps} />
      <ConfirmDialog {...reset.dialogProps} />

      {tempPassword && (
        <Modal
          open
          onClose={() => setTempPassword(null)}
          title="Password reset"
        >
          <p className="mb-4 text-default text-text-muted">
            A temporary password has been generated for{" "}
            <strong className="text-text">{tempPassword.user.fullName}</strong>.
            Share it securely — it will not be shown again.
          </p>
          <div className="rounded-chip border border-border bg-base p-4">
            <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">
              Temporary password
            </p>
            <p className="mt-1 select-all break-all font-mono text-default text-text">
              {tempPassword.password}
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(tempPassword.password);
                  toast.success({ title: "Copied to clipboard" });
                }
              }}
            >
              Copy
            </Button>
            <Button onClick={() => setTempPassword(null)}>Done</Button>
          </div>
        </Modal>
      )}

      {creating && (
        <UserForm
          variant={variant}
          options={options}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}
      {editing && (
        <UserForm
          variant={variant}
          options={options}
          initial={{
            id: editing.id,
            email: editing.email,
            fullName: editing.fullName,
            phone: editing.phone,
            avatarUrl: editing.avatarUrl,
            isActive: editing.isActive,
            primaryRole: editing.primaryRole,
            roles: editing.roles,
            schoolId: editing.schoolId,
          }}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}