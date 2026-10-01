"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission, requireUser } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import { notify } from "@/lib/notifications";
import {
  feeStructureCreateSchema,
  invoiceCreateSchema,
  paymentCreateSchema,
  type FeeStructureCreateInput,
  type InvoiceCreateInput,
  type PaymentCreateInput,
} from "@/lib/actions/schemas";
import { nextInvoiceNo, nextReceiptNo } from "@/lib/sequences";
import { formatCents } from "@/lib/fees-utils";
import type { FeeStatus, PaymentMethod } from "@prisma/client";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function flattenZod(err: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    (out[path] ??= []).push(issue.message);
  }
  return out;
}

/** Auto-compute invoice status from amount paid so far vs amount due. */
function deriveStatus(
  amountCents: number,
  payments: { amountCents: number }[],
  dueDate: Date,
): FeeStatus {
  const paid = payments.reduce((s, p) => s + p.amountCents, 0);
  if (paid <= 0) {
    return dueDate.getTime() < Date.now() ? "overdue" : "pending";
  }
  if (paid < amountCents) return "partial";
  return "paid";
}

/* ─── Fee structures ────────────────────────────────────────────────────── */

export interface FeeStructureItem {
  id: string;
  name: string;
  amountCents: number;
  frequency: string;
  dueDay: number | null;
  isActive: boolean;
  classId: string | null;
  className: string | null;
  createdAt: Date;
}

