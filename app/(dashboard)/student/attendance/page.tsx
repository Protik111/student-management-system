import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "My Attendance · Student" };

export default async function StudentAttendancePage() {
  await requireRole("STUDENT");
  return (
    <ComingSoon
      sectionLabel="My Attendance"
      title="My Attendance"
      description="Your attendance history — present, absent, late, excused — by class and date."
      shipsWithModule={5}
      upcomingFeatures={[
        "Calendar view with color-coded status per day",
        "Per-class attendance percentage for the current term",
        "Excused-absence requests submitted to the school admin",
        "Read-only — your teacher is the source of truth",
      ]}
    />
  );
}