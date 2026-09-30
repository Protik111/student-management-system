import { requirePermission } from "@/lib/auth-helpers";
import SchoolsList from "@/components/admin/schools/SchoolsList";
import { listSchools } from "@/lib/actions/schools";

export const metadata = { title: "Schools · Super Admin" };

export default async function SuperAdminSchoolsPage() {
  await requirePermission("manage_schools");
  const schools = await listSchools();

  return <SchoolsList initialSchools={schools} />;
}