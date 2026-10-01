"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";
import {
  paymentCreateSchema,
  type PaymentCreateInput,
} from "@/lib/actions/schemas";
import { recordPayment } from "@/lib/actions/fees";
import { formatCents } from "@/lib/fees-utils";

interface PaymentFormProps {
  invoiceId: string;
  invoiceNo: string;
  studentName: string;
  remainingCents: number;
  onSaved: () => void;
}

const METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "mobile", label: "Mobile money" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export default function PaymentForm({
  invoiceId,
  invoiceNo,
  studentName,
  remainingCents,
  onSaved,
}: PaymentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PaymentCreateInput>({
    resolver: zodResolver(paymentCreateSchema) as never,
    defaultValues: {
      invoiceId,
      amountCents: remainingCents,
      method: "cash",
      reference: "",
      paidAt: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  async function onSubmit(values: PaymentCreateInput) {
    setSubmitting(true);
    const res = await recordPayment({
      ...values,
      reference: values.reference || undefined,
    } as never);
    setSubmitting(false);
    if (!res.ok) {
      toast.error({ title: "Couldn't record payment", description: res.error });
      return;
    }
    toast.success({
      title: `Receipt ${res.data.receiptNo} recorded`,
      description: `Invoice ${invoiceNo} is now ${res.data.newStatus}.`,
    });
    onSaved();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="rounded-card border border-border bg-base p-3 text-meta text-text-muted">
        Recording payment for <span className="font-semibold text-text">{invoiceNo}</span>{" "}
        ({studentName}). Remaining balance:{" "}
        <span className="font-mono font-semibold text-text">
          {formatCents(remainingCents)}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Amount (cents)"
          type="number"
          min={1}
          step={1}
          required
          placeholder="e.g. 150000"
          hint={`Maximum ${formatCents(remainingCents)}`}
          error={errors.amountCents?.message}
          {...register("amountCents", { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="method"
          render={({ field }) => (
            <AppSelect
              label="Method"
              required
              options={METHOD_OPTIONS}
              value={field.value ?? "cash"}
              onValueChange={(v) => field.onChange(v)}
              placeholder="Pick one"
              error={errors.method?.message}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Reference / txn #"
          placeholder="Optional"
          hint="Cheque #, bank txn id, etc."
          {...register("reference")}
        />
        <Controller
          control={control}
          name="paidAt"
          render={({ field }) => (
            <DatePicker
              label="Paid on"
              value={
                field.value instanceof Date
                  ? field.value.toISOString().slice(0, 10)
                  : field.value ?? ""
              }
              onChange={(v) => field.onChange(v)}
              error={errors.paidAt?.message}
              placeholder="Pick a date"
            />
          )}
        />
      </div>

      <Input label="Notes" placeholder="Optional" {...register("notes")} />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setValue("amountCents", remainingCents, { shouldDirty: true });
          }}
        >
          Fill remaining
        </Button>
        <Button type="submit" loading={submitting}>
          Record payment
        </Button>
      </div>
    </form>
  );
}