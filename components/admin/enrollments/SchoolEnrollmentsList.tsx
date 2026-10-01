"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Filter } from "lucide-react";

import AppSelect from "@/components/ui/AppSelect";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import EnrollmentStatusControl from "@/components/admin/enrollments/EnrollmentStatusControl";
import {
  type EnrollmentListItem,
  type EnrollmentStatus,
} from "@/lib/actions/enrollments";

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  active: "Active",
  graduated: "Graduated",
  transferred: "Transferred",
  dropped: "Dropped",
};

const STATUS_TONE: Record<
  EnrollmentStatus,
  "success" | "info" | "warning" | "neutral"
> = {
  active: "success",
  graduated: "info",
  transferred: "warning",
  dropped: "neutral",
};

interface SchoolEnrollmentsListProps {
  initialEnrollments: EnrollmentListItem[];
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "graduated", label: "Graduated" },
  { value: "transferred", label: "Transferred" },
  { value: "dropped", label: "Dropped" },
];

export default function SchoolEnrollmentsList({
  initialEnrollments,
}: SchoolEnrollmentsListProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return initialEnrollments;
    return initialEnrollments.filter((e) => e.status === statusFilter);
  }, [initialEnrollments, statusFilter]);

  function onChange() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        description="Every student placement across the academic year — manage active, graduated, transferred, and dropped statuses."
        actions={
          <AppSelect
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Filter by status"
          />
        }
      />

      <div className="flex items-center gap-2 text-meta text-text-subtle">
        <Filter className="h-3.5 w-3.5" aria-hidden />
        Showing {filtered.length} of {initialEnrollments.length}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No enrollments match"
          description="Try clearing the status filter, or admit a new student to start."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Class</th>
                <th className="px-4 py-3 text-left font-semibold">Academic year</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Enrolled</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-base">
                  <td className="px-4 py-3.5 font-medium text-text">
                    {e.studentName}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-text">
                      {e.className}-{e.classSection}
                    </div>
                    <div className="text-meta text-text-subtle">
                      Grade {e.classGradeLevel}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-meta text-text-muted">
                    {e.academicYear}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={STATUS_TONE[e.status]}>
                      {STATUS_LABEL[e.status]}
                    </Badge>
                    {e.leftAt && (
                      <div className="mt-0.5 text-meta text-text-subtle">
                        Left {format(e.leftAt, "PP")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-text-muted">
                    {format(e.enrolledAt, "PP")}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <EnrollmentStatusControl
                      enrollmentId={e.id}
                      currentStatus={e.status}
                      onChanged={onChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}