export async function listFeeStructures(): Promise<FeeStructureItem[]> {
  const actor = await requirePermission("manage_fees");
  const where =
    actor.role === "ADMIN" && !actor.schoolId
      ? {}
      : { schoolId: actor.schoolId ?? "__none__" };
  const rows = await prisma.feeStructure.findMany({
    where,
    include: { class: { select: { name: true, section: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amountCents: r.amountCents,
    frequency: r.frequency,
    dueDay: r.dueDay,
    isActive: r.isActive,
    classId: r.classId,
    className: r.class ? `${r.class.name}-${r.class.section}` : null,
    createdAt: r.createdAt,
  }));
}

export async function createFeeStructure(
  input: FeeStructureCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_fees");
  } catch {
    return fail("You don't have permission to manage fees");
  }
  if (actor.role !== "ADMIN" && !actor.schoolId) {
    return fail("No school context");
  }
  const parsed = feeStructureCreateSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input", flattenZod(parsed.error));
  const schoolId = actor.schoolId as string;
  const data = parsed.data as {
    name: string;
    classId: string | null | undefined;
    amountCents: number;
    frequency: string;
    dueDay: number | null;
    isActive: boolean;
  };

  try {
    const created = await prisma.$transaction(async (tx) => {
      const fs = await tx.feeStructure.create({
        data: {
          id: crypto.randomUUID(),
          schoolId,
          name: data.name,
          amountCents: data.amountCents,
          frequency: data.frequency,
          dueDay: data.dueDay,
          classId: data.classId ?? null,
          isActive: data.isActive,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId,
        action: "fees.structure_create",
        entityType: "FeeStructure",
        entityId: fs.id,
        payload: { name: fs.name, amountCents: fs.amountCents },
      });
      return fs;
    });
    revalidatePath("/admin/fees");
    revalidatePath("/admin/audit");
    return ok({ id: created.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't create fee structure");
  }
}

export async function toggleFeeStructureActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requirePermission("manage_fees");
  const existing = await prisma.feeStructure.findUnique({ where: { id } });
  if (!existing) return fail("Fee structure not found");
  if (actor.role === "ADMIN" && existing.schoolId !== actor.schoolId) {
    return fail("You can only edit fees in your school");
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.feeStructure.update({ where: { id }, data: { isActive } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: existing.schoolId,
        action: "fees.structure_toggle",
        entityType: "FeeStructure",
        entityId: id,
        payload: { from: existing.isActive, to: isActive },
      });
    });
    revalidatePath("/admin/fees");
    return ok({ id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't update");
  }
}

/* ─── Invoices ───────────────────────────────────────────────────────────── */

export interface InvoiceListItem {
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

export async function listInvoices(opts: {
  status?: FeeStatus;
  studentId?: string;
  limit?: number;
} = {}): Promise<InvoiceListItem[]> {
  const actor = await requirePermission("manage_fees");
  const where: Record<string, unknown> = {};
  if (actor.role === "ADMIN" && !actor.schoolId) {
    // see all
  } else if (actor.schoolId) {
    where.schoolId = actor.schoolId;
  } else {
    return [];
  }
  if (opts.status) where.status = opts.status;
  if (opts.studentId) where.studentId = opts.studentId;

  const rows = await prisma.invoice.findMany({
    where,
    include: {
      student: { include: { user: { select: { fullName: true } } } },
      payments: { select: { amountCents: true } },
    },
    orderBy: [{ issuedAt: "desc" }],
    take: opts.limit ?? 200,
  });

  return rows.map((r) => {
    const paidCents = r.payments.reduce((s, p) => s + p.amountCents, 0);
    const balanceCents = r.amountCents - paidCents;
    const status = deriveStatus(r.amountCents, r.payments, r.dueDate);
    return {
      id: r.id,
      invoiceNo: r.invoiceNo,
      description: r.description,
      amountCents: r.amountCents,
      paidCents,
      balanceCents,
      status,
      dueDate: r.dueDate,
      issuedAt: r.issuedAt,
      studentId: r.studentId,
      studentName: r.student.user.fullName,
      studentAdmissionNo: r.student.admissionNo,
    };
  });
}

export async function getInvoiceDetail(invoiceId: string) {
  const actor = await requirePermission("manage_fees");
  const r = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      student: { include: { user: { select: { fullName: true, email: true } } } },
      school: { select: { name: true } },
      feeStructure: true,
      payments: {
        orderBy: { paidAt: "desc" },
        include: { receivedBy: { select: { fullName: true } } },
      },
    },
  });
  if (!r) return null;
  if (actor.role === "ADMIN" && r.schoolId !== actor.schoolId) {
    return null;
  }
  const paidCents = r.payments.reduce((s, p) => s + p.amountCents, 0);
  return {
    ...r,
    paidCents,
    balanceCents: r.amountCents - paidCents,
    status: deriveStatus(r.amountCents, r.payments, r.dueDate),
  };
}

export async function createInvoice(
  input: InvoiceCreateInput,
): Promise<ActionResult<{ id: string; invoiceNo: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_fees");
  } catch {
    return fail("You don't have permission to issue invoices");
  }

  const parsed = invoiceCreateSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input", flattenZod(parsed.error));
  const data = parsed.data as {
    studentId: string;
    feeStructureId: string | null | undefined;
    description: string;
    amountCents: number;
    dueDate: Date | undefined;
    notes: string | undefined;
  };

  const student = await prisma.student.findUnique({
    where: { id: data.studentId },
    select: { id: true, schoolId: true, userId: true },
  });
  if (!student) return fail("Student not found");
  if (actor.role === "ADMIN" && student.schoolId !== actor.schoolId) {
    return fail("You can only invoice students in your school");
  }

  if (!data.dueDate) return fail("Due date is required", { dueDate: ["Pick a date"] });

  try {
    const created = await prisma.$transaction(async (tx) => {
      const invoiceNo = await nextInvoiceNo(tx, student.schoolId);
      const inv = await tx.invoice.create({
        data: {
          id: crypto.randomUUID(),
          schoolId: student.schoolId,
          studentId: student.id,
          feeStructureId: data.feeStructureId || null,
          invoiceNo,
          description: data.description,
          amountCents: data.amountCents,
          dueDate: data.dueDate!,
          status: "pending",
          issuedById: actor.id,
          notes: data.notes ?? null,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: student.schoolId,
        action: "fees.invoice_create",
        entityType: "Invoice",
        entityId: inv.id,
        payload: {
          invoiceNo,
          studentId: student.id,
          amountCents: data.amountCents,
          dueDate: data.dueDate,
        },
      });
      await notify(tx, {
        recipientUserId: student.userId,
        type: "invoice_issued",
        title: `New invoice: ${invoiceNo}`,
        body: `${data.description} — amount due ${formatCents(data.amountCents)} by ${data.dueDate!.toLocaleDateString()}.`,
        link: "/student/fees",
        payload: { invoiceId: inv.id, amountCents: data.amountCents },
      });
      return inv;
    });

    revalidatePath("/admin/fees");
    revalidatePath("/student/fees");
    revalidatePath("/student");
    revalidatePath("/admin/audit");
    return ok({ id: created.id, invoiceNo: created.invoiceNo });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't create invoice");
  }
}

/* ─── Payments ───────────────────────────────────────────────────────────── */

export async function recordPayment(
  input: PaymentCreateInput,
): Promise<ActionResult<{ id: string; receiptNo: string; newStatus: FeeStatus }>> {
  let actor;
  try {
    actor = await requirePermission("manage_fees");
  } catch {
    return fail("You don't have permission to record payments");
  }

  const parsed = paymentCreateSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input", flattenZod(parsed.error));
  const data = parsed.data as {
    invoiceId: string;
    amountCents: number;
    method: PaymentMethod;
    reference: string | undefined;
    paidAt: Date | undefined;
    notes: string | undefined;
  };

  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    include: {
      payments: { select: { amountCents: true } },
      student: { select: { userId: true, schoolId: true } },
    },
  });
  if (!invoice) return fail("Invoice not found");
  if (actor.role === "ADMIN" && invoice.schoolId !== actor.schoolId) {
    return fail("You can only record payments in your school");
  }

  const alreadyPaid = invoice.payments.reduce((s, p) => s + p.amountCents, 0);
  const remaining = invoice.amountCents - alreadyPaid;
  if (data.amountCents > remaining) {
    return fail(
      `Payment ${formatCents(data.amountCents)} exceeds remaining balance ${formatCents(remaining)}`,
      { amountCents: [`Exceeds remaining balance of ${formatCents(remaining)}`] },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const receiptNo = await nextReceiptNo(tx, invoice.schoolId);
      const p = await tx.payment.create({
        data: {
          id: crypto.randomUUID(),
          schoolId: invoice.schoolId,
          invoiceId: invoice.id,
          amountCents: data.amountCents,
          method: data.method,
          reference: data.reference || null,
          paidAt: data.paidAt ?? new Date(),
          receivedById: actor.id,
          notes: data.notes ?? null,
          receiptNo,
        },
      });
      const newPaid = alreadyPaid + data.amountCents;
      const newStatus: FeeStatus =
        newPaid >= invoice.amountCents
          ? "paid"
          : newPaid > 0
            ? "partial"
            : invoice.status;

      // Update invoice status (denormalised)
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus },
      });

      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: invoice.schoolId,
        action: "fees.payment_create",
        entityType: "Payment",
        entityId: p.id,
        payload: {
          invoiceId: invoice.id,
          invoiceNo: invoice.invoiceNo,
          amountCents: data.amountCents,
          method: data.method,
          newStatus,
        },
      });

      await notify(tx, {
        recipientUserId: invoice.student.userId,
        type: "payment_received",
        title: `Payment received: ${receiptNo}`,
        body: `${formatCents(data.amountCents)} recorded against ${invoice.invoiceNo}. Status is now ${newStatus}.`,
        link: "/student/fees",
        payload: { paymentId: p.id, invoiceId: invoice.id },
      });

      return { payment: p, newStatus, receiptNo };
    });

    revalidatePath("/admin/fees");
    revalidatePath("/student/fees");
    revalidatePath("/admin/audit");
    return ok({
      id: result.payment.id,
      receiptNo: result.receiptNo,
      newStatus: result.newStatus,
    });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't record payment");
  }
}

/* ─── Student-side view ─────────────────────────────────────────────────── */

export async function listMyInvoices() {
  const user = await requireUser();
  if (user.role !== "STUDENT") return [];
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true, schoolId: true },
  });
  if (!student) return [];

  const rows = await prisma.invoice.findMany({
    where: { studentId: student.id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
    orderBy: [{ issuedAt: "desc" }],
  });
  return rows.map((r) => {
    const paidCents = r.payments.reduce((s, p) => s + p.amountCents, 0);
    return {
      id: r.id,
      invoiceNo: r.invoiceNo,
      description: r.description,
      amountCents: r.amountCents,
      paidCents,
      balanceCents: r.amountCents - paidCents,
      status: deriveStatus(r.amountCents, r.payments, r.dueDate),
      dueDate: r.dueDate,
      issuedAt: r.issuedAt,
      payments: r.payments.map((p) => ({
        id: p.id,
        receiptNo: p.receiptNo,
        amountCents: p.amountCents,
        paidAt: p.paidAt,
        method: p.method,
      })),
    };
  });
}
