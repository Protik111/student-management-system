"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";
import {
  invoiceCreateSchema,
  type InvoiceCreateInput,
} from "@/lib/actions/schemas";
import { createInvoice } from "@/lib/actions/fees";
import { useRouter } from "next/navigation";

interface InvoiceFormProps {
  students: { id: string; label: string }[];
  feeStructures: { id: string; label: string; amountCents: number }[];
}

function asOptions<T extends { id: string; label: string }>(arr: T[]) {
  return arr.map((o) => ({ value: o.id, label: o.label }));
}

export default function InvoiceForm({ students, feeStructures }: InvoiceFormProps) {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceCreateInput>({
    resolver: zodResolver(invoiceCreateSchema) as never,
    defaultValues: {
      studentId: "",
      feeStructureId: "",
      description: "",
      amountCents: undefined as unknown as number,
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      notes: "",
    },
  });

  const feeStructureId = watch("feeStructureId");

  async function onSubmit(values: InvoiceCreateInput) {
    const res = await createInvoice({
      ...values,
      feeStructureId: values.feeStructureId || undefined,
    } as never);
    if (!res.ok) {
      toast.error({ title: "Couldn't issue invoice", description: res.error });
      return;
    }
    toast.success({ title: `Issued ${res.data.invoiceNo}` });
    router.push(`/admin/fees/invoices/${res.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Controller
        control={control}
        name="studentId"
        render={({ field }) => (
          <AppSelect
            label="Student"
            required
            options={asOptions(students)}
            value={field.value ?? ""}
            onValueChange={(v) => field.onChange(v)}
            placeholder={students.length === 0 ? "No students in this school" : "Pick one…"}
            error={errors.studentId?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="feeStructureId"
        render={({ field }) => (
          <AppSelect
            label="Fee structure"
            options={[
              { value: "", label: "Custom amount" },
              ...feeStructures.map((f) => ({ value: f.id, label: f.label })),
            ]}
            value={field.value ?? ""}
            onValueChange={(v) => {
              field.onChange(v);
              const fs = feeStructures.find((f) => f.id === v);
              if (fs) {
                setValue("amountCents", fs.amountCents, { shouldDirty: true });
                setValue("description", fs.label, { shouldDirty: true });
              }
            }}
            placeholder="Custom amount"
            hint="Pick a fee structure to auto-fill the amount."
          />
        )}
      />

      <Input
        label="Description"
        placeholder="e.g. Term 1 Tuition 2026"
        required
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Amount (cents)"
          type="number"
          min={0}
          step={1}
          required
          placeholder="e.g. 300000"
          hint="Whole number (cents). 300000 = 3,000.00"
          error={errors.amountCents?.message}
          {...register("amountCents", { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker
              label="Due date"
              value={
                field.value instanceof Date
                  ? field.value.toISOString().slice(0, 10)
                  : field.value ?? ""
              }
              onChange={(v) => field.onChange(v)}
              error={errors.dueDate?.message}
              placeholder="Pick a date"
            />
          )}
        />
      </div>

      <Input
        label="Notes"
        placeholder="Optional"
        {...register("notes")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" href="/admin/fees/invoices" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Issue invoice
        </Button>
      </div>
    </form>
  );
}