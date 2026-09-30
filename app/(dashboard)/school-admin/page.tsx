import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "School Admin · Overview" };

export default async function SchoolAdminHome() {
  await requireRole("school_admin");
  return (
    <RoleOverview
      role="school_admin"
      tagline="Run your school — users, classes, exams, and library, all in one place."
    />
  );
}