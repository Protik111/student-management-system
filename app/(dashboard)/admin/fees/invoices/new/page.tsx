import { ArrowLeft } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import InvoiceForm from "@/components/fees/InvoiceForm";
import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { listFeeStructures } from "@/lib/actions/fees";

export const metadata = { title: "New Invoice · School Admin" };

export default async function NewInvoicePage() {
  const me = await requirePermission("manage_fees");
  if (!me.schoolId) {
    return (
      <p className="text-default text-danger">
        You must be assigned to a school to issue invoices.
      </p>
    );
  }

  const [students, structures] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: me.schoolId, user: { isActive: true } },
      include: { user: { select: { fullName: true } } },
      orderBy: { user: { fullName: "asc" } },
    }),
    listFeeStructures(),
  ]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" href="/admin/fees/invoices" className="-ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to invoices
      </Button>
      <PageHeader
        title="New invoice"
        description="Issue an invoice to a student. They'll see it in their fees page instantly."
      />
      <Card>
        <InvoiceForm
          students={students.map((s) => ({
            id: s.id,
            label: `${s.user.fullName} (${s.admissionNo})`,
          }))}
          feeStructures={structures
            .filter((s) => s.isActive)
            .map((s) => ({ id: s.id, label: s.name, amountCents: s.amountCents }))}
        />
      </Card>
    </div>
  );
}