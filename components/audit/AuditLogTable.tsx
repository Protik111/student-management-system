import { format } from "date-fns";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { AuditLogItem } from "@/lib/actions/audit";

interface AuditLogTableProps {
  rows: AuditLogItem[];
  showSchool?: boolean;
}

export default function AuditLogTable({ rows, showSchool = false }: AuditLogTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No audit entries"
        description="No actions match your filters yet."
      />
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-default">
          <thead>
            <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
              <th className="px-4 py-3 text-left font-semibold">When</th>
              <th className="px-4 py-3 text-left font-semibold">Actor</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Entity</th>
              {showSchool && (
                <th className="px-4 py-3 text-left font-semibold">School</th>
              )}
              <th className="px-4 py-3 text-left font-semibold">Payload</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-base">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-meta text-text-muted">
                  {format(r.createdAt, "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-text">
                    {r.actorName ?? <span className="text-text-subtle">system</span>}
                  </div>
                  {r.actorEmail && (
                    <div className="text-meta text-text-subtle">{r.actorEmail}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral">{r.action}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-text">{r.entityType}</div>
                  {r.entityId && (
                    <div className="font-mono text-meta text-text-subtle">
                      {r.entityId.length > 16
                        ? r.entityId.slice(0, 16) + "…"
                        : r.entityId}
                    </div>
                  )}
                </td>
                {showSchool && (
                  <td className="px-4 py-3 text-text-muted">
                    {r.schoolName ?? <span className="text-text-subtle">—</span>}
                  </td>
                )}
                <td className="max-w-md px-4 py-3">
                  {r.payload ? (
                    <pre className="overflow-x-auto rounded-md bg-base p-2 font-mono text-[11px] leading-snug text-text-muted">
                      {summarizePayload(r.payload)}
                    </pre>
                  ) : (
                    <span className="text-text-subtle">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function summarizePayload(p: unknown): string {
  try {
    const obj = p as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    // Surface the most informative keys first.
    const preferred = ["name", "status", "invoiceNo", "receiptNo", "title", "marksObtained",
                       "published", "classification", "amountCents", "dueDate"];
    const sortedKeys = [
      ...preferred.filter((k) => k in obj),
      ...keys.filter((k) => !preferred.includes(k)),
    ].slice(0, 6);
    const trimmed: Record<string, unknown> = {};
    for (const k of sortedKeys) trimmed[k] = obj[k];
    return JSON.stringify(trimmed, null, 2);
  } catch {
    return "(unserializable)";
  }
}