import { requirePermission } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Exams · School Admin" };

export default async function SchoolAdminExamsPage() {
  await requirePermission("manage_exams");
  return (
    <ComingSoon
      sectionLabel="Exams"
      title="Exams &amp; Report Cards"
      description="Schedule exams, attach subjects and classes, and publish report cards."
      shipsWithModule={5}
      upcomingFeatures={[
        "Create an exam with term, dates, and academic year (uniqueness enforced per school)",
        "Attach subjects and classes with max-marks and pass-marks defaults",
        "Lock the exam window so teachers can finalize entries",
        "Generate report cards per (exam, student) with total, percentage, and grade",
        "Publish — the moment results appear in the student portal",
      ]}
    />
  );
}