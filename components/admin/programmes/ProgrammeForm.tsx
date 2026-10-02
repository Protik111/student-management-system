"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import {
  programmeCreateSchema,
  type ProgrammeCreateInput,
} from "@/lib/actions/schemas";
import { createProgramme, updateProgramme } from "@/lib/actions/programmes";

interface ProgrammeFormProps {
  /** When provided, the form edits this programme instead of creating one. */
  initial?: {
    id: string;
    name: string;
    code: string;
    durationYears: number;
    isActive: boolean;
  };
  onClose: () => void;
  onSaved: () => void;
}

type FormValues = {
  name: string;
  code: string;
  durationYears: number;
  isActive: boolean;
};

export default function ProgrammeForm({ initial, onClose, onSaved }: ProgrammeFormProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(programmeCreateSchema) as never,
    defaultValues: {
      name: initial?.name ?? "",
      code: initial?.code ?? "",
      durationYears: initial?.durationYears ?? 4,
      isActive: initial?.isActive ?? true,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const payload: ProgrammeCreateInput = {
      name: values.name,
      code: values.code.toUpperCase(),
      durationYears: Number(values.durationYears),
      isActive: values.isActive,
    };
    const result = initial
      ? await updateProgramme({ id: initial.id, ...payload })
      : await createProgramme(payload);
    setSubmitting(false);

    if (!result.ok) {
      toast.error({
        title: initial ? "Couldn't update programme" : "Couldn't create programme",
        description: result.error,
      });
      return;
    }
    toast.success({
      title: initial ? "Programme updated" : "Programme created",
    });
    onSaved();
  }

  return (
    <Modal
      open
      onClose={submitting ? () => undefined : onClose}
      title={initial ? "Edit programme" : "Add a new programme"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Programme name"
          placeholder="e.g. BSc Computer Science"
          required
          autoFocus
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Code"
            placeholder="BSC-CS"
            required
            error={errors.code?.message}
            hint="Short identifier used by the import tool (e.g. BSC-CS)."
            {...register("code")}
          />
          <Input
            label="Duration (years)"
            type="number"
            min={1}
            max={10}
            required
            error={errors.durationYears?.message}
            {...register("durationYears", { valueAsNumber: true })}
          />
        </div>

        <label className="flex items-center gap-2 text-default text-text">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-emerald focus:ring-emerald"
            {...register("isActive")}
          />
          Active (available to new students)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initial ? "Save changes" : "Create programme"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}