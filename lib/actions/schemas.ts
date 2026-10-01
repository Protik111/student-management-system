import { z } from "zod";

import { GENDERS, ROLES } from "@/lib/db/types";

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

/* ─── Student schemas ────────────────────────────────────────────────────── */

// Accepts YYYY-MM-DD strings, Date objects, empty string, undefined, or null.
// Anything else (including a malformed date) is rejected. `null` / `""` /
// `Date` are all normalised to either an ISO string or `undefined`.
const isoDateString = z
  .union([
    z.literal(""),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
    z.date(),
  ])
  .optional()
  .nullable()
  .transform((v) => {
    if (v == null || v === "") return undefined;
    if (v instanceof Date) {
      const iso = v.toISOString().slice(0, 10);
      return iso;
    }
    return v;
  });

function dateOnlyToDate(v: unknown): Date | undefined {
  if (typeof v !== "string" || v === "") return undefined;
  return new Date(v + "T00:00:00.000Z");
}

export const studentCreateSchema = z
  .object({
    // User account
    email: z.string().trim().toLowerCase().email("Invalid email").max(254),
    fullName: trimmedString(120).min(2, "Full name is required"),
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    avatarUrl: optionalUrl,
    password: z
      .string()
      .trim()
      .max(128)
      .optional()
      .or(z.literal("").transform(() => undefined)),

    // School (required; super admin may pick any, school admin is forced)
    schoolId: z.string().min(1, "School is required"),

    // Roles are locked at the call site by `createStudent` — see lib/actions/students.ts.
    // Made optional here so the form's zodResolver only validates user-input fields.
    primaryRole: z.literal("student").optional(),
    roles: z.array(z.enum(ROLES)).optional(),

    // Student profile
    admissionNo: trimmedString(40).min(1, "Admission number is required"),
    dateOfBirth: isoDateString,
    gender: z.enum(GENDERS).optional(),
    currentClassId: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal("").transform(() => undefined)),
    guardianName: trimmedString(60).optional(),
    guardianPhone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .nullable()
      .or(z.literal("").transform(() => undefined)),
    address: trimmedString(500).optional(),

    // Enrollment toggle (only meaningful when currentClassId is set)
    enrollInCurrentClass: z.boolean().default(false),
  })
  .refine((v) => v.enrollInCurrentClass !== true || Boolean(v.currentClassId), {
    message: "Pick a class first or uncheck 'Enroll now'",
    path: ["enrollInCurrentClass"],
  })
  .transform((v) => ({
    ...v,
    primaryRole: "student" as const,
    roles: ["student"] as const,
    dateOfBirth: dateOnlyToDate(v.dateOfBirth),
  }));

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
/** Pre-transform input shape — used by client forms that hold `dateOfBirth`
 *  as an ISO YYYY-MM-DD string. The server schema converts to Date. */
export type StudentCreateFormInput = z.input<typeof studentCreateSchema>;

export const studentUpdateSchema = z
  .object({
    id: z.string().min(1),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    fullName: trimmedString(120).optional(),
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .nullable()
      .or(z.literal("").transform(() => undefined)),
    avatarUrl: optionalUrl,
    admissionNo: trimmedString(40).optional(),
    dateOfBirth: isoDateString,
    gender: z.enum(GENDERS).optional(),
    currentClassId: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal("").transform(() => undefined)),
    guardianName: trimmedString(60).optional(),
    guardianPhone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .nullable()
      .or(z.literal("").transform(() => undefined)),
    address: trimmedString(500).optional(),
    /** Set to true to also write a new Enrollment row for currentClassId. */
    enrollInCurrentClass: z.boolean().default(false),
    isActive: z.boolean().optional(),
  })
  .transform((v) => ({
    ...v,
    dateOfBirth: dateOnlyToDate(v.dateOfBirth),
  }));

export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type StudentUpdateFormInput = z.input<typeof studentUpdateSchema>;

/* ─── Teacher schemas ────────────────────────────────────────────────────── */

export const teacherCreateSchema = z
  .object({
    // User account
    email: z.string().trim().toLowerCase().email("Invalid email").max(254),
    fullName: trimmedString(120).min(2, "Full name is required"),
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    avatarUrl: optionalUrl,
    password: z
      .string()
      .trim()
      .max(128)
      .optional()
      .or(z.literal("").transform(() => undefined)),

    schoolId: z.string().min(1, "School is required"),

    // Roles are locked at the call site by `createTeacher` — see lib/actions/teachers.ts.
    primaryRole: z.literal("teacher").optional(),
    roles: z.array(z.enum(ROLES)).optional(),

    // Teacher profile
    employeeId: trimmedString(40).min(1, "Employee ID is required"),
    qualification: trimmedString(120).optional(),
    specialization: trimmedString(120).optional(),
    salary: z
      .number()
      .int("Salary must be a whole number")
      .min(0, "Salary cannot be negative")
      .optional(),
    hireDate: isoDateString,
  })
  .transform((v) => ({
    ...v,
    primaryRole: "teacher" as const,
    roles: ["teacher"] as const,
    hireDate: dateOnlyToDate(v.hireDate),
  }));

export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
export type TeacherCreateFormInput = z.input<typeof teacherCreateSchema>;

export const teacherUpdateSchema = z
  .object({
    id: z.string().min(1),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    fullName: trimmedString(120).optional(),
    phone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    avatarUrl: optionalUrl,
    employeeId: trimmedString(40).optional(),
    qualification: trimmedString(120).optional(),
    specialization: trimmedString(120).optional(),
    salary: z
      .number()
      .int()
      .min(0)
      .optional(),
    hireDate: isoDateString,
    isActive: z.boolean().optional(),
  })
  .transform((v) => ({
    ...v,
    hireDate: dateOnlyToDate(v.hireDate),
  }));

export type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>;
export type TeacherUpdateFormInput = z.input<typeof teacherUpdateSchema>;

/* ─── Enrollment schemas ─────────────────────────────────────────────────── */

export const enrollmentCreateSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, "Use YYYY-YYYY"),
  status: z.enum(["active", "graduated", "transferred", "dropped"]).default("active"),
});

export type EnrollmentCreateInput = z.infer<typeof enrollmentCreateSchema>;
