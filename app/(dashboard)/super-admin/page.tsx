import { requireRole } from "@/lib/auth-helpers";
import RoleOverview from "@/components/shell/RoleOverview";

export const metadata = { title: "Super Admin · Overview" };

export default async function SuperAdminHome() {
  await requireRole("super_admin");
  return (
    <RoleOverview
      role="super_admin"
      tagline="Manage every school in the platform and global configuration."
    />
  );
}