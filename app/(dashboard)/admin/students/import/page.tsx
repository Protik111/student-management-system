import CsvImportWizard from "@/components/students/CsvImportWizard";
import { requirePermission } from "@/lib/auth-helpers";

export const metadata = { title: "Import Students · School Admin" };

export default async function SchoolAdminImportStudentsPage() {
  await requirePermission("import_students");
  return <CsvImportWizard variant="ADMIN" hrefBack="/admin/students" />;
}