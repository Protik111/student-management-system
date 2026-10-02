"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useConfirmAction } from "@/hooks/useConfirmAction";

import SearchInput from "@/components/admin/shared/SearchInput";
import ProgrammeForm from "@/components/admin/programmes/ProgrammeForm";
import type { ProgrammeListItem } from "@/lib/actions/programmes";
import { toggleProgrammeActive } from "@/lib/actions/programmes";

interface ProgrammesListProps {
  initialProgrammes: ProgrammeListItem[];
}

export default function ProgrammesList({ initialProgrammes }: ProgrammesListProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProgrammeListItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialProgrammes;
    return initialProgrammes.filter((p) =>
      [p.name, p.code, p.schoolName]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [initialProgrammes, search]);

  const toggle = useConfirmAction<ProgrammeListItem>({
    title: (p) => (p.isActive ? "Deactivate programme?" : "Activate programme?"),
    description: (p) =>
      p.isActive
        ? `${p.name} (${p.code}) will be hidden from pickers. Students on it keep their record but the programme won't accept new students.`
        : `${p.name} (${p.code}) will be reactivated and reappear in pickers.`,
    confirmText: "Continue",
    variant: "danger",
    successTitle: (p) => (p.isActive ? "Programme deactivated" : "Programme activated"),
    action: async (p) => {
      const r = await toggleProgrammeActive(p.id);
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
        title="Programmes"
        description="Degrees, tracks and qualifications. Students belong to one programme; fees are attached to programmes."
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search programmes…"
            />
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> New programme
            </Button>
          </>
        }
      />

      {initialProgrammes.length === 0 ? (
        <EmptyState
          title="No programmes yet"
          description="Create your first programme to start grouping students and attaching fees."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first programme
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Programme</th>
                <th className="px-4 py-3 text-left font-semibold">School</th>
                <th className="px-4 py-3 text-left font-semibold">Duration</th>
                <th className="px-4 py-3 text-left font-semibold">Students</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-default text-text-muted">
                    No programmes match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-text">{p.name}</div>
                      <div className="text-meta text-text-subtle">
                        Code: <span className="font-mono">{p.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">{p.schoolName}</td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {p.durationYears} {p.durationYears === 1 ? "year" : "years"}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">{p.studentCount}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={p.isActive ? "success" : "neutral"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={p.isActive ? "ghost" : "secondary"}
                          onClick={() => toggle.confirm(p)}
                        >
                          {p.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog {...toggle.dialogProps} />

      {creating && (
        <ProgrammeForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}
      {editing && (
        <ProgrammeForm
          initial={{
            id: editing.id,
            name: editing.name,
            code: editing.code,
            durationYears: editing.durationYears,
            isActive: editing.isActive,
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