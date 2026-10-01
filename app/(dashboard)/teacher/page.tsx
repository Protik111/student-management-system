import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "Teacher · Overview" };

export default async function TeacherHome() {
  await requireRole("TEACHER");
  return (
    <RoleOverview
      role="TEACHER"
      tagline="Take attendance, enter marks, and issue library books."
    />
  );
}