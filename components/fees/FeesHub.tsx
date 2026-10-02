"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Wallet, Building2, Check, X, AlertTriangle } from "lucide-react";

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

export interface OverdueRow {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  programmeName: string | null;
  amountCents: number;
  paidCents: number;
  balanceCents: number;
  status: string;
  dueDate: Date;
}

interface FeesHubProps {
  initialStructures: FeeStructureItem[];
  classOptions: { id: string; label: string }[];
  programmeOptions: { id: string; label: string }[];
  initialOverdue: Array<{
    id: string;
    invoiceNo: string;
    studentId: string;
    studentName: string;
    admissionNo: string;
    programmeName: string | null;
    amountLabel: string;
    balanceLabel: string;
    status: string;
    dueLabel: string;
  }>;
}

export default function FeesHub({
  initialStructures,
  classOptions,
  programmeOptions,
  initialOverdue,
}: FeesHubProps) {
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
        description="Define fee structures, issue invoices, and record payments. Fees attach to programmes — every student belongs to one programme."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card hoverable>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-chip bg-emerald-bg text-emerald">
              <Wallet className="h-5 w-5" aria-hidden />
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
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-default font-semibold text-text">Fee structures</p>
              <p className="mt-0.5 text-meta text-text-subtle">
                Define recurring fee templates — attached to a programme (and optionally a class).
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4" aria-hidden /> New
            </Button>
          </div>
        </Card>
      </div>

      {/* Overdue widget — top 10 outstanding invoices across the school. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-subheading font-semibold text-text">Overdue invoices</h2>
          <span className="text-meta text-text-subtle">
            {initialOverdue.length} {initialOverdue.length === 1 ? "invoice" : "invoices"}
          </span>
        </div>

        {initialOverdue.length === 0 ? (
          <Card className="flex items-center gap-3 border-emerald-success/40 bg-emerald-bg/40">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-white">
              <Check className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-default font-semibold text-text">No overdue invoices</p>
              <p className="text-meta text-text-subtle">
                Every invoice is either paid, partially paid and on time, or not yet due.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-default">
              <thead>
                <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                  <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Programme</th>
                  <th className="px-4 py-3 text-left font-semibold">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold">Due</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialOverdue.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-base">
                    <td className="px-4 py-3 font-mono text-meta text-text">{r.invoiceNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{r.studentName}</div>
                      <div className="text-meta text-text-subtle">{r.admissionNo}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {r.programmeName ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-text-subtle" aria-hidden />
                          {r.programmeName}
                        </span>
                      ) : (
                        <span className="text-meta text-text-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-meta text-danger">
                      {r.balanceLabel}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-danger" aria-hidden />
                        {format(new Date(r.dueLabel), "PP")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        href={`/admin/fees/invoices/${r.id}`}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

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
                  <th className="px-4 py-3 text-left font-semibold">Programme</th>
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
                      {s.programmeName ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-text-subtle" aria-hidden />
                          {s.programmeName}
                        </span>
                      ) : (
                        <span className="text-meta text-text-subtle">—</span>
                      )}
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
          programmeOptions={programmeOptions}
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