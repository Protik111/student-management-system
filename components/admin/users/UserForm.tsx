"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { ROLE_LABEL, type Role } from "@/lib/rbac";
import {
  userCreateSchema,
  type UserCreateInput,
} from "@/lib/actions/schemas";
import {
  createUser,
  updateUser,
  type UserFormOptions,
} from "@/lib/actions/users";

interface UserFormProps {
  variant: "ADMIN";
  options: UserFormOptions;
  initial?: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    primaryRole: Role;
    roles: Role[];
    schoolId: string | null;
  };
  onClose: () => void;
  onSaved: () => void;
}

type FormValues = UserCreateInput;

export default function UserForm({
  variant,
  options,
  initial,
  onClose,
  onSaved,
}: UserFormProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const defaultSchoolId =
    variant === "ADMIN"
      ? options.schools[0]?.id ?? null
      : initial?.schoolId ?? null;

  const defaultPrimaryRole: Role =
    initial?.primaryRole ?? "TEACHER";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: initial?.email ?? "",
      fullName: initial?.fullName ?? "",
      phone: initial?.phone ?? "",
      avatarUrl: initial?.avatarUrl ?? "",
      schoolId: defaultSchoolId,
      primaryRole: defaultPrimaryRole,
      roles: initial?.roles ?? [defaultPrimaryRole],
      password: "",
    },
  });

  const primaryRole = watch("primaryRole");
  const roles = watch("roles") ?? [];

  const roleOptions = options.assignableRoles.map((r) => ({
    value: r,
    label: ROLE_LABEL[r],
  }));

  const schoolOptions = options.schools.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    if (initial) {
      const result = await updateUser({
        id: initial.id,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || undefined,
        schoolId: values.schoolId ?? null,
        primaryRole: values.primaryRole,
        roles: values.roles,
      });
      setSubmitting(false);
      if (!result.ok) {
        toast.error({
          title: "Couldn't update user",
          description: result.error,
        });
        return;
      }
      toast.success({ title: "User updated" });
      onSaved();
      return;
    }

    const result = await createUser({
      email: values.email,
      fullName: values.fullName,
      phone: values.phone || undefined,
      avatarUrl: values.avatarUrl || undefined,
      schoolId: values.schoolId ?? null,
      primaryRole: values.primaryRole,
      roles: values.roles,
      password: values.password || "",
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error({
        title: "Couldn't create user",
        description: result.error,
      });
      return;
    }
    toast.success({ title: "User created" });
    onSaved();
  }

  return (
    <Modal
      open
      onClose={submitting ? () => undefined : onClose}
      title={initial ? "Edit user" : "Add a new user"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            placeholder="e.g. Karim Rahman"
            required
            autoFocus
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="karim@school.com"
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

        {variant === "ADMIN" && (
          <Controller
            control={control}
            name="schoolId"
            render={({ field }) => (
              <AppSelect
                label="School"
                hint="Leave empty when creating a super admin."
                placeholder={
                  options.schools.length === 0
                    ? "No active schools"
                    : "Select school (or leave empty for super admin)…"
                }
                options={[
                  { value: "__none__", label: "(none — super admin)" },
                  ...schoolOptions,
                ]}
                value={field.value ?? "__none__"}
                onValueChange={(v) =>
                  field.onChange(v === "__none__" ? null : v)
                }
                error={errors.schoolId?.message}
              />
            )}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="primaryRole"
            render={({ field }) => (
              <AppSelect
                label="Primary role"
                placeholder="Select primary role…"
                options={roleOptions}
                value={field.value ?? ""}
                onValueChange={(v) => {
                  field.onChange(v);
                  // Ensure primary role is always present in `roles[]`.
                  const cur = roles ?? [];
                  if (!cur.includes(v as Role)) {
                    setValue("roles", [...cur, v as Role], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={errors.primaryRole?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="roles"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <span className="text-meta font-semibold uppercase tracking-[0.06em] text-text-muted">
                  All roles
                </span>
                <div className="flex flex-wrap gap-2 rounded-chip border border-border bg-card px-3 py-2.5">
                  {options.assignableRoles.map((r) => {
                    const checked = (field.value ?? []).includes(r);
                    const isPrimary = primaryRole === r;
                    return (
                      <label
                        key={r}
                        className={`inline-flex items-center gap-2 rounded-pill border px-3 py-1 text-meta cursor-pointer transition-colors ${
                          checked
                            ? "border-emerald bg-emerald-bg text-emerald"
                            : "border-border-strong text-text-muted hover:border-emerald"
                        } ${isPrimary ? "ring-1 ring-emerald" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const cur = field.value ?? [];
                            const next = e.target.checked
                              ? Array.from(new Set([...cur, r]))
                              : cur.filter((x) => x !== r);
                            // Prevent un-checking the primary role — must be in roles[]
                            if (isPrimary && !e.target.checked) return;
                            field.onChange(next);
                          }}
                        />
                        {ROLE_LABEL[r]}
                      </label>
                    );
                  })}
                </div>
                {errors.roles?.message && (
                  <p className="text-meta text-danger">{errors.roles.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {!initial && (
          <Input
            label="Initial password"
            type="password"
            placeholder="At least 8 characters"
            required
            hint="Share with the user securely; they can change it later."
            error={errors.password?.message}
            {...register("password")}
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initial ? "Save changes" : "Create user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}