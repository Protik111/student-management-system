"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import DatePicker from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";
import { teacherCreateSchema, type TeacherCreateFormInput } from "@/lib/actions/schemas";
import {
  createTeacher,
  updateTeacher,
  type TeacherFormOptions,
} from "@/lib/actions/teachers";

interface TeacherFormProps {
  variant: "super_admin" | "school_admin";
  options: TeacherFormOptions;
  initial?: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    schoolId: string;
    employeeId: string;
    qualification: string | null;
    specialization: string | null;
    salary: number | null;
    hireDate: Date | null;
  };
  onClose: () => void;
  onSaved: () => void;
}

function dateToIso(d: Date | null | undefined): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

/** Form-local shape mirrors pre-transform input. `hireDate` is held as ISO
 *  YYYY-MM-DD and converted to a Date by the server schema's `.transform()`. */
type FormValues = TeacherCreateFormInput;

export default function TeacherForm({
  variant,
  options,
  initial,
  onClose,
  onSaved,
}: TeacherFormProps) {
  const toast = useToast();

  const defaultSchoolId =
    variant === "school_admin"
      ? options.schools[0]?.id ?? ""
      : initial?.schoolId ?? "";

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(teacherCreateSchema) as never,
    defaultValues: {
      email: initial?.email ?? "",
      fullName: initial?.fullName ?? "",
      phone: initial?.phone ?? "",
      avatarUrl: initial?.avatarUrl ?? "",
      password: "",
      schoolId: defaultSchoolId,
      employeeId: initial?.employeeId ?? "",
      qualification: initial?.qualification ?? "",
      specialization: initial?.specialization ?? "",
      salary: initial?.salary ?? undefined,
      hireDate: dateToIso(initial?.hireDate),
    },
  });

  const schoolOptions = options.schools.map((s) => ({
    value: s.id,
    label: s.name + (s.isActive ? "" : " (inactive)"),
  }));

  async function onSubmit(values: FormValues) {
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
      const result = await updateTeacher({
        id: initial.id,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || undefined,
        employeeId: values.employeeId,
        qualification: values.qualification || undefined,
        specialization: values.specialization || undefined,
        salary: values.salary,
        hireDate: values.hireDate || undefined,
        isActive: initial.isActive,
        // See createTeacher above
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (!result.ok) {
        toast.error({
          title: "Couldn't update teacher",
          description: result.error,
        });
        return;
      }
      toast.success({ title: "Teacher updated" });
      onSaved();
      return;
    }

    const result = await createTeacher({
      email: values.email,
      fullName: values.fullName,
      phone: values.phone || undefined,
      avatarUrl: values.avatarUrl || undefined,
      password: values.password || "",
      schoolId: values.schoolId,
      primaryRole: "teacher",
      roles: ["teacher"],
      employeeId: values.employeeId,
      qualification: values.qualification || undefined,
      specialization: values.specialization || undefined,
      salary: values.salary,
      hireDate: values.hireDate || undefined,
      // Server schema transforms hireDate string → Date.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (!result.ok) {
      toast.error({
        title: "Couldn't create teacher",
        description: result.error,
      });
      return;
    }
    toast.success({ title: "Teacher created" });
    onSaved();
  }

  return (
    <Modal
      open
      onClose={isSubmitting ? () => undefined : onClose}
      title={initial ? "Edit teacher" : "Add a new teacher"}
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Section title="Account">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="e.g. Ayesha Siddiqua"
              required
              autoFocus
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="ayesha@school.com"
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
              hint="Share with the teacher securely; they can change it later."
              error={errors.password?.message}
              {...register("password")}
            />
          )}
        </Section>

        <Section title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Employee ID"
              placeholder="e.g. EMP-2026-007"
              required
              error={errors.employeeId?.message}
              {...register("employeeId")}
            />
            <Controller
              control={control}
              name="hireDate"
              render={({ field }) => (
                <DatePicker
                  label="Hire date"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                  toDate={new Date()}
                  error={errors.hireDate?.message}
                  placeholder="Pick a date"
                />
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Qualification"
              placeholder="e.g. M.Sc. in Mathematics"
              error={errors.qualification?.message}
              {...register("qualification")}
            />
            <Input
              label="Specialization"
              placeholder="e.g. Algebra, statistics"
              error={errors.specialization?.message}
              {...register("specialization")}
            />
          </div>
          <Controller
            control={control}
            name="salary"
            render={({ field }) => (
              <Input
                label="Salary (cents)"
                type="number"
                min={0}
                step={1}
                placeholder="e.g. 3000000"
                hint="Stored as an integer (cents). Leave empty if unknown."
                value={
                  field.value === undefined || field.value === null
                    ? ""
                    : String(field.value)
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === "" ? undefined : Number(raw));
                }}
                error={errors.salary?.message}
              />
            )}
          />
        </Section>

        <Section title="School">
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
                  onValueChange={(v) => field.onChange(v)}
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
        </Section>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initial ? "Save changes" : "Create teacher"}
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