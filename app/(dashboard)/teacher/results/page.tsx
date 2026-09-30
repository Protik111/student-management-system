import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Enter Results · Teacher" };

export default async function TeacherResultsPage() {
  await requireRole("teacher");
  return (
    <ComingSoon
      sectionLabel="Enter Results"
      title="Enter Results"
      description="Enter and update marks for the exam subjects you're responsible for."
      shipsWithModule={5}
      upcomingFeatures={[
        "Pick an exam, then enter marks per student per subject",
        "Inline validation against the exam's pass marks",
        "Save partial progress without locking the sheet",
        "Editable until the school admin publishes the report card",
        "Each entry is audit-logged with the entering teacher",
      ]}
    />
  );
}