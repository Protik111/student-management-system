import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-helpers";
import { dashboardPathFor } from "@/lib/rbac";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(dashboardPathFor(user.role));
}