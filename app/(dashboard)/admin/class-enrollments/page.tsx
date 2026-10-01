import { requirePermission } from "@/lib/auth-helpers";
import SchoolEnrollmentsList from "@/components/admin/enrollments/SchoolEnrollmentsList";
import { listEnrollmentsForSchool } from "@/lib/actions/enrollments";

export const metadata = { title: "Enrollments · School Admin" };

export default async function SchoolAdminEnrollmentsPage() {
  await requirePermission("manage_enrollments");
  const initial = await listEnrollmentsForSchool();

  return <SchoolEnrollmentsList initialEnrollments={initial} />;
}