import { requirePermission } from "@/lib/auth-helpers";
import { listProgrammes } from "@/lib/actions/programmes";
import ProgrammesList from "@/components/admin/programmes/ProgrammesList";

export const metadata = { title: "Programmes · Admin" };

export default async function AdminProgrammesPage() {
  await requirePermission("manage_programmes");
  const programmes = await listProgrammes();

  return <ProgrammesList initialProgrammes={programmes} />;
}