import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "Admin · Overview" };

export default async function AdminHome() {
  await requireRole("ADMIN");
  return (
    <RoleOverview
      role="ADMIN"
      tagline="Run the platform — schools, users, courses, and operations."
    />
  );
}