import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "Student · Overview" };

export default async function StudentHome() {
  await requireRole("student");
  return (
    <RoleOverview
      role="student"
      tagline="See your results, attendance, and library loans."
    />
  );
}