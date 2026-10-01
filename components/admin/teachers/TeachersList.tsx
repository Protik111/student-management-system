"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useConfirmAction } from "@/hooks/useConfirmAction";

import SearchInput from "@/components/admin/shared/SearchInput";
import TeacherForm from "@/components/admin/teachers/TeacherForm";
import {
  type TeacherListItem,
  type TeacherFormOptions,
  toggleTeacherActive,
} from "@/lib/actions/teachers";

interface TeachersListProps {
  variant: "ADMIN";
  initialTeachers: TeacherListItem[];
  options: TeacherFormOptions;
  currentUserId: string;
}

export default function TeachersList({
  variant,
  initialTeachers,
  options,
  currentUserId,
}: TeachersListProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TeacherListItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialTeachers.filter((t) => {
      if (!q) return true;
      return [
        t.fullName,
        t.email,
        t.employeeId,
        t.schoolName,
        t.qualification,
        t.specialization,
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [initialTeachers, search]);

  const toggle = useConfirmAction<TeacherListItem>({
    title: (t) => (t.isActive ? "Deactivate teacher?" : "Activate teacher?"),
    description: (t) =>
      t.isActive
        ? `${t.fullName} will be unable to sign in until reactivated.`
        : `${t.fullName} will be able to sign in again.`,
    confirmText: "Continue",
    variant: "danger",
    successTitle: (t) => (t.isActive ? "Teacher deactivated" : "Teacher activated"),
    action: async (t) => {
      const r = await toggleTeacherActive(t.id);
      if (!r.ok) throw new Error(r.error);
    },
    onSuccess: () => router.refresh(),
  });

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description={
          variant === "ADMIN"
            ? "Every teacher on the platform — across every school."
            : "Every teacher in your school."
        }
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, employee ID, qualification…"
            />
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> New teacher
            </Button>
          </>
        }
      />

      {initialTeachers.length === 0 ? (
        <EmptyState
          title="No teachers yet"
          description={
            variant === "ADMIN"
              ? "Add a school first, then onboard a teacher."
              : "Onboard your first teacher to your school."
          }
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first teacher
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Teacher</th>
                <th className="px-4 py-3 text-left font-semibold">Specialization</th>
                {variant === "ADMIN" && (
                  <th className="px-4 py-3 text-left font-semibold">School</th>
                )}
                <th className="px-4 py-3 text-left font-semibold">Hire date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={variant === "ADMIN" ? 6 : 5}
                    className="py-8 text-center text-default text-text-muted"
                  >
                    No teachers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isSelf = t.userId === currentUserId;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text">{t.fullName}</div>
                        <div className="text-meta text-text-subtle">
                          <span className="font-mono">{t.employeeId}</span>
                          <span className="mx-2">·</span>
                          {t.email}
                        </div>
                        {t.qualification && (
                          <div className="text-meta text-text-subtle">
                            {t.qualification}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {t.specialization || (
                          <span className="text-meta text-text-subtle">—</span>
                        )}
                      </td>
                      {variant === "ADMIN" && (
                        <td className="px-4 py-3.5 text-text-muted">
                          {t.schoolName}
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-text-muted">
                        {t.hireDate ? format(t.hireDate, "PP") : (
                          <span className="text-meta text-text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={t.isActive ? "success" : "neutral"}>
                          {t.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
                            Edit
                          </Button>
                          <span title={isSelf ? "You can't deactivate yourself" : undefined}>
                            <Button
                              size="sm"
                              variant={t.isActive ? "ghost" : "secondary"}
                              onClick={() => toggle.confirm(t)}
                              disabled={isSelf}
                            >
                              {t.isActive ? "Deactivate" : "Activate"}
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

      {creating && (
        <TeacherForm
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
        <TeacherForm
          variant={variant}
          options={options}
          initial={{
            id: editing.id,
            email: editing.email,
            fullName: editing.fullName,
            phone: editing.phone,
            avatarUrl: editing.avatarUrl,
            isActive: editing.isActive,
            schoolId: editing.schoolId,
            employeeId: editing.employeeId,
            qualification: editing.qualification,
            specialization: editing.specialization,
            salary: editing.salary,
            hireDate: editing.hireDate,
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