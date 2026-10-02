import type { Role } from "@/lib/db/types";

export type { Role } from "@/lib/db/types";

/**
 * Permission matrix. Each action lists the roles that can perform it.
 * Used by `can()` to gate UI affordances and by `requirePermission()` on the server.
 *
 * After the role collapse, ADMIN is the merged former super_admin + school_admin.
 */
export const PERMISSIONS = {
  // === Schools / Users ===
  manage_schools: ["ADMIN"],
  manage_users: ["ADMIN"],
  manage_programmes: ["ADMIN"],
  manage_students: ["ADMIN"],
  manage_teachers: ["ADMIN"],
  manage_classes: ["ADMIN"],
  manage_subjects: ["ADMIN"],
  manage_exams: ["ADMIN"],
  enter_results: ["ADMIN", "TEACHER"],
  view_results: ["ADMIN", "TEACHER", "STUDENT"],
  generate_report_cards: ["ADMIN"],
  manage_attendance: ["ADMIN", "TEACHER"],
  view_attendance: ["ADMIN", "TEACHER", "STUDENT"],
  manage_books: ["ADMIN", "TEACHER"],
  issue_books: ["ADMIN", "TEACHER"],
  view_library: ["ADMIN", "TEACHER", "STUDENT"],
  view_dashboard: ["ADMIN", "TEACHER", "STUDENT"],
  manage_fees: ["ADMIN"],
  view_own_fees: ["STUDENT"],
  manage_assessments: ["ADMIN", "TEACHER"],
  submit_assessment: ["STUDENT"],
  publish_results: ["ADMIN", "TEACHER"],
  view_audit: ["ADMIN", "TEACHER", "STUDENT"],
  manage_enrollments: ["ADMIN"],
  import_students: ["ADMIN"],

  // === Course marketplace (assessment points 2, 3, 4) ===
  /** Create / edit own courses. ADMIN edits any, TEACHER edits own only. */
  manage_courses: ["ADMIN", "TEACHER"],
  /** Hard-delete any course (admin-only). */
  delete_courses: ["ADMIN"],
  /** Read access to the catalogue. STUDENT sees un-enrolled too. */
  view_courses: ["ADMIN", "TEACHER", "STUDENT"],
  /** CRUD course categories (admin-only). */
  manage_categories: ["ADMIN"],
  /** Student clicks "Enroll" on a course detail page. */
  enroll_self: ["STUDENT"],
  /** Admin or teacher manually adds a student to a course. */
  add_student_to_course: ["ADMIN", "TEACHER"],
  /** See who is enrolled in a course. */
  view_course_enrollments: ["ADMIN", "TEACHER"],
  /** Upload materials to a course. */
  manage_materials: ["ADMIN", "TEACHER"],
  /** Delete any material regardless of uploader (admin-only). */
  delete_any_material: ["ADMIN"],
  /** Delete a material you uploaded (teacher / admin of own). */
  delete_own_material: ["ADMIN", "TEACHER"],
  /** Read access to materials (further gated by enrollment server-side). */
  view_course_materials: ["ADMIN", "TEACHER", "STUDENT"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

/** Returns true when the role is allowed to perform the given action. */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/** Human label, used in UI. */
export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

/** Default dashboard path per role (used by login redirect & sidebar). */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

/** Convenience: where should this user land after login? */
export function dashboardPathFor(role: Role): string {
  return ROLE_HOME[role];
}

/**
 * Sidebar nav items per role. The merged ADMIN role exposes the union of former
 * super_admin + school_admin surfaces. Course marketplace links are included.
 */
export const ROLE_NAV: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/programmes", label: "Programmes" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/enrollments", label: "Enrollments" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/teachers", label: "Teachers" },
    { href: "/admin/fees", label: "Fees" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/audit", label: "Audit Log" },
  ],
  TEACHER: [
    { href: "/teacher", label: "Overview" },
    { href: "/teacher/courses", label: "My Courses" },
    { href: "/teacher/assessments", label: "Assessments" },
    { href: "/teacher/results", label: "Enter Results" },
    { href: "/teacher/classes", label: "My Classes" },
    { href: "/teacher/attendance", label: "Attendance" },
    { href: "/teacher/library", label: "Library" },
  ],
  STUDENT: [
    { href: "/student", label: "Overview" },
    { href: "/student/courses", label: "My Courses" },
    { href: "/student/browse", label: "Browse Courses" },
    { href: "/student/assessments", label: "My Assessments" },
    { href: "/student/results", label: "My Results" },
    { href: "/student/fees", label: "My Fees" },
    { href: "/student/attendance", label: "My Attendance" },
    { href: "/student/library", label: "Library" },
  ],
};