import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Take Attendance · Teacher" };

export default async function TeacherAttendancePage() {
  await requireRole("TEACHER");
  return (
    <ComingSoon
      sectionLabel="Take Attendance"
      title="Take Attendance"
      description="Open today's attendance session, mark each student present or absent, and submit."
      shipsWithModule={5}
      upcomingFeatures={[
        "One session per class per day — open in one click from My Classes",
        "Mark Present / Absent / Late / Excused per student",
        "Optional bulk actions (mark all present, then mark exceptions)",
        "Session locks automatically after school hours",
        "Audit-logged: edits write an AttendanceEntry diff record",
      ]}
    />
  );
}