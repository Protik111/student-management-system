import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-helpers";
import { ROLE_HOME } from "@/lib/rbac";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Defensive: if the session is missing a role (e.g. an old JWT issued before
  // we stored it, or a cookie cleared mid-flight), fall back to /login instead
  // of redirecting to `/undefined` via ROLE_HOME[undefined].
  const path = ROLE_HOME[user.role] ?? "/login";
  redirect(path);
}