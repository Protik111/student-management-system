import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "My Classes · Teacher" };

export default async function TeacherClassesPage() {
  await requireRole("TEACHER");
  return (
    <ComingSoon
      sectionLabel="My Classes"
      title="My Classes"
      description="The classes you're assigned to teach — with subject rosters and per-class attendance."
      shipsWithModule={4}
      upcomingFeatures={[
        "See every class-subject you've been assigned to teach",
        "View the student roster for each class",
        "Open today's attendance session for a class in one click",
        "Quick jump into entering results for the latest exam",
      ]}
    />
  );
}