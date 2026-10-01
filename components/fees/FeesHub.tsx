"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Wallet, FileText, Building2, Check, X } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/contexts/ToastContext";
import {
  listFeeStructures,
  toggleFeeStructureActive,
  type FeeStructureItem,
} from "@/lib/actions/fees";
import { formatCents } from "@/lib/fees-utils";
import FeeStructureForm from "@/components/fees/FeeStructureForm";

interface FeesHubProps {
  initialStructures: FeeStructureItem[];
  classOptions: { id: string; label: string }[];
}

export default function FeesHub({ initialStructures, classOptions }: FeesHubProps) {
  const router = useRouter();
  const toast = useToast();
  const [structures, setStructures] = useState(initialStructures);
  const [showForm, setShowForm] = useState(false);

  async function toggle(id: string, isActive: boolean) {
    const res = await toggleFeeStructureActive(id, isActive);
    if (!res.ok) {
      toast.error({ title: "Couldn't update", description: res.error });
      return;
    }
    setStructures((curr) => curr.map((s) => (s.id === id ? { ...s, isActive } : s)));
    toast.success({ title: isActive ? "Fee structure reactivated" : "Fee structure deactivated" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees & Payments"
        description="Define fee structures, issue invoices, and record payments."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card hoverable>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-chip bg-emerald-bg text-emerald">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-default font-semibold text-text">Invoices</p>
              <p className="mt-0.5 text-meta text-text-subtle">
                Issue invoices to students and record payments against them.
              </p>
            </div>
            <Button href="/admin/fees/invoices" size="sm">
              Open
            </Button>
          </div>
        </Card>

        <Card hoverable>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-chip bg-emerald-bg text-emerald">
              <Wallet className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-default font-semibold text-text">Fee structures</p>
              <p className="mt-0.5 text-meta text-text-subtle">
                Define recurring fee templates — used as a basis for invoices.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4" aria-hidden /> New
            </Button>
          </div>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-subheading font-semibold text-text">Fee structures</h2>
          <span className="text-meta text-text-subtle">{structures.length} total</span>
        </div>

        {structures.length === 0 ? (
          <EmptyState
            title="No fee structures yet"
            description="Create one to define what your school charges."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" aria-hidden /> New fee structure
              </Button>
            }
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-default">
              <thead>
                <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Frequency</th>
                  <th className="px-4 py-3 text-left font-semibold">Class</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-base">
                    <td className="px-4 py-3 font-medium text-text">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-meta text-text-muted">
                      {formatCents(s.amountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{s.frequency}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {s.className ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-text-subtle" aria-hidden />
                          {s.className}
                        </span>
                      ) : (
                        <span className="text-meta text-text-subtle">All</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggle(s.id, !s.isActive)}
                        aria-label={s.isActive ? "Deactivate" : "Activate"}
                      >
                        {s.isActive ? (
                          <>
                            <Check className="h-4 w-4 text-emerald" /> Active
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-text-subtle" /> Off
                          </>
                        )}
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-meta text-text-subtle">
                      {format(s.createdAt, "PP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      {showForm && (
        <FeeStructureForm
          classOptions={classOptions}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}