"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmAction } from "@/hooks/useConfirmAction";

import SearchInput from "@/components/admin/shared/SearchInput";
import StudentNameCell from "@/components/admin/shared/StudentNameCell";
import StudentForm from "@/components/admin/students/StudentForm";
import {
  type StudentListItem,
  type StudentFormOptions,
  toggleStudentActive,
} from "@/lib/actions/students";

interface StudentsListProps {
  variant: "ADMIN";
  initialStudents: StudentListItem[];
  options: StudentFormOptions;
  currentUserId: string;
}

export default function StudentsList({
  variant,
  initialStudents,
  options,
  currentUserId,
}: StudentsListProps) {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StudentListItem | null>(null);
  const [creating, setCreating] = useState(false);

  const hrefBase: "/admin" = "/admin";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialStudents.filter((s) => {
      if (!q) return true;
      return [
        s.fullName,
        s.email,
        s.admissionNo,
        s.schoolName,
        s.guardianName,
        s.currentClassName,
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [initialStudents, search]);

  const toggle = useConfirmAction<StudentListItem>({
    title: (s) => (s.isActive ? "Deactivate student?" : "Activate student?"),
    description: (s) =>
      s.isActive
        ? `${s.fullName} will be unable to sign in until reactivated.`
        : `${s.fullName} will be able to sign in again.`,
    confirmText: "Continue",
    variant: "danger",
    successTitle: (s) => (s.isActive ? "Student deactivated" : "Student activated"),
    action: async (s) => {
      const r = await toggleStudentActive(s.id);
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
        title="Students"
        description={
          variant === "ADMIN"
            ? "Every student on the platform — across every school."
            : "Every student enrolled in your school."
        }
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, admission #, class…"
            />
            <Button
              variant="outline"
              href={`${hrefBase}/students/import`}
            >
              <Upload className="h-4 w-4" aria-hidden /> Import CSV
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> New student
            </Button>
          </>
        }
      />

      {initialStudents.length === 0 ? (
        <EmptyState
          title="No students yet"
          description={
            variant === "ADMIN"
              ? "Add a school first, then admit a student."
              : "Admit your first student to your school."
          }
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Admit your first student
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Class</th>
                {variant === "ADMIN" && (
                  <th className="px-4 py-3 text-left font-semibold">School</th>
                )}
                <th className="px-4 py-3 text-left font-semibold">Guardian</th>
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
                    No students match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const isSelf = s.userId === currentUserId;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <StudentNameCell
                          admissionNo={s.admissionNo}
                          fullName={s.fullName}
                          gender={s.gender}
                          email={s.email}
                          enrollmentsHref={s.id}
                          hrefBase={hrefBase}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-text-muted">
                        {s.currentClassName ? (
                          <span className="font-medium text-text">
                            {s.currentClassName}
                          </span>
                        ) : (
                          <span className="text-meta text-text-subtle">—</span>
                        )}
                      </td>
                      {variant === "ADMIN" && (
                        <td className="px-4 py-3.5 text-text-muted">
                          {s.schoolName}
                        </td>
                      )}
                      <td className="px-4 py-3.5">
                        {s.guardianName ? (
                          <div>
                            <div className="text-text">{s.guardianName}</div>
                            {s.guardianPhone && (
                              <div className="text-meta text-text-subtle">
                                {s.guardianPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-meta text-text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={s.isActive ? "success" : "neutral"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                            Edit
                          </Button>
                          <span title={isSelf ? "You can't deactivate yourself" : undefined}>
                            <Button
                              size="sm"
                              variant={s.isActive ? "ghost" : "secondary"}
                              onClick={() => toggle.confirm(s)}
                              disabled={isSelf}
                            >
                              {s.isActive ? "Deactivate" : "Activate"}
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
        <StudentForm
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
        <StudentForm
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
            admissionNo: editing.admissionNo,
            dateOfBirth: editing.dateOfBirth,
            gender: editing.gender,
            currentClassId: editing.currentClassId,
            guardianName: editing.guardianName,
            guardianPhone: editing.guardianPhone,
            address: null,
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