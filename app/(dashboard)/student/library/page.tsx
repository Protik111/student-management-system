import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "My Library · Student" };

export default async function StudentLibraryPage() {
  await requireRole("STUDENT");
  return (
    <ComingSoon
      sectionLabel="Library Loans"
      title="My Library Loans"
      description="Books you've borrowed, their due dates, and any outstanding fines."
      shipsWithModule={6}
      upcomingFeatures={[
        "See every book currently issued to you with its due date",
        "Overdue items highlighted with the calculated fine",
        "History of returned books for the academic year",
        "Read-only — request a new issue through your teacher",
      ]}
    />
  );
}