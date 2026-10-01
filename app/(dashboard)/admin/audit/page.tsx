import AuditPage from "@/components/audit/AuditPage";

export const metadata = { title: "Audit Log · School Admin" };

interface Props {
  searchParams: Promise<{
    entityType?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function SchoolAdminAuditPage({ searchParams }: Props) {
  return (
    <AuditPage
      title="Audit log"
      description="Every action recorded against your school."
      searchParams={searchParams}
    />
  );
}