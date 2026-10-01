"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import AppSelect from "@/components/ui/AppSelect";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatCents, type FeeStatus } from "@/lib/fees-utils";

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  description: string;
  amountCents: number;
  paidCents: number;
  balanceCents: number;
  status: FeeStatus;
  dueDate: Date;
  issuedAt: Date;
  studentId: string;
  studentName: string;
  studentAdmissionNo: string;
}

const STATUS_LABEL: Record<FeeStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  waived: "Waived",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<FeeStatus, "success" | "info" | "warning" | "danger" | "neutral"> = {
  pending: "neutral",
  partial: "warning",
  paid: "success",
  overdue: "danger",
  waived: "info",
  cancelled: "neutral",
};

const FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function InvoicesList({ initialInvoices }: { initialInvoices: InvoiceRow[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return initialInvoices;
    return initialInvoices.filter((i) => i.status === filter);
  }, [initialInvoices, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Every invoice issued to students in your school."
        actions={
          <Button href="/admin/fees/invoices/new">
            <Plus className="h-4 w-4" aria-hidden /> New invoice
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <AppSelect
          options={FILTER_OPTIONS}
          value={filter}
          onValueChange={setFilter}
          placeholder="Filter by status"
        />
        <span className="text-meta text-text-subtle">
          Showing {filtered.length} of {initialInvoices.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Issue one to start tracking payments."
          action={
            <Button href="/admin/fees/invoices/new">
              <Plus className="h-4 w-4" aria-hidden /> Issue first invoice
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Invoice #</th>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Due</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-b-0 hover:bg-base">
                  <td className="px-4 py-3 font-mono text-meta text-text-muted">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text">{inv.studentName}</div>
                    <div className="text-meta text-text-subtle">{inv.studentAdmissionNo}</div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{inv.description}</td>
                  <td className="px-4 py-3 text-right font-mono text-text-muted">
                    {formatCents(inv.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-muted">
                    {formatCents(inv.paidCents)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {format(inv.dueDate, "PP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/fees/invoices/${inv.id}`}
                      className="text-meta font-medium text-emerald hover:text-emerald-light"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}