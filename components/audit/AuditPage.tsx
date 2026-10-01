import PageHeader from "@/components/ui/PageHeader";
import AuditFilters from "@/components/audit/AuditFilters";
import AuditLogTable from "@/components/audit/AuditLogTable";
import { listAuditLogs, listEntityTypes } from "@/lib/actions/audit";

interface AuditPageProps {
  title: string;
  description: string;
  showSchool?: boolean;
  searchParams?: Promise<{
    entityType?: string;
    actorId?: string;
    from?: string;
    to?: string;
  }>;
}

/**
 * Shared audit page renderer used by /admin/audit,
 * /teacher/audit, and /student/audit. The `view_audit` permission drives
 * role-scoped reads inside `listAuditLogs`.
 */
export default async function AuditPage({
  title,
  description,
  showSchool,
  searchParams,
}: AuditPageProps) {
  const params = searchParams ? await searchParams : {};
  const [entityTypes, rows] = await Promise.all([
    listEntityTypes(),
    listAuditLogs({
      entityType: params.entityType || undefined,
      actorId: params.actorId || undefined,
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to + "T23:59:59") : undefined,
      limit: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <AuditFilters entityTypes={entityTypes} />

      <AuditLogTable rows={rows} showSchool={showSchool} />
    </div>
  );
}