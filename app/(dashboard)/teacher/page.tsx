import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "Teacher · Overview" };

export default async function TeacherHome() {
  await requireRole("teacher");
  return (
    <RoleOverview
      role="teacher"
      tagline="Take attendance, enter marks, and issue library books."
    />
  );
}