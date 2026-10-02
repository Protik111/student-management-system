"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AppSelect from "@/components/ui/AppSelect";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import {
  feeStructureCreateSchema,
  type FeeStructureCreateInput,
} from "@/lib/actions/schemas";
import { createFeeStructure } from "@/lib/actions/fees";

interface FeeStructureFormProps {
  classOptions: { id: string; label: string }[];
  programmeOptions: { id: string; label: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export default function FeeStructureForm({
  classOptions,
  programmeOptions,
  onClose,
  onSaved,
}: FeeStructureFormProps) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FeeStructureCreateInput>({
    resolver: zodResolver(feeStructureCreateSchema) as never,
    defaultValues: {
      name: "",
      classId: "",
      programmeId: "",
      amountCents: undefined as unknown as number,
      frequency: "termly",
      dueDay: undefined as unknown as number,
      isActive: true,
    },
  });

  async function onSubmit(values: FeeStructureCreateInput) {
    const cleaned: FeeStructureCreateInput = {
      ...values,
      programmeId: values.programmeId || undefined,
      classId: values.classId || undefined,
      dueDay: values.dueDay || undefined,
    };
    const res = await createFeeStructure(cleaned as never);
    if (!res.ok) {
      toast.error({ title: "Couldn't create fee structure", description: res.error });
      return;
    }
    toast.success({ title: "Fee structure created" });
    onSaved();
  }

  return (
    <Modal open onClose={isSubmitting ? () => undefined : onClose} title="New fee structure">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Name"
          placeholder="e.g. Term 1 Tuition"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount (cents)"
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 300000"
            required
            hint="Whole number — stored as cents. 300000 = 3,000.00"
            error={errors.amountCents?.message}
            {...register("amountCents", { valueAsNumber: true })}
          />
          <Controller
            control={control}
            name="frequency"
            render={({ field }) => (
              <AppSelect
                label="Frequency"
                required
                options={[
                  { value: "termly", label: "Termly" },
                  { value: "annual", label: "Annual" },
                  { value: "monthly", label: "Monthly" },
                  { value: "one_off", label: "One-off" },
                ]}
                value={field.value ?? "termly"}
                onValueChange={(v) => field.onChange(v)}
                placeholder="Pick one"
                error={errors.frequency?.message}
              />
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="programmeId"
            render={({ field }) => (
              <AppSelect
                label="Programme"
                options={[
                  { value: "", label: programmeOptions.length ? "Pick one…" : "No programmes yet" },
                  ...programmeOptions.map((p) => ({ value: p.id, label: p.label })),
                ]}
                value={field.value ?? ""}
                onValueChange={(v) => field.onChange(v)}
                placeholder="Pick a programme"
                hint="Fees attach to a programme; invoicing auto-derives from this."
                disabled={programmeOptions.length === 0}
                error={errors.programmeId?.message}
              />
            )}
          />
          <Input
            label="Due day (1–28)"
            type="number"
            min={1}
            max={28}
            placeholder="Optional"
            hint="If monthly — which day each month?"
            error={errors.dueDay?.message}
            {...register("dueDay", { valueAsNumber: true })}
          />
        </div>

        <Controller
          control={control}
          name="classId"
          render={({ field }) => (
            <AppSelect
              label="Class scope (optional)"
              options={[
                { value: "", label: "All classes" },
                ...classOptions.map((o) => ({ value: o.id, label: o.label })),
              ]}
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v)}
              placeholder="All classes"
              hint="Optional — restrict to one class. Programmes are the primary scope."
            />
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create fee structure
          </Button>
        </div>
      </form>
    </Modal>
  );
}