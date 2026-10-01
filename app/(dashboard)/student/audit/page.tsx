import AuditPage from "@/components/audit/AuditPage";

export const metadata = { title: "Audit Log · Student" };

interface Props {
  searchParams: Promise<{
    entityType?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function StudentAuditPage({ searchParams }: Props) {
  return (
    <AuditPage
      title="Activity log"
      description="A read-only history of actions taken on your account and in your school."
      searchParams={searchParams}
    />
  );
}