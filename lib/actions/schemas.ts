import { z } from "zod";

import { ROLES } from "@/lib/db/types";

/* ─── Shared primitives ──────────────────────────────────────────────────── */

const trimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`);

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be a valid http(s) URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email")
  .optional()
  .or(z.literal("").transform(() => undefined));

/* ─── School schemas ─────────────────────────────────────────────────────── */

export const schoolCreateSchema = z.object({
  name: trimmedString(120).min(2, "Name must be at least 2 characters"),
  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  contactEmail: optionalEmail,
  contactPhone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  logoUrl: optionalUrl,
  isActive: z.boolean().default(true),
});

export type SchoolCreateInput = z.infer<typeof schoolCreateSchema>;

export const schoolUpdateSchema = schoolCreateSchema.partial().extend({
  id: z.string().min(1),
});

export type SchoolUpdateInput = z.infer<typeof schoolUpdateSchema>;

/* ─── User schemas ───────────────────────────────────────────────────────── */

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);

export const userCreateSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email")
      .max(254),
    fullName: trimmedString(120).min(2, "Full name is required"),
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    avatarUrl: optionalUrl,
    /** May be null only for super_admin-primary users created by another super_admin. */
    schoolId: z.string().min(1).nullable().optional(),
    primaryRole: z.enum(ROLES),
    /** All roles the user should have; must include primaryRole. */
    roles: z.array(z.enum(ROLES)).min(1, "At least one role is required"),
    password: passwordSchema.optional(),
  })
  .refine((v) => v.roles.includes(v.primaryRole), {
    message: "Primary role must be one of the assigned roles",
    path: ["primaryRole"],
  })
  .refine((v) => Boolean(v.password && v.password.length >= 8), {
    message: "Password is required and must be at least 8 characters",
    path: ["password"],
  });

export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z
  .object({
    id: z.string().min(1),
    email: z.string().trim().toLowerCase().email("Invalid email").max(254).optional(),
    fullName: trimmedString(120).optional(),
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    avatarUrl: optionalUrl,
    schoolId: z.string().min(1).nullable().optional(),
    primaryRole: z.enum(ROLES).optional(),
    roles: z.array(z.enum(ROLES)).min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (v) => v.primaryRole === undefined || v.roles === undefined || v.roles.includes(v.primaryRole),
    {
      message: "Primary role must be one of the assigned roles",
      path: ["primaryRole"],
    },
  );

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const resetPasswordResponseSchema = z.object({
  userId: z.string(),
  tempPassword: z.string(),
});
