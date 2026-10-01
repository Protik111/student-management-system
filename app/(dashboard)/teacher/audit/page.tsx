import AuditPage from "@/components/audit/AuditPage";

export const metadata = { title: "Audit Log · Teacher" };

interface Props {
  searchParams: Promise<{
    entityType?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function TeacherAuditPage({ searchParams }: Props) {
  return (
    <AuditPage
      title="Audit log"
      description="Everything you've done — grade entries, assessment publishes, etc."
      searchParams={searchParams}
    />
  );
}