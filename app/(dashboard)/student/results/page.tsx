import { requireRole } from "@/lib/auth-helpers";
import ComingSoon from "@/components/shell/ComingSoon";

export const metadata = { title: "My Results · Student" };

export default async function StudentResultsPage() {
  await requireRole("student");
  return (
    <ComingSoon
      sectionLabel="My Results"
      title="My Results"
      description="Every published exam result — by subject and exam — with your report card summary."
      shipsWithModule={5}
      upcomingFeatures={[
        "See every published exam and your marks per subject",
        "View grade and rank within your class",
        "Download your latest report card as a PDF",
        "No data appears here until the school admin publishes the exam",
      ]}
    />
  );
}