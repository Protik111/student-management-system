import { ROLE_LABEL, type Role } from "@/lib/rbac";
import Badge from "@/components/ui/Badge";

const ROLE_TONE: Record<Role, "info" | "success" | "warning" | "default"> = {
  super_admin: "info",
  school_admin: "success",
  teacher: "warning",
  student: "default",
};

export default function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge tone={ROLE_TONE[role]} className={className}>
      {ROLE_LABEL[role]}
    </Badge>
  );
}