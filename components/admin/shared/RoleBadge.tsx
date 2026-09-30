import Badge from "@/components/ui/Badge";
import { ROLE_LABEL, type Role } from "@/lib/rbac";

const ROLE_TONE: Record<Role, "default" | "success" | "warning" | "danger" | "info" | "neutral"> = {
  super_admin: "danger",
  school_admin: "info",
  teacher: "success",
  student: "neutral",
};

/** Small coloured chip that renders a role in a consistent style across lists. */
export default function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Badge>;
}