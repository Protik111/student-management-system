"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { schoolCreateSchema, type SchoolCreateInput } from "@/lib/actions/schemas";
import { createSchool, updateSchool } from "@/lib/actions/schools";

interface SchoolFormProps {
  /** When provided, the form edits this school instead of creating one. */
  initial?: {
    id: string;
    name: string;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    logoUrl: string | null;
    isActive: boolean;
  };
  onClose: () => void;
  onSaved: () => void;
}

// RHF's form values must include all checked keys; we treat isActive as
// required boolean here. The server schema accepts the same shape.
type FormValues = {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  isActive: boolean;
};

export default function SchoolForm({ initial, onClose, onSaved }: SchoolFormProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schoolCreateSchema) as never,
    defaultValues: {
      name: initial?.name ?? "",
      address: initial?.address ?? "",
      contactEmail: initial?.contactEmail ?? "",
      contactPhone: initial?.contactPhone ?? "",
      logoUrl: initial?.logoUrl ?? "",
      isActive: initial?.isActive ?? true,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const payload: SchoolCreateInput = {
      name: values.name,
      address: values.address || undefined,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,
      logoUrl: values.logoUrl || undefined,
      isActive: values.isActive,
    };
    const action = initial ? updateSchool : createSchool;
    const result = initial
      ? await updateSchool({ id: initial.id, ...payload })
      : await createSchool(payload);
    setSubmitting(false);

    if (!result.ok) {
      toast.error({
        title: initial ? "Couldn't update school" : "Couldn't create school",
        description: result.error,
      });
      return;
    }
    toast.success({
      title: initial ? "School updated" : "School created",
    });
    onSaved();
  }

  return (
    <Modal
      open
      onClose={submitting ? () => undefined : onClose}
      title={initial ? "Edit school" : "Add a new school"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="School name"
          placeholder="e.g. Sunrise Academy"
          required
          autoFocus
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Address"
          placeholder="123 Main Road, Dhaka"
          error={errors.address?.message}
          {...register("address")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contact email"
            type="email"
            placeholder="admin@school.com"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
          <Input
            label="Contact phone"
            type="tel"
            placeholder="+880 1700 000000"
            error={errors.contactPhone?.message}
            {...register("contactPhone")}
          />
        </div>
        <Input
          label="Logo URL"
          placeholder="https://…"
          error={errors.logoUrl?.message}
          {...register("logoUrl")}
        />

        <label className="flex items-center gap-2 text-default text-text">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-emerald focus:ring-emerald"
            {...register("isActive")}
          />
          Active (visible to admins)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initial ? "Save changes" : "Create school"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}