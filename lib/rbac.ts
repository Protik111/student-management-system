import type { Role } from "@/lib/db/types";

export type { Role } from "@/lib/db/types";

/**
 * Permission matrix. Each action lists the roles that can perform it.
 * Used by `can()` to gate UI affordances and by `requirePermission()` on the server.
 */
export const PERMISSIONS = {
  manage_schools: ["super_admin"],
  manage_users: ["super_admin", "school_admin"],
  manage_students: ["super_admin", "school_admin"],
  manage_teachers: ["super_admin", "school_admin"],
  manage_classes: ["super_admin", "school_admin"],
  manage_subjects: ["super_admin", "school_admin"],
  manage_exams: ["super_admin", "school_admin"],
  enter_results: ["super_admin", "school_admin", "teacher"],
  view_results: ["super_admin", "school_admin", "teacher", "student"],
  generate_report_cards: ["super_admin", "school_admin"],
  manage_attendance: ["super_admin", "school_admin", "teacher"],
  view_attendance: ["super_admin", "school_admin", "teacher", "student"],
  manage_books: ["super_admin", "school_admin", "teacher"],
  issue_books: ["super_admin", "school_admin", "teacher"],
  view_library: ["super_admin", "school_admin", "teacher", "student"],
  view_dashboard: ["super_admin", "school_admin", "teacher", "student"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

/** Returns true when the role is allowed to perform the given action. */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/** Human label, used in UI. */
export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  student: "Student",
};

/** Default dashboard path per role (used by login redirect & sidebar). */
export const ROLE_HOME: Record<Role, string> = {
  super_admin: "/super-admin",
  school_admin: "/school-admin",
  teacher: "/teacher",
  student: "/student",
};

/** Convenience: where should this user land after login? */
export function dashboardPathFor(role: Role): string {
  return ROLE_HOME[role];
}

/** Sidebar nav items per role. Module-specific entries will be added in later modules. */
export const ROLE_NAV: Record<Role, { href: string; label: string }[]> = {
  super_admin: [
    { href: "/super-admin", label: "Overview" },
    { href: "/super-admin/schools", label: "Schools" },
    { href: "/super-admin/users", label: "Users" },
  ],
  school_admin: [
    { href: "/school-admin", label: "Overview" },
    { href: "/school-admin/users", label: "Users" },
    { href: "/school-admin/students", label: "Students" },
    { href: "/school-admin/teachers", label: "Teachers" },
    { href: "/school-admin/classes", label: "Classes" },
    { href: "/school-admin/subjects", label: "Subjects" },
    { href: "/school-admin/exams", label: "Exams" },
    { href: "/school-admin/library", label: "Library" },
  ],
  teacher: [
    { href: "/teacher", label: "Overview" },
    { href: "/teacher/classes", label: "My Classes" },
    { href: "/teacher/attendance", label: "Attendance" },
    { href: "/teacher/results", label: "Enter Results" },
    { href: "/teacher/library", label: "Library" },
  ],
  student: [
    { href: "/student", label: "Overview" },
    { href: "/student/results", label: "My Results" },
    { href: "/student/attendance", label: "My Attendance" },
    { href: "/student/library", label: "Library" },
  ],
};