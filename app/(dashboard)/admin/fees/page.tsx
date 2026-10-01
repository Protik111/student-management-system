import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { listFeeStructures } from "@/lib/actions/fees";
import FeesHub from "@/components/fees/FeesHub";

export const metadata = { title: "Fees · School Admin" };

export default async function SchoolAdminFeesPage() {
  const me = await requirePermission("manage_fees");

  const classes = me.schoolId
    ? await prisma.class.findMany({
        where: { schoolId: me.schoolId },
        select: { id: true, name: true, section: true },
        orderBy: [{ name: "asc" }, { section: "asc" }],
      })
    : [];

  const structures = await listFeeStructures();

  return (
    <FeesHub
      initialStructures={structures}
      classOptions={classes.map((c) => ({
        id: c.id,
        label: `${c.name}-${c.section}`,
      }))}
    />
  );
}