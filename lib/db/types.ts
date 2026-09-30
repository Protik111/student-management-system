/**
 * Domain-level type aliases and constants that don't naturally live in
 * Prisma's generated client. Use the Prisma-generated enums where you can
 * (`import { Role } from "@prisma/client"`); this module is for places
 * that need string-literal unions instead of enum objects.
 */

import type {
  Role,
  Gender,
  EnrollmentStatus,
  ExamTerm,
  BookIssueStatus,
  AttendanceStatus,
} from "@prisma/client";

export type {
  Role,
  Gender,
  EnrollmentStatus,
  ExamTerm,
  BookIssueStatus,
  AttendanceStatus,
};

/** All role values, as a runtime array (e.g. for select-options UIs). */
export const ROLES = [
  "super_admin",
  "school_admin",
  "teacher",
  "student",
] as const satisfies readonly Role[];

export const GENDERS = ["male", "female", "other"] as const satisfies readonly Gender[];

export const ENROLLMENT_STATUSES = [
  "active",
  "graduated",
  "transferred",
  "dropped",
] as const satisfies readonly EnrollmentStatus[];

export const EXAM_TERMS = [
  "midterm",
  "final",
  "monthly",
  "annual",
  "quiz",
] as const satisfies readonly ExamTerm[];

export const BOOK_ISSUE_STATUSES = [
  "issued",
  "returned",
  "overdue",
  "lost",
] as const satisfies readonly BookIssueStatus[];

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "excused",
] as const satisfies readonly AttendanceStatus[];