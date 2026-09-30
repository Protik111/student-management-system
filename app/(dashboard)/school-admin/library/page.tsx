import { requirePermission } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "Library · School Admin" };

export const dynamic = "force-dynamic";

export default async function SchoolAdminLibraryPage() {
  await requirePermission("manage_books");
  return (
    <ComingSoon
      sectionLabel="Library"
      title="Library"
      description="Manage the book catalog, track copies, and review overdue loans."
      shipsWithModule={6}
      upcomingFeatures={[
        "Add books with title, author, ISBN, total copies, and shelf location",
        "Search the catalog and check available copies in real time",
        "Bulk import via CSV (title, author, isbn, copies)",
        "Overdue report with a fine calculator (cents-per-day)",
        "Issue and return actions are audit-logged per book",
      ]}
    />
  );
}