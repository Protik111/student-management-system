"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import DatePicker from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";
import { GENDERS, type Gender } from "@/lib/db/types";
import { studentCreateSchema, type StudentCreateFormInput } from "@/lib/actions/schemas";
import {
  createStudent,
  updateStudent,
  type StudentFormOptions,
} from "@/lib/actions/students";

interface StudentFormProps {
  variant: "super_admin" | "school_admin";
  options: StudentFormOptions;
  initial?: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    schoolId: string;
    admissionNo: string;
    dateOfBirth: Date | null;
    gender: Gender | null;
    currentClassId: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    address: string | null;
  };
  onClose: () => void;
  onSaved: () => void;
}

const GENDER_LABEL: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

function dateToIso(d: Date | null | undefined): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

/**
 * Form-local shape: the pre-transform input the server schema accepts.
 * `dateOfBirth` is held as an ISO YYYY-MM-DD string (matches what the user
 * picks in the DatePicker) and converted to a Date by the server schema's
 * `.transform()`. We type it via `z.input<>` so the form fields are correct.
 */
type FormValues = StudentCreateFormInput;

export default function StudentForm({
  variant,
  options,
  initial,
  onClose,
  onSaved,
}: StudentFormProps) {
  const toast = useToast();

  const defaultSchoolId =
    variant === "school_admin"
      ? options.schools[0]?.id ?? ""
      : initial?.schoolId ?? "";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // The schema transforms dateOfBirth string → Date, but the form uses a
    // string. Cast the resolver to satisfy RHF's generic.
    resolver: zodResolver(studentCreateSchema) as never,
    defaultValues: {
      email: initial?.email ?? "",
      fullName: initial?.fullName ?? "",
      phone: initial?.phone ?? "",
      avatarUrl: initial?.avatarUrl ?? "",
      password: "",
      schoolId: defaultSchoolId,
      admissionNo: initial?.admissionNo ?? "",
      dateOfBirth: dateToIso(initial?.dateOfBirth),
      gender: initial?.gender ?? undefined,
      currentClassId: initial?.currentClassId ?? "",
      guardianName: initial?.guardianName ?? "",
      guardianPhone: initial?.guardianPhone ?? "",
      address: initial?.address ?? "",
      enrollInCurrentClass: false,
    },
  });

  const schoolId = watch("schoolId");
  const currentClassId = watch("currentClassId");
  const enrollInCurrentClass = watch("enrollInCurrentClass");

  const classOptions = useMemo(() => {
    const classes = schoolId ? (options.classesBySchool[schoolId] ?? []) : [];
    return [
      { value: "__none__", label: "(no class)" },
      ...classes.map((c) => ({
        value: c.id,
        label: `${c.name}-${c.section} · ${c.academicYear}`,
      })),
    ];
  }, [options.classesBySchool, schoolId]);

  const schoolOptions = options.schools.map((s) => ({
    value: s.id,
    label: s.name + (s.isActive ? "" : " (inactive)"),
  }));

  const genderOptions = GENDERS.map((g) => ({
    value: g,
    label: GENDER_LABEL[g],
  }));

  async function onSubmit(values: FormValues) {
    // Client-side required checks that the Zod schema doesn't enforce.
    // (gender / schoolId are user-input; password length is checked here
    // because the server action also requires it on create.)
    if (!initial && !values.gender) {
      setError("gender", {
        type: "manual",
        message: "Gender is required",
      });
      toast.error({
        title: "Please fix the highlighted fields",
        description: "Gender is required.",
      });
      return;
    }
    if (!initial && !values.schoolId) {
      setError("schoolId", {
        type: "manual",
        message: "School is required",
      });
      toast.error({
        title: "Please fix the highlighted fields",
        description: "School is required.",
      });
      return;
    }
    if (!initial && (!values.password || values.password.length < 8)) {
      setError("password", {
        type: "manual",
        message: "Password must be at least 8 characters",
      });
      toast.error({
        title: "Please fix the highlighted fields",
        description: "Password must be at least 8 characters.",
      });
      return;
    }

    if (initial) {
      const result = await updateStudent({
        id: initial.id,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || undefined,
        admissionNo: values.admissionNo,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender,
        currentClassId: values.currentClassId || null,
        guardianName: values.guardianName || undefined,
        guardianPhone: values.guardianPhone || undefined,
        address: values.address || undefined,
        enrollInCurrentClass: values.enrollInCurrentClass,
        isActive: initial.isActive,
        // See createStudent above
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (!result.ok) {
        toast.error({
          title: "Couldn't update student",
          description: result.error,
        });
        return;
      }
      toast.success({ title: "Student updated" });
      onSaved();
      return;
    }

    const result = await createStudent({
      email: values.email,
      fullName: values.fullName,
      phone: values.phone || undefined,
      avatarUrl: values.avatarUrl || undefined,
      password: values.password || "",
      schoolId: values.schoolId,
      primaryRole: "student",
      roles: ["student"],
      admissionNo: values.admissionNo,
      dateOfBirth: values.dateOfBirth || undefined,
      gender: values.gender,
      currentClassId: values.currentClassId || undefined,
      guardianName: values.guardianName || undefined,
      guardianPhone: values.guardianPhone || undefined,
      address: values.address || undefined,
      enrollInCurrentClass: values.enrollInCurrentClass,
      // The server schema transforms dateOfBirth string → Date, but
      // TypeScript can't statically express that across the network boundary.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (!result.ok) {
      toast.error({
        title: "Couldn't create student",
        description: result.error,
      });
      return;
    }
    toast.success({ title: "Student created" });
    onSaved();
  }

  return (
    <Modal
      open
      onClose={isSubmitting ? () => undefined : onClose}
      title={initial ? "Edit student" : "Add a new student"}
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Section title="Account">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="e.g. Rahim Ahmed"
              required
              autoFocus
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="rahim@school.com"
              required
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              type="tel"
              placeholder="+880 1700 000000"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Avatar URL"
              placeholder="https://…"
              error={errors.avatarUrl?.message}
              {...register("avatarUrl")}
            />
          </div>
          {!initial && (
            <Input
              label="Initial password"
              type="password"
              placeholder="At least 8 characters"
              required
              hint="Share with the student securely; they can change it later."
              error={errors.password?.message}
              {...register("password")}
            />
          )}
        </Section>

        <Section title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Admission number"
              placeholder="e.g. ADM-2026-014"
              required
              error={errors.admissionNo?.message}
              {...register("admissionNo")}
            />
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <AppSelect
                  label="Gender"
                  placeholder="Select gender…"
                  required={!initial}
                  options={genderOptions}
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v as Gender)}
                  error={errors.gender?.message}
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <DatePicker
                label="Date of birth"
                value={field.value ?? ""}
                onChange={(v) => field.onChange(v)}
                toDate={new Date()}
                error={errors.dateOfBirth?.message}
                placeholder="Pick a date"
              />
            )}
          />
        </Section>

        <Section title="School & class">
          {variant === "super_admin" ? (
            <Controller
              control={control}
              name="schoolId"
              render={({ field }) => (
                <AppSelect
                  label="School"
                  required={!initial}
                  placeholder={
                    schoolOptions.length === 0
                      ? "No active schools"
                      : "Select school…"
                  }
                  options={schoolOptions}
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("currentClassId", "", { shouldDirty: true });
                  }}
                  error={errors.schoolId?.message}
                />
              )}
            />
          ) : (
            <Input
              label="School"
              value={options.schools[0]?.name ?? ""}
              readOnly
              disabled
              hint="Your account is locked to this school."
            />
          )}

          <Controller
            control={control}
            name="currentClassId"
            render={({ field }) => (
              <AppSelect
                label="Current class (optional)"
                hint="Pick a class to assign this student to one immediately."
                placeholder={
                  !schoolId
                    ? "Pick a school first…"
                    : classOptions.length <= 1
                    ? "No classes in this school yet"
                    : "Select class…"
                }
                options={classOptions}
                value={
                  !field.value || field.value === ""
                    ? "__none__"
                    : field.value
                }
                onValueChange={(v) =>
                  field.onChange(v === "__none__" ? "" : v)
                }
                disabled={!schoolId || classOptions.length <= 1}
                error={errors.currentClassId?.message}
              />
            )}
          />

          <label className="flex items-center gap-2 text-default text-text">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-emerald focus:ring-emerald"
              checked={!!enrollInCurrentClass}
              onChange={(e) =>
                setValue("enrollInCurrentClass", e.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={!currentClassId}
            />
            <span>
              Also write an enrollment row for the current academic year
              <span className="ml-1 text-meta text-text-subtle">
                (writes a fresh active enrollment record)
              </span>
            </span>
          </label>
          {errors.enrollInCurrentClass?.message && (
            <p className="text-meta text-danger">
              {errors.enrollInCurrentClass.message}
            </p>
          )}
        </Section>

        <Section title="Guardian">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Guardian name"
              placeholder="e.g. Karim Ahmed"
              error={errors.guardianName?.message}
              {...register("guardianName")}
            />
            <Input
              label="Guardian phone"
              type="tel"
              placeholder="+880 1700 000000"
              error={errors.guardianPhone?.message}
              {...register("guardianPhone")}
            />
          </div>
          <Input
            label="Address"
            placeholder="House 12, Road 7, Banani, Dhaka"
            error={errors.address?.message}
            {...register("address")}
          />
        </Section>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initial ? "Save changes" : "Create student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-card border border-border bg-base p-4">
      <h3 className="text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}