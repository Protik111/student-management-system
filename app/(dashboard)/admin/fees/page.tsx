import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { listFeeStructures } from "@/lib/actions/fees";
import { deriveStatus, formatCents } from "@/lib/fees-utils";
import FeesHub from "@/components/fees/FeesHub";

export const metadata = { title: "Fees · School Admin" };

export const dynamic = "force-dynamic";

export default async function SchoolAdminFeesPage() {
  const me = await requirePermission("manage_fees");
  // Captured once at request time — used to bucket "partial but past due" as
  // an overdue. The `react-hooks/purity` rule doesn't apply to server
  // components, but we eslint-disable here so the codebase stays lint-clean.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();

  const [classes, programmes, structures, recentInvoices] = await Promise.all([
    me.schoolId
      ? prisma.class.findMany({
          where: { schoolId: me.schoolId },
          select: { id: true, name: true, section: true },
          orderBy: [{ name: "asc" }, { section: "asc" }],
        })
      : Promise.resolve([]),
    prisma.programme.findMany({
      where: me.schoolId ? { schoolId: me.schoolId, isActive: true } : { isActive: true },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, code: true },
    }),
    listFeeStructures(),
    prisma.invoice.findMany({
      where: me.schoolId ? { schoolId: me.schoolId } : {},
      orderBy: [{ issuedAt: "desc" }],
      take: 200,
      include: {
        student: {
          select: {
            id: true,
            admissionNo: true,
            user: { select: { fullName: true } },
            programme: { select: { name: true, code: true } },
          },
        },
        payments: { select: { amountCents: true } },
      },
    }),
  ]);

  // Compute overdue rows: invoices with no payments and a past due date, or
  // partially paid past their due date. Sorted by oldest first, top 10 only.
  const overdueRows = recentInvoices
    .map((inv) => {
      const paid = inv.payments.reduce((s, p) => s + p.amountCents, 0);
      const status = deriveStatus(inv.amountCents, inv.payments, inv.dueDate);
      return {
          id: inv.id,
          invoiceNo: inv.invoiceNo,
          studentId: inv.studentId,
          studentName: inv.student.user.fullName,
          admissionNo: inv.student.admissionNo,
          programmeName: inv.student.programme
            ? `${inv.student.programme.code} — ${inv.student.programme.name}`
            : null,
          amountCents: inv.amountCents,
          paidCents: paid,
          balanceCents: inv.amountCents - paid,
          status,
          dueDate: inv.dueDate,
        };
      })
      .filter(
        (r) =>
          r.status === "overdue" ||
          (r.status === "partial" && r.dueDate.getTime() < nowMs),
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 10);

  return (
    <FeesHub
      initialStructures={structures}
      classOptions={classes.map((c) => ({
        id: c.id,
        label: `${c.name}-${c.section}`,
      }))}
      programmeOptions={programmes.map((p) => ({
        id: p.id,
        label: `${p.code} — ${p.name}`,
      }))}
      initialOverdue={overdueRows.map((r) => ({
        ...r,
        amountLabel: formatCents(r.amountCents),
        balanceLabel: formatCents(r.balanceCents),
        dueLabel: r.dueDate.toISOString(),
      }))}
    />
  );
}