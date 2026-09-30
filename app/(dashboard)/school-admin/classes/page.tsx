import { requirePermission } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Classes · School Admin" };

export default async function SchoolAdminClassesPage() {
  await requirePermission("manage_classes");
  return (
    <ComingSoon
      sectionLabel="Classes"
      title="Classes"
      description="Provision classes per grade and section, set capacity, and assign class teachers."
      shipsWithModule={4}
      upcomingFeatures={[
        "Create classes per (grade, section, academic year) — uniqueness enforced per school",
        "Assign a class teacher from the teacher roster",
        "View the student roster and subject assignments per class",
        "Promote or graduate students in bulk at year-end",
      ]}
    />
  );
}