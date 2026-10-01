import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Library · Teacher" };

export default async function TeacherLibraryPage() {
  await requireRole("TEACHER");
  return (
    <ComingSoon
      sectionLabel="Issue Books"
      title="Issue &amp; Return Books"
      description="Issue books to students and teachers, track returns, and apply overdue fines."
      shipsWithModule={6}
      upcomingFeatures={[
        "Search the library catalog by title, author, or ISBN",
        "Issue a book to a student or teacher with a due date",
        "Mark a book returned and automatically clear any pending fines",
        "Overdue report with per-row fine calculations",
        "Issue / return actions are audit-logged",
      ]}
    />
  );
}