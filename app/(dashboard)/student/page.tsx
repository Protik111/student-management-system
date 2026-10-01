import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "Student · Overview" };

export default async function StudentHome() {
  await requireRole("STUDENT");
  return (
    <RoleOverview
      role="STUDENT"
      tagline="See your results, attendance, and library loans."
    />
  );
}