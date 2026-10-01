"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, CreditCard } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { formatCents, type FeeStatus } from "@/lib/fees-utils";
import PaymentForm from "@/components/fees/PaymentForm";

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

interface InvoiceDetailProps {
  invoice: {
    id: string;
    invoiceNo: string;
    description: string;
    amountCents: number;
    paidCents: number;
    balanceCents: number;
    status: FeeStatus;
    dueDate: Date;
    issuedAt: Date;
    notes: string | null;
    student: { id: string; admissionNo: string; user: { fullName: string; email: string } };
    school: { name: string };
    payments: Array<{
      id: string;
      receiptNo: string;
      amountCents: number;
      paidAt: Date;
      method: string;
      reference: string | null;
      receivedBy: { fullName: string };
    }>;
  };
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const [showPayment, setShowPayment] = useState(false);
  const fullyPaid = invoice.balanceCents <= 0;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        href="/admin/fees/invoices"
        className="-ml-3"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to invoices
      </Button>

      <PageHeader
        title={invoice.invoiceNo}
        description={invoice.description}
        actions={<Badge tone={STATUS_TONE[invoice.status]}>{STATUS_LABEL[invoice.status]}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Student</p>
          <p className="mt-1 text-default font-semibold text-text">
            {invoice.student.user.fullName}
          </p>
          <p className="text-meta text-text-subtle">{invoice.student.admissionNo}</p>
          <p className="text-meta text-text-subtle">{invoice.student.user.email}</p>
        </Card>

        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Amount</p>
          <p className="mt-1 text-card-title font-mono font-semibold text-text">
            {formatCents(invoice.amountCents)}
          </p>
          <p className="text-meta text-text-muted">
            Paid {formatCents(invoice.paidCents)} · Balance{" "}
            <span className={fullyPaid ? "text-emerald" : "text-text"}>
              {formatCents(invoice.balanceCents)}
            </span>
          </p>
        </Card>

        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Due</p>
          <p className="mt-1 text-default font-semibold text-text">
            {format(invoice.dueDate, "PPP")}
          </p>
          <p className="text-meta text-text-muted">
            Issued {format(invoice.issuedAt, "PP")}
          </p>
        </Card>
      </div>

      {invoice.notes && (
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Notes</p>
          <p className="mt-1 text-default text-text-muted">{invoice.notes}</p>
        </Card>
      )}

      {!fullyPaid && !showPayment && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-default font-medium text-text">Record a payment</p>
              <p className="text-meta text-text-subtle">
                {formatCents(invoice.balanceCents)} remaining.
              </p>
            </div>
            <Button onClick={() => setShowPayment(true)}>
              <CreditCard className="h-4 w-4" aria-hidden /> Record payment
            </Button>
          </div>
        </Card>
      )}

      {showPayment && (
        <Card>
          <PaymentForm
            invoiceId={invoice.id}
            invoiceNo={invoice.invoiceNo}
            studentName={invoice.student.user.fullName}
            remainingCents={invoice.balanceCents}
            onSaved={() => setShowPayment(false)}
          />
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-subheading font-semibold text-text">
          Payments ({invoice.payments.length})
        </h2>
        {invoice.payments.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-card p-6 text-center text-meta text-text-subtle">
            No payments recorded yet.
          </p>
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-default">
              <thead>
                <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                  <th className="px-4 py-3 text-left font-semibold">Receipt #</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Method</th>
                  <th className="px-4 py-3 text-left font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left font-semibold">Paid on</th>
                  <th className="px-4 py-3 text-left font-semibold">Received by</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-base">
                    <td className="px-4 py-3 font-mono text-meta text-text-muted">
                      {p.receiptNo}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-muted">
                      {formatCents(p.amountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{p.method}</Badge>
                    </td>
                    <td className="px-4 py-3 text-meta text-text-subtle">
                      {p.reference || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {format(p.paidAt, "PPP")}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{p.receivedBy.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}