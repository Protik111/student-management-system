"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AppSelect from "@/components/ui/AppSelect";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import {
  courseCreateSchema,
  type CourseCreateInput,
} from "@/lib/actions/schemas";
import {
  createCourse,
  updateCourse,
  listTeachersForSelect,
} from "@/lib/actions/courses";

/**
 * Minimal shape the course-form dropdown needs. Both the heavyweight
 * `CategoryListItem` (admin-only `listCategories`) and the lightweight
 * return of `listCategoriesForSelect` (view-gated) are assignable — only
 * `id` + `name` are read.
 */
type CategoryOption = { id: string; name: string };

interface CourseFormProps {
  scope: "ADMIN" | "TEACHER";
  categories: CategoryOption[];
  teachers: { id: string; fullName: string }[];
  initial?: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    teacherId: string;
    priceCents: number;
    isActive: boolean;
  };
  /** Where to redirect after a successful save. Defaults to caller-provided href. */
  redirectTo?: string;
  /** When true, renders the form as a modal. When false, renders inline. */
  inline?: boolean;
}

export default function CourseForm({
  scope,
  categories,
  teachers,
  initial,
  redirectTo,
  inline,
}: CourseFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseCreateInput>({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
      teacherId: initial?.teacherId ?? (scope === "TEACHER" ? undefined : teachers[0]?.id ?? undefined),
      priceCents: initial?.priceCents ?? 0,
      isActive: initial?.isActive ?? true,
    },
  });

  async function onSubmit(values: CourseCreateInput) {
    setSubmitting(true);
    const payload = {
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      teacherId: scope === "ADMIN" ? values.teacherId : undefined,
      priceCents: values.priceCents ?? 0,
      isActive: values.isActive ?? true,
    };
    const result = initial
      ? await updateCourse({ id: initial.id, ...payload })
      : await createCourse(payload);
    setSubmitting(false);
    if (!result.ok) {
      toast.error({
        title: initial ? "Couldn't update course" : "Couldn't create course",
        description: result.error,
      });
      return;
    }
    toast.success({ title: initial ? "Course updated" : "Course created" });
    if (redirectTo) {
      router.push(redirectTo);
    } else if (inline) {
      router.refresh();
    } else {
      router.back();
    }
  }

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.fullName }));

  const body = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Title"
        placeholder="e.g. Algebra I — Foundations"
        required
        autoFocus
        error={errors.title?.message}
        {...register("title")}
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="course-description"
          className="text-meta font-semibold uppercase tracking-[0.06em] text-text-muted"
        >
          Description
          <span className="ml-1 text-danger">*</span>
        </label>
        <textarea
          id="course-description"
          rows={5}
          placeholder="What will students learn? Outline the syllabus, prerequisites, and outcomes."
          className="w-full rounded-chip border border-border bg-card px-3 py-2.5 text-default text-text placeholder:text-text-subtle focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
          {...register("description")}
        />
        {errors.description?.message && (
          <p className="text-meta text-danger">{errors.description.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <AppSelect
              label="Category"
              required
              options={categoryOptions}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              error={errors.categoryId?.message}
              placeholder="Select category…"
            />
          )}
        />
        {scope === "ADMIN" && (
          <Controller
            control={control}
            name="teacherId"
            render={({ field }) => (
              <AppSelect
                label="Teacher"
                required
                options={teacherOptions}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                error={errors.teacherId?.message}
                placeholder="Assign a teacher…"
              />
            )}
          />
        )}
        <Input
          label="Price (cents)"
          type="number"
          min={0}
          step={1}
          placeholder="0 = free"
          hint="Stored as integer cents. 0 means free."
          error={errors.priceCents?.message}
          {...register("priceCents", { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <AppSelect
              label="Status"
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              value={field.value ? "true" : "false"}
              onValueChange={(v) => field.onChange(v === "true")}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {!inline && (
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {initial ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );

  if (inline) return body;

  return (
    <Modal
      open
      onClose={submitting ? () => undefined : () => router.back()}
      title={initial ? "Edit course" : "Create a new course"}
    >
      {body}
    </Modal>
  );
}