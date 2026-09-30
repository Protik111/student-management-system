import { requirePermission } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Subjects · School Admin" };

export default async function SchoolAdminSubjectsPage() {
  await requirePermission("manage_subjects");
  return (
    <ComingSoon
      sectionLabel="Subjects"
      title="Subjects"
      description="Define the subjects offered by your school and map them to classes."
      shipsWithModule={4}
      upcomingFeatures={[
        "Define subjects with a code (unique per school) and an optional description",
        "Map a subject to one or more classes — periods-per-week defaults to 4",
        "Assign which teacher teaches which (class, subject) combination",
        "Edit subject mappings without breaking existing exam records",
      ]}
    />
  );
}