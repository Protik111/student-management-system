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
import SchoolForm from "@/components/admin/schools/SchoolForm";
import type { SchoolListItem } from "@/lib/actions/schools";
import { toggleSchoolActive } from "@/lib/actions/schools";

interface SchoolsListProps {
  initialSchools: SchoolListItem[];
}

export default function SchoolsList({ initialSchools }: SchoolsListProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<SchoolListItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialSchools;
    return initialSchools.filter((s) =>
      [s.name, s.contactEmail, s.contactPhone, s.address]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [initialSchools, search]);

  const toggle = useConfirmAction<SchoolListItem>({
    title: (s) => (s.isActive ? "Deactivate school?" : "Activate school?"),
    description: (s) =>
      s.isActive
        ? `${s.name} will be hidden from active lists. Users attached to it will be unable to sign in until reactivated.`
        : `${s.name} will be reactivated and visible again.`,
    confirmText: "Continue",
    variant: "danger",
    successTitle: (s) => (s.isActive ? "School deactivated" : "School activated"),
    action: async (s) => {
      const r = await toggleSchoolActive(s.id);
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
        title="Schools"
        description="Manage every school on the platform."
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search schools…" />
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> New school
            </Button>
          </>
        }
      />

      {initialSchools.length === 0 ? (
        <EmptyState
          title="No schools yet"
          description="Create your first school to start adding users and students."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first school
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">School</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-left font-semibold">Users</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-default text-text-muted">
                    No schools match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-text">{s.name}</div>
                      {s.address && (
                        <div className="text-meta text-text-subtle">{s.address}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {s.contactEmail && <div>{s.contactEmail}</div>}
                      {s.contactPhone && <div className="text-meta">{s.contactPhone}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">{s.userCount}</td>
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
                        <Button
                          size="sm"
                          variant={s.isActive ? "ghost" : "secondary"}
                          onClick={() => toggle.confirm(s)}
                        >
                          {s.isActive ? "Deactivate" : "Activate"}
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
        <SchoolForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />
      )}
      {editing && (
        <SchoolForm
          initial={{
            id: editing.id,
            name: editing.name,
            address: editing.address,
            contactEmail: editing.contactEmail,
            contactPhone: editing.contactPhone,
            logoUrl: null,
            isActive: editing.isActive,
          }}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}