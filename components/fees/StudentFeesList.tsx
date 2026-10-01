"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatCents, type FeeStatus } from "@/lib/fees-utils";

interface StudentInvoiceRow {
  id: string;
  invoiceNo: string;
  description: string;
  amountCents: number;
  paidCents: number;
  balanceCents: number;
  status: FeeStatus;
  dueDate: Date;
  issuedAt: Date;
  payments: Array<{
    id: string;
    receiptNo: string;
    amountCents: number;
    paidAt: Date;
    method: string;
  }>;
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

interface StudentFeesListProps {
  initialInvoices: StudentInvoiceRow[];
}

export default function StudentFeesList({ initialInvoices }: StudentFeesListProps) {
  const [open, setOpen] = useState<string | null>(null);

  const totals = useMemo(() => {
    const totalDue = initialInvoices.reduce((s, i) => s + i.amountCents, 0);
    const totalPaid = initialInvoices.reduce((s, i) => s + i.paidCents, 0);
    return { totalDue, totalPaid, balance: totalDue - totalPaid };
  }, [initialInvoices]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My fees"
        description="Every invoice issued to you and your payment history."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Total billed</p>
          <p className="mt-1 text-card-title font-mono font-semibold text-text">
            {formatCents(totals.totalDue)}
          </p>
        </Card>
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Total paid</p>
          <p className="mt-1 text-card-title font-mono font-semibold text-emerald">
            {formatCents(totals.totalPaid)}
          </p>
        </Card>
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Outstanding</p>
          <p
            className={`mt-1 text-card-title font-mono font-semibold ${
              totals.balance > 0 ? "text-danger" : "text-text"
            }`}
          >
            {formatCents(totals.balance)}
          </p>
        </Card>
      </div>

      {initialInvoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Your school hasn't issued any invoices to you yet."
        />
      ) : (
        <div className="space-y-3">
          {initialInvoices.map((inv) => {
            const isOpen = open === inv.id;
            return (
              <Card key={inv.id}>
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-3 text-left"
                  onClick={() => setOpen(isOpen ? null : inv.id)}
                  aria-expanded={isOpen}
                >
                  <div className="flex-1">
                    <p className="text-default font-medium text-text">{inv.description}</p>
                    <p className="font-mono text-meta text-text-subtle">{inv.invoiceNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-default font-semibold text-text">
                      {formatCents(inv.amountCents)}
                    </p>
                    <p className="text-meta text-text-subtle">
                      Due {format(inv.dueDate, "PP")}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                </button>

                {isOpen && (
                  <div className="mt-4 border-t border-border pt-4">
                    {inv.payments.length === 0 ? (
                      <p className="text-meta text-text-subtle">No payments recorded yet.</p>
                    ) : (
                      <table className="w-full text-default">
                        <thead>
                          <tr className="text-meta uppercase tracking-[0.06em] text-text-subtle">
                            <th className="pb-2 text-left font-semibold">Receipt</th>
                            <th className="pb-2 text-right font-semibold">Amount</th>
                            <th className="pb-2 text-left font-semibold">Method</th>
                            <th className="pb-2 text-left font-semibold">Paid on</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.payments.map((p) => (
                            <tr key={p.id} className="border-t border-border">
                              <td className="py-2 font-mono text-meta text-text-muted">
                                {p.receiptNo}
                              </td>
                              <td className="py-2 text-right font-mono text-text-muted">
                                {formatCents(p.amountCents)}
                              </td>
                              <td className="py-2">
                                <Badge tone="info">{p.method}</Badge>
                              </td>
                              <td className="py-2 text-text-muted">
                                {format(p.paidAt, "PPP")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